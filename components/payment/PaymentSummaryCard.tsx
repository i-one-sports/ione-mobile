import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { PaymentStatus } from "@/components/typings/payment";
import PaymentStatusBadge from "./PaymentStatusBadge";

interface Row {
  label: string;
  value: string;
}

interface Props {
  title: string;
  amount: number;
  rows: Row[];
  status?: PaymentStatus | null;
  isDark: boolean;
  accent: string;
  expiresAt?: string | null;
}

export default function PaymentSummaryCard({
  title,
  amount,
  rows,
  status,
  isDark,
  accent,
  expiresAt,
}: Props) {
  const cardBg = isDark ? "#111" : "#F9FAFB";
  const cardBorder = isDark ? "#222" : "#F0F0F0";
  const mutedColor = isDark ? "#666" : "#999";

  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder },
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {status && <PaymentStatusBadge status={status} size="md" />}
      </View>

      <View style={[styles.amountRow, { borderColor: cardBorder }]}>
        <Text style={[styles.amountLabel, { color: mutedColor }]}>
          Amount due
        </Text>
        <Text style={[styles.amount, { color: accent }]}>
          ₦{amount.toLocaleString()}
        </Text>
      </View>

      {rows.map((row, i) => (
        <View
          key={i}
          style={[
            styles.row,
            i < rows.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: cardBorder,
            },
          ]}
        >
          <Text style={[styles.rowLabel, { color: mutedColor }]}>
            {row.label}
          </Text>
          <Text style={[styles.rowValue, { color: isDark ? "#fff" : "#111" }]}>
            {row.value}
          </Text>
        </View>
      ))}

      {expiresAt && (
        <View
          style={[
            styles.expiryRow,
            {
              backgroundColor: isExpired
                ? "#2B0000"
                : isDark
                  ? "#1a1a1a"
                  : "#f5f5f5",
            },
          ]}
        >
          <Text
            style={[
              styles.expiryText,
              { color: isExpired ? "#FF4444" : mutedColor },
            ]}
          >
            {isExpired
              ? "Payment window has expired"
              : `Pay before ${new Date(expiresAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })} · ${new Date(expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  amountLabel: {
    fontSize: 13,
  },
  amount: {
    fontSize: 22,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 13,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  expiryRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  expiryText: {
    fontSize: 12,
  },
});
