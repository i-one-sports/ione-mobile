import { koboToNaira } from "@/utils/currency";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Toast } from "toastify-react-native";

import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import PaymentSummaryCard from "@/components/payment/PaymentSummaryCard";
import PaymentPollingOverlay from "@/components/payment/PaymentPollingOverlay";
import MemberPaymentList from "@/components/payment/MemberPaymentList";
import PoolPaymentPanel from "@/components/payment/PoolPaymentPanel";
import usePaymentPolling from "@/hooks/usePaymentPolling";
import usePoolStream from "@/hooks/usePoolStream";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getAllMembersPaymentStatus,
  getMySessionPayment,
  initSessionPayment,
} from "@/api/paymentThunks";
import { clearPaymentState } from "@/redux/reducers/payment";

export default function SessionPaymentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accent = isDark ? "#00FF94" : "#00cc77";
  const dispatch = useAppDispatch();

  const params = useLocalSearchParams<{
    sessionId: string;
    locationName?: string;
    startTime?: string;
    matchType?: string;
    members?: string;
    paymentAmount: string;
    paymentMode?: string;
    paymentTarget?: string;
  }>();

  const { sessionId, locationName, startTime, matchType, paymentAmount } =
    params;
  const members = params.members ? JSON.parse(params.members) : [];
  // Hourly sessions are pooled: members chip in toward one total.
  const isPool = params.paymentMode === "POOL";

  // paymentAmount comes from the API in kobo; show naira.
  const amount = koboToNaira(Number(paymentAmount ?? 0));
  console.log("[session-payment] sessionId:", sessionId, "amount:", amount);

  const { mySessionPayment, allMembersStatus, loadingInit, loadingStatus } =
    useAppSelector((s) => s.payment);
  const myUserId = useAppSelector((s) => s.auth.user?._id);

  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (sessionId) {
      // POOL players can have several contribution rows; my-payment only
      // returns one of them, so the pool snapshot is used instead.
      if (!isPool) dispatch(getMySessionPayment(sessionId));
      dispatch(getAllMembersPaymentStatus(sessionId));
    }
    return () => {
      dispatch(clearPaymentState());
    };
  }, [sessionId, isPool, dispatch]);

  const { snapshot: streamedPool } = usePoolStream(sessionId, isPool);
  const pool = streamedPool ?? allMembersStatus?.pool ?? null;
  const poolTarget = pool?.target ?? Number(params.paymentTarget ?? 0);
  const myPoolTotal =
    pool?.contributors.find((c) => c.userId === myUserId)?.amount ?? 0;

  // A POOL checkout we opened, waiting for the webhook to land in the pot.
  const [pendingContribution, setPendingContribution] = useState<{
    expectedTotal: number;
    expiresAt: number;
  } | null>(null);

  useEffect(() => {
    if (!pendingContribution) return;
    if (myPoolTotal >= pendingContribution.expectedTotal) {
      setPendingContribution(null);
      Toast.show({
        type: "success",
        text1: "Payment confirmed",
        text2: "Your contribution is in the pot.",
      });
    }
  }, [myPoolTotal, pendingContribution]);

  // The server releases an unpaid reservation at expiresAt; stop waiting then.
  useEffect(() => {
    if (!pendingContribution) return;
    const ms = Math.max(pendingContribution.expiresAt - Date.now(), 0);
    const timer = setTimeout(() => setPendingContribution(null), ms);
    return () => clearTimeout(timer);
  }, [pendingContribution]);

  const handlePoolPay = async (amountKobo: number) => {
    if (!sessionId) return;
    try {
      const result = await dispatch(
        initSessionPayment({ sessionId, amount: amountKobo }),
      ).unwrap();
      if (result.alreadyPaid) {
        Toast.show({
          type: "info",
          text1: "Already covered",
          text2: "The pot is already full. You're good to go!",
        });
        dispatch(getAllMembersPaymentStatus(sessionId));
        return;
      }
      setPendingContribution({
        expectedTotal: myPoolTotal + (result.baseAmount ?? amountKobo),
        expiresAt: result.expiresAt
          ? new Date(result.expiresAt).getTime()
          : Date.now() + 15 * 60 * 1000,
      });
      await WebBrowser.openBrowserAsync(result.authorizationUrl);
    } catch (err: any) {
      // 409: someone else reserved part of the pot first — refresh the numbers.
      if (err?.status === 409) {
        dispatch(getAllMembersPaymentStatus(sessionId));
        Toast.show({
          type: "info",
          text1: "The pot just changed",
          text2: "Someone else paid first. Check the new amount and try again.",
        });
        return;
      }
      Toast.show({ type: "error", text1: "Payment error", text2: err?.msg });
    }
  };

  const fetchPaymentStatus = useCallback(async () => {
    if (!sessionId) return null;
    const result = await dispatch(getMySessionPayment(sessionId))
      .unwrap()
      .catch(() => null);
    return result;
  }, [sessionId, dispatch]);

  const {
    status: polledStatus,
    timedOut,
    stopPolling,
  } = usePaymentPolling({
    fetchFn: fetchPaymentStatus,
    enabled: polling,
    onSuccess: () => {
      setPolling(false);
      dispatch(getAllMembersPaymentStatus(sessionId));
    },
    onFailure: () => setPolling(false),
    onTimeout: () => setPolling(false),
  });

  const handlePay = async () => {
    if (!sessionId) return;
    try {
      const result = await dispatch(initSessionPayment({ sessionId })).unwrap();
      console.log("[session-payment] initSessionPayment result:", result);
      await WebBrowser.openBrowserAsync(result.authorizationUrl);
      setPolling(true);
    } catch (err: any) {
      console.log(
        "[session-payment] initSessionPayment error:",
        JSON.stringify(err, null, 2),
      );
      Toast.show({ type: "error", text1: "Payment error", text2: err?.msg });
    }
  };

  const handleRetry = () => {
    stopPolling();
    setPolling(false);
    handlePay();
  };

  const handleDismiss = () => {
    stopPolling();
    setPolling(false);
    router.back();
  };

  const currentStatus = polledStatus ?? mySessionPayment?.status ?? null;
  //   const amount = mySessionPayment?.amount ?? 0;
  const showOverlay =
    polling ||
    timedOut ||
    currentStatus === "PAID" ||
    currentStatus === "FAILED";

  const isExpired = mySessionPayment?.expiresAt
    ? new Date(mySessionPayment.expiresAt) < new Date()
    : false;

  const isPaid = currentStatus === "PAID";
  const isFailed = currentStatus === "FAILED";
  const isPending = currentStatus === "PENDING";

  const formattedTime = startTime
    ? new Date(startTime).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "TBD";

  const cardBg = isDark ? "#111" : "#F9FAFB";
  const cardBorder = isDark ? "#222" : "#F0F0F0";
  const mutedColor = isDark ? "#666" : "#999";

  return (
    <SafeAreaScreen
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: cardBorder,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#fff" : "#111"}
          />
        </TouchableOpacity>
        <ThemedText style={{ fontSize: 17, fontWeight: "700" }}>
          Session Payment
        </ThemedText>
      </View>

      {isPool ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <PaymentSummaryCard
            title="Pitch booking"
            amountLabel="Session total"
            amount={koboToNaira(poolTarget)}
            isDark={isDark}
            accent={accent}
            rows={[
              { label: "Location", value: locationName || "—" },
              { label: "Kick-off", value: formattedTime },
              {
                label: "Match type",
                value: matchType
                  ? matchType.charAt(0).toUpperCase() + matchType.slice(1)
                  : "—",
              },
            ]}
          />

          {pool ? (
            <PoolPaymentPanel
              pool={pool}
              myUserId={myUserId}
              isDark={isDark}
              accent={accent}
              paying={loadingInit}
              awaitingConfirmation={pendingContribution != null}
              onPay={handlePoolPay}
              onDone={() => router.back()}
            />
          ) : allMembersStatus ? (
            // Status loaded but no pool block: the pot isn't open yet.
            <Text
              style={{
                color: mutedColor,
                fontSize: 13,
                textAlign: "center",
                lineHeight: 19,
              }}
            >
              Payment opens once the session is full.
            </Text>
          ) : (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <ActivityIndicator color={accent} />
              <Text style={{ color: mutedColor, marginTop: 12, fontSize: 13 }}>
                Loading the session pot...
              </Text>
            </View>
          )}
        </ScrollView>
      ) : loadingStatus && !mySessionPayment && !loadingInit ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={accent} size="large" />
          <Text style={{ color: mutedColor, marginTop: 12, fontSize: 13 }}>
            Checking payment status...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Info banner */}
          {isPaid && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#0D2B1F",
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#1a3d2b",
              }}
            >
              <MaterialIcons name="check-circle" size={20} color={accent} />
              <ThemedText
                darkColor="#aaa"
                lightColor="#444"
                style={{ fontSize: 13, flex: 1 }}
              >
                {"Your payment is confirmed. You're good to go!"}
              </ThemedText>
            </View>
          )}

          {isFailed && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#2B0000",
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#3d1a1a",
              }}
            >
              <MaterialIcons name="error" size={20} color="#FF4444" />
              <ThemedText
                darkColor="#aaa"
                lightColor="#444"
                style={{ fontSize: 13, flex: 1 }}
              >
                Your last payment failed. Tap below to try again.
              </ThemedText>
            </View>
          )}

          {isExpired && isPending && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#2B0000",
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <MaterialIcons name="access-time" size={20} color="#FF4444" />
              <ThemedText
                darkColor="#aaa"
                lightColor="#444"
                style={{ fontSize: 13, flex: 1 }}
              >
                Payment window has expired. Contact support if needed.
              </ThemedText>
            </View>
          )}

          {/* Summary card */}
          <PaymentSummaryCard
            title="Session Fee"
            amount={amount}
            status={currentStatus}
            isDark={isDark}
            accent={accent}
            expiresAt={mySessionPayment?.expiresAt}
            rows={[
              { label: "Location", value: locationName || "—" },
              { label: "Kick-off", value: formattedTime },
              {
                label: "Match type",
                value: matchType
                  ? matchType.charAt(0).toUpperCase() + matchType.slice(1)
                  : "—",
              },
            ]}
          />

          {/* Members payment list (captain/owner view) */}
          {members.length > 0 && (
            <MemberPaymentList
              members={members}
              isDark={isDark}
              accent={accent}
              total={allMembersStatus?.total}
              paid={allMembersStatus?.paid}
            />
          )}

          {/* Summary stats for captain */}
          {allMembersStatus && (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: cardBorder,
                padding: 16,
                marginBottom: 20,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {[
                {
                  label: "Total",
                  value: allMembersStatus.total,
                  color: isDark ? "#fff" : "#111",
                },
                { label: "Paid", value: allMembersStatus.paid, color: accent },
                {
                  label: "Pending",
                  value: allMembersStatus.pending,
                  color: "#FFB800",
                },
              ].map((stat) => (
                <View key={stat.label} style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: mutedColor, marginTop: 2 }}
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* No payment record yet — session hasn't filled up */}
          {!currentStatus && !loadingStatus && (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: cardBorder,
                padding: 16,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <MaterialIcons
                name="info-outline"
                size={18}
                color={mutedColor}
                style={{ marginTop: 1 }}
              />
              <Text
                style={{
                  color: mutedColor,
                  fontSize: 13,
                  flex: 1,
                  lineHeight: 19,
                }}
              >
                Your payment slot will be created automatically once all players
                have joined the session.
              </Text>
            </View>
          )}

          {/* Action note — only when there's an active PENDING payment */}
          {isPending && !isExpired && (
            <Text
              style={{
                fontSize: 12,
                color: mutedColor,
                textAlign: "center",
                marginBottom: 16,
                lineHeight: 18,
              }}
            >
              {
                "After tapping Pay, complete your payment in the browser. We'll confirm automatically once Paystack notifies us."
              }
            </Text>
          )}

          {/* CTA — only shown when backend has a PENDING or FAILED record */}
          {(isPending || isFailed) && (
            <CustomButton
              primary
              title={
                loadingInit
                  ? "Opening Paystack..."
                  : isFailed
                    ? "Retry Payment"
                    : "Pay ₦" + amount.toLocaleString()
              }
              onPress={handlePay}
              loading={loadingInit}
              disabled={loadingInit || isExpired || polling}
            />
          )}

          {isPaid && (
            <CustomButton primary title="Done" onPress={() => router.back()} />
          )}
        </ScrollView>
      )}

      {showOverlay && (
        <PaymentPollingOverlay
          status={currentStatus}
          timedOut={timedOut}
          polling={
            polling &&
            !timedOut &&
            currentStatus !== "PAID" &&
            currentStatus !== "FAILED"
          }
          isDark={isDark}
          accent={accent}
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}
    </SafeAreaScreen>
  );
}
