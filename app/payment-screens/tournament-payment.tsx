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
import usePaymentPolling from "@/hooks/usePaymentPolling";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getTournamentPaymentStatus,
  initTournamentPayment,
} from "@/api/paymentThunks";
import { clearPaymentState } from "@/redux/reducers/payment";

export default function TournamentPaymentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accent = isDark ? "#00FF94" : "#00cc77";
  const dispatch = useAppDispatch();

  const params = useLocalSearchParams<{
    tournamentId: string;
    teamId: string;
    tournamentName?: string;
    teamName?: string;
    startDate?: string;
    registrationFee?: string;
    sport?: string;
  }>();

  const {
    tournamentId,
    teamId,
    tournamentName,
    teamName,
    startDate,
    registrationFee,
    sport,
  } = params;

  const {
    tournamentPayment: tournamentPaymentStatus,
    loadingInit,
    loadingStatus,
  } = useAppSelector((s) => s.payment);

  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (tournamentId && teamId) {
      dispatch(getTournamentPaymentStatus({ tournamentId, teamId }));
    }
    return () => {
      dispatch(clearPaymentState());
    };
  }, [tournamentId, teamId, dispatch]);

  const fetchPaymentStatus = useCallback(async () => {
    if (!tournamentId || !teamId) return null;
    const result = await dispatch(
      getTournamentPaymentStatus({ tournamentId, teamId }),
    )
      .unwrap()
      .catch(() => null);
    return result;
  }, [tournamentId, teamId, dispatch]);

  const {
    status: polledStatus,
    timedOut,
    stopPolling,
  } = usePaymentPolling({
    fetchFn: fetchPaymentStatus,
    enabled: polling,
    onSuccess: () => setPolling(false),
    onFailure: () => setPolling(false),
    onTimeout: () => setPolling(false),
  });

  const handlePay = async () => {
    if (!tournamentId || !teamId) return;
    try {
      const result = await dispatch(
        initTournamentPayment({ tournamentId, teamId }),
      ).unwrap();
      await WebBrowser.openBrowserAsync(result.authorizationUrl);
      setPolling(true);
    } catch (err: any) {
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

  const currentStatus = polledStatus ?? tournamentPaymentStatus?.status ?? null;
  const amount =
    tournamentPaymentStatus?.amount ??
    (registrationFee ? parseInt(registrationFee) : 0);
  const showOverlay =
    polling ||
    timedOut ||
    currentStatus === "PAID" ||
    currentStatus === "FAILED";

  const isPaid = currentStatus === "PAID";
  const isFailed = currentStatus === "FAILED";

  const formattedDate = startDate
    ? new Date(startDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";

  const paidAt = tournamentPaymentStatus?.paidAt
    ? new Date(tournamentPaymentStatus.paidAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

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
          Tournament Registration
        </ThemedText>
      </View>

      {loadingStatus && !tournamentPaymentStatus ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={accent} size="large" />
          <Text style={{ color: mutedColor, marginTop: 12, fontSize: 13 }}>
            Checking registration status...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
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
                Registration confirmed! Your team is locked in for the
                tournament.
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
                Payment failed. Tap below to try again.
              </ThemedText>
            </View>
          )}

          {/* Summary card */}
          <PaymentSummaryCard
            title="Registration Fee"
            amount={amount}
            status={currentStatus}
            isDark={isDark}
            accent={accent}
            rows={[
              { label: "Tournament", value: tournamentName || "—" },
              { label: "Team", value: teamName || "—" },
              {
                label: "Sport",
                value: sport
                  ? sport.charAt(0).toUpperCase() + sport.slice(1)
                  : "—",
              },
              { label: "Start date", value: formattedDate },
            ]}
          />

          {/* Paid-at timestamp */}
          {isPaid && paidAt && (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: cardBorder,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <MaterialIcons name="receipt" size={18} color={mutedColor} />
              <Text style={{ color: mutedColor, fontSize: 13 }}>
                Paid on {paidAt}
              </Text>
            </View>
          )}

          {/* Captain note */}
          {!isPaid && (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: cardBorder,
                padding: 14,
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
                As team captain, you are responsible for paying the tournament
                registration fee on behalf of your team.
              </Text>
            </View>
          )}

          {!isPaid && (
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

          {!isPaid && (
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
              disabled={loadingInit || polling}
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
