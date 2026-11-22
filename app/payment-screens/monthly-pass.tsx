import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Toast } from "toastify-react-native";

import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import PaymentPollingOverlay from "@/components/payment/PaymentPollingOverlay";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { checkoutMonthlyPass, getMyMonthlyPass } from "@/api/monthlyPassThunks";
import { MonthlyPass } from "@/components/typings/apiResponse";
import { formatKoboAsNaira } from "@/utils/currency";

const DAY_MS = 24 * 60 * 60 * 1000;
const PASS_DAYS = 30;
const POLL_MS = 3000;
// After this, the overlay says Paystack is taking a while (polling goes on).
const SLOW_CONFIRM_MS = 60 * 1000;

const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/**
 * M04 · Buy a monthly pass for one pitch.
 * Params: `locationId` (required), `locationName` for the card, and
 * `holdSessionId` when coming from a session (buy-to-join, M06).
 */
export default function MonthlyPassScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();

  const { locationId, locationName, holdSessionId, coverBy } =
    useLocalSearchParams<{
      locationId: string;
      locationName?: string;
      holdSessionId?: string;
      /** ISO time the pass must cover (a captain's session start). */
      coverBy?: string;
    }>();

  const { myPass, loadingMyPass, loadingCheckout, errorMyPass } =
    useAppSelector((s) => s.monthlyPass);
  // Only use data loaded for this pitch.
  const passInfo = myPass?.locationId === locationId ? myPass : null;

  // The pass we opened a checkout for, waiting for the webhook to land.
  const [awaitingPassId, setAwaitingPassId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [waitedLong, setWaitedLong] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (locationId) dispatch(getMyMonthlyPass({ locationId }));
  }, [dispatch, locationId]);

  // Payment is confirmed only by the webhook: poll monthly-pass/me until the
  // pass shows up as current or queued.
  useEffect(() => {
    if (!awaitingPassId || !locationId) return;
    setWaitedLong(false);
    pollRef.current = setInterval(() => {
      dispatch(getMyMonthlyPass({ locationId }));
    }, POLL_MS);
    const slowTimer = setTimeout(() => setWaitedLong(true), SLOW_CONFIRM_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      clearTimeout(slowTimer);
    };
  }, [awaitingPassId, locationId, dispatch]);

  useEffect(() => {
    if (!awaitingPassId || !passInfo) return;
    const landed =
      passInfo.current?._id === awaitingPassId ||
      passInfo.queued.some((p) => p._id === awaitingPassId);
    if (landed) {
      setAwaitingPassId(null);
      setConfirmed(true);
    }
  }, [awaitingPassId, passInfo]);

  // The pass being bought starts when the player's last pass here ends
  // (buying early never loses days), otherwise now.
  const lastPass: MonthlyPass | null =
    [passInfo?.current, ...(passInfo?.queued ?? [])]
      .filter((p): p is MonthlyPass => Boolean(p))
      .sort((a, b) => b.endsAt.localeCompare(a.endsAt))[0] ?? null;
  const now = new Date();
  const startsAt = lastPass ? new Date(lastPass.endsAt) : now;
  const endsAt = new Date(startsAt.getTime() + PASS_DAYS * DAY_MS);
  const isRenewal = Boolean(lastPass);

  const price = passInfo?.price ?? null;
  const serviceFee = price ? price.commissionAmount + price.processingFee : 0;

  const handlePay = async () => {
    if (!locationId) return;
    try {
      const result = await dispatch(
        checkoutMonthlyPass({ locationId, holdSessionId }),
      ).unwrap();
      if (result.alreadyPaid) {
        // An earlier page was paid; the server confirmed it. No Paystack.
        dispatch(getMyMonthlyPass({ locationId }));
        setConfirmed(true);
        return;
      }
      setAwaitingPassId(result.passId);
      await WebBrowser.openBrowserAsync(result.authorizationUrl);
      // Back from Paystack: the poll keeps checking for the pass.
      dispatch(getMyMonthlyPass({ locationId }));
    } catch (err: any) {
      const code: string | undefined = err?.details?.code;
      // Things changed since this screen loaded: show the latest.
      if (code === "PASS_SALES_PAUSED" || code === "NOT_A_MONTHLY_PITCH") {
        dispatch(getMyMonthlyPass({ locationId }));
      }
      // Already covered for the game: no need to buy, just join.
      if (code === "ALREADY_HAS_PASS") {
        Toast.show({
          type: "info",
          text1: "You already have a pass for this game",
          text2: "Go back and tap Join Session.",
        });
        router.back();
        return;
      }
      const friendly: Record<string, [string, string]> = {
        PASS_SALES_PAUSED: [
          "Pass sales are paused",
          "The owner has paused pass sales at this pitch.",
        ],
        NOT_A_MONTHLY_PITCH: [
          "No passes here",
          "This pitch doesn't sell monthly passes any more.",
        ],
        SESSION_FULL: [
          "That game is full",
          "There's no spot left to hold. You can still buy a pass for other games here.",
        ],
        SESSION_CLOSED: [
          "That game has closed",
          "It has started, finished or been cancelled.",
        ],
        ALREADY_IN_SESSION: [
          "You're already in that game",
          "Go back to see it.",
        ],
        PASS_WOULD_NOT_COVER: [
          "This pass wouldn't cover that game",
          "A pass bought now would end before the game starts.",
        ],
      };
      const [title, message] = (code && friendly[code]) || [
        "Couldn't open payment",
        err?.msg || "Please try again.",
      ];
      Toast.show({ type: "error", text1: title, text2: message });
    }
  };

  // Reopens the same Paystack page (the server returns the open checkout).
  const handleRetry = () => {
    setAwaitingPassId(null);
    handlePay();
  };

  const handleDismiss = () => {
    setAwaitingPassId(null);
    setConfirmed(false);
    router.back();
  };

  const screenBg = isDark ? "#000" : "#F0FDF7";
  const cardBg = isDark ? "#111" : "#FFFFFF";
  const mutedColor = isDark ? "#9CA3AF" : "#7C8483";
  const accent = "#00FF94";

  // A captain's session must fall inside the pass (startsAt ≤ t < endsAt).
  const coverByDate = coverBy ? new Date(coverBy) : null;
  const wouldNotCover =
    coverByDate != null &&
    !Number.isNaN(coverByDate.getTime()) &&
    coverByDate.getTime() >= endsAt.getTime();

  const salesClosedMessage = passInfo
    ? !passInfo.isMonthlyPitch
      ? "This pitch doesn't sell monthly passes."
      : passInfo.salesPaused
        ? "The owner has paused pass sales at this pitch for now."
        : wouldNotCover && coverByDate
          ? `A pass bought now would end on ${formatDay(endsAt)}, before your session on ${formatDay(coverByDate)}. Pick an earlier date for the session, or buy a pass closer to the day.`
          : null
    : null;

  return (
    <SafeAreaScreen style={{ flex: 1, backgroundColor: screenBg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={{ position: "absolute", left: 20 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#111"}
          />
        </TouchableOpacity>
        <ThemedText style={{ fontSize: 20, fontWeight: "700" }}>
          Monthly Pass
        </ThemedText>
      </View>

      {!passInfo ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          {loadingMyPass || !errorMyPass ? (
            <ActivityIndicator color={accent} size="large" />
          ) : (
            <View style={{ alignItems: "center", paddingHorizontal: 32 }}>
              <ThemedText style={{ color: mutedColor, textAlign: "center" }}>
                {errorMyPass}
              </ThemedText>
              <TouchableOpacity
                onPress={() =>
                  locationId && dispatch(getMyMonthlyPass({ locationId }))
                }
                style={{ marginTop: 12 }}
              >
                <ThemedText style={{ color: "#16A34A", fontWeight: "700" }}>
                  Try again
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Pass card */}
          <View
            style={{
              backgroundColor: "#141414",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText
                style={{
                  color: accent,
                  fontSize: 13,
                  fontWeight: "700",
                  letterSpacing: 2,
                }}
              >
                MONTHLY PASS
              </ThemedText>
              {(isRenewal || passInfo.current) && (
                <View
                  style={{
                    backgroundColor: accent,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <ThemedText
                    style={{ color: "#000", fontSize: 12, fontWeight: "700" }}
                  >
                    {isRenewal ? "RENEWAL" : "ACTIVE"}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "700",
                marginTop: 12,
              }}
            >
              {locationName || "This pitch"}
            </ThemedText>
            <ThemedText
              style={{ color: "#9CA3AF", fontSize: 14, marginTop: 4 }}
            >
              {isSameDay(startsAt, now)
                ? "Starts today"
                : `Starts ${formatDay(startsAt)}`}{" "}
              · ends {formatDay(endsAt)}
            </ThemedText>
            {isRenewal && lastPass && (
              <ThemedText
                style={{ color: "#9CA3AF", fontSize: 12, marginTop: 8 }}
              >
                Your current pass runs to {formatDay(new Date(lastPass.endsAt))}
                . This one starts right after.
              </ThemedText>
            )}
          </View>

          {/* What it covers */}
          <ThemedText
            style={{ fontSize: 16, fontWeight: "700", marginTop: 24 }}
          >
            What it covers
          </ThemedText>
          {[
            { covered: true, text: "Every game at this pitch" },
            { covered: true, text: "Games that start before your pass ends" },
            { covered: false, text: "Tournaments have their own entry fee" },
          ].map((item) => (
            <View
              key={item.text}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 12,
              }}
            >
              {item.covered ? (
                <Ionicons name="checkmark" size={16} color="#16A34A" />
              ) : (
                <View style={{ width: 16, alignItems: "center" }}>
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: mutedColor,
                    }}
                  />
                </View>
              )}
              <ThemedText style={{ fontSize: 15 }}>{item.text}</ThemedText>
            </View>
          ))}

          {salesClosedMessage || !price ? (
            <View
              style={{
                backgroundColor: isDark ? "#2A2010" : "#FFF8EB",
                borderColor: "#F2C46D",
                borderWidth: 1,
                borderRadius: 14,
                padding: 16,
                marginTop: 20,
              }}
            >
              <ThemedText style={{ fontSize: 14 }}>
                {salesClosedMessage ??
                  "Passes aren't on sale at this pitch right now."}
              </ThemedText>
            </View>
          ) : (
            <>
              {/* Price breakdown */}
              <View
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 14,
                  paddingHorizontal: 20,
                  marginTop: 20,
                }}
              >
                {[
                  {
                    label: `Monthly pass (${PASS_DAYS} days)`,
                    value: formatKoboAsNaira(price.baseAmount),
                  },
                  {
                    label: "Service fee",
                    value: formatKoboAsNaira(serviceFee),
                  },
                ].map((row) => (
                  <View
                    key={row.label}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingTop: 16,
                    }}
                  >
                    <ThemedText style={{ fontSize: 15, color: mutedColor }}>
                      {row.label}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 15, fontWeight: "700" }}>
                      {row.value}
                    </ThemedText>
                  </View>
                ))}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderTopWidth: 1,
                    borderTopColor: isDark ? "#222" : "#EEF1F0",
                    marginTop: 16,
                    paddingVertical: 16,
                  }}
                >
                  <ThemedText style={{ fontSize: 15, fontWeight: "700" }}>
                    Total
                  </ThemedText>
                  <ThemedText style={{ fontSize: 15, fontWeight: "700" }}>
                    {formatKoboAsNaira(price.amount)}
                  </ThemedText>
                </View>
              </View>

              <ThemedText
                style={{
                  fontSize: 12,
                  lineHeight: 18,
                  color: mutedColor,
                  marginTop: 12,
                }}
              >
                {holdSessionId
                  ? "Your spot in the game is held while you pay. Once payment is confirmed we add you to it, if there's still room."
                  : "Leaving a game doesn't affect your pass. Renewing early adds 30 days to the end, so you never lose days."}
              </ThemedText>

              <View style={{ marginTop: 20 }}>
                <CustomButton
                  primary
                  title={`Pay ${formatKoboAsNaira(price.amount)} with Paystack`}
                  titleStyle={{
                    color: "#000",
                    fontWeight: "700",
                    fontSize: 17,
                  }}
                  onPress={handlePay}
                  loading={loadingCheckout}
                  disabled={loadingCheckout || awaitingPassId != null}
                />
              </View>
            </>
          )}
        </ScrollView>
      )}

      {(awaitingPassId || confirmed) && (
        <PaymentPollingOverlay
          status={confirmed ? "PAID" : null}
          polling={awaitingPassId != null && !waitedLong}
          timedOut={awaitingPassId != null && waitedLong}
          timedOutMessage="We'll add your pass when Paystack confirms. You can leave this screen. It'll show under My passes."
          retryTitle="Open payment page again"
          isDark={isDark}
          accent={accent}
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}
    </SafeAreaScreen>
  );
}
