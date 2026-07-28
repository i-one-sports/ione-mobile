import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PaymentStatus } from "@/components/typings/payment";
import CustomButton from "@/components/ui/CustomButton";

interface Props {
  status: PaymentStatus | null;
  timedOut: boolean;
  polling: boolean;
  isDark: boolean;
  accent: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function PaymentPollingOverlay({
  status,
  timedOut,
  polling,
  isDark,
  accent,
  onRetry,
  onDismiss,
}: Props) {
  const bg = isDark ? "rgba(0,0,0,0.92)" : "rgba(255,255,255,0.96)";
  const textColor = isDark ? "#fff" : "#111";
  const mutedColor = isDark ? "#666" : "#999";

  if (!polling && !timedOut && status !== "PAID" && status !== "FAILED") {
    return null;
  }

  const renderContent = () => {
    if (status === "PAID") {
      return (
        <>
          <View style={[styles.iconCircle, { backgroundColor: "#0D2B1F" }]}>
            <MaterialIcons name="check-circle" size={48} color={accent} />
          </View>
          <Text style={[styles.heading, { color: textColor }]}>
            Payment Confirmed!
          </Text>
          <Text style={[styles.sub, { color: mutedColor }]}>
            {"Your payment was successful. You're all set."}
          </Text>
          {onDismiss && (
            <View style={styles.btnWrap}>
              <CustomButton primary title="Continue" onPress={onDismiss} />
            </View>
          )}
        </>
      );
    }

    if (status === "FAILED") {
      return (
        <>
          <View style={[styles.iconCircle, { backgroundColor: "#2B0000" }]}>
            <MaterialIcons name="cancel" size={48} color="#FF4444" />
          </View>
          <Text style={[styles.heading, { color: textColor }]}>
            Payment Failed
          </Text>
          <Text style={[styles.sub, { color: mutedColor }]}>
            Your payment could not be processed. Please try again.
          </Text>
          <View style={styles.btnWrap}>
            {onRetry && (
              <CustomButton primary title="Try Again" onPress={onRetry} />
            )}
            {onDismiss && (
              <CustomButton
                title="Go Back"
                onPress={onDismiss}
                style={{ marginTop: 10 }}
              />
            )}
          </View>
        </>
      );
    }

    if (timedOut) {
      return (
        <>
          <View style={[styles.iconCircle, { backgroundColor: "#2B2000" }]}>
            <MaterialIcons name="access-time" size={48} color="#FFB800" />
          </View>
          <Text style={[styles.heading, { color: textColor }]}>
            Taking Longer Than Expected
          </Text>
          <Text style={[styles.sub, { color: mutedColor }]}>
            {
              "We're still checking your payment. Please wait a moment and check back."
            }
          </Text>
          <View style={styles.btnWrap}>
            {onRetry && (
              <CustomButton primary title="Check Again" onPress={onRetry} />
            )}
            {onDismiss && (
              <CustomButton
                title="Dismiss"
                onPress={onDismiss}
                style={{ marginTop: 10 }}
              />
            )}
          </View>
        </>
      );
    }

    return (
      <>
        <ActivityIndicator
          color={accent}
          size="large"
          style={{ marginBottom: 20 }}
        />
        <Text style={[styles.heading, { color: textColor }]}>
          Confirming Payment
        </Text>
        <Text style={[styles.sub, { color: mutedColor }]}>
          Waiting for payment confirmation from Paystack. This usually takes a
          few seconds.
        </Text>
      </>
    );
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        styles.overlay,
        { backgroundColor: bg },
      ]}
    >
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  sub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  btnWrap: {
    width: "100%",
  },
});
