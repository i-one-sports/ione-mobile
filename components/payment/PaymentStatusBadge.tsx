import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PaymentStatus } from "@/components/typings/payment";

interface Props {
  status: PaymentStatus;
  size?: "sm" | "md";
}

const CONFIG: Record<
  PaymentStatus,
  { label: string; bg: string; text: string }
> = {
  PAID: { label: "Paid", bg: "#0D2B1F", text: "#00FF94" },
  PENDING: { label: "Pending", bg: "#2B2000", text: "#FFB800" },
  FAILED: { label: "Failed", bg: "#2B0000", text: "#FF4444" },
  REFUND_PENDING: { label: "Refund Pending", bg: "#1A1A2B", text: "#8888FF" },
  REFUND_NEEDS_ATTENTION: {
    label: "Needs Attention",
    bg: "#2B1A00",
    text: "#FF8C00",
  },
  REFUND_FAILED: { label: "Refund Failed", bg: "#2B0000", text: "#FF4444" },
  REFUNDED: { label: "Refunded", bg: "#1A2B2B", text: "#00C8FF" },
};

export default function PaymentStatusBadge({ status, size = "sm" }: Props) {
  const cfg = CONFIG[status] ?? CONFIG.PENDING;
  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: cfg.bg,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 5,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: cfg.text }]} />
      <Text
        style={[styles.label, { color: cfg.text, fontSize: isSmall ? 11 : 13 }]}
      >
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    gap: 5,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: "600",
  },
});
