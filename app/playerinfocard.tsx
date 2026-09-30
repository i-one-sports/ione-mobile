import React from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";

type PaymentStatus =
  | "PAID"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "NOT_REQUIRED";

const STATUS_COLOR: Record<PaymentStatus, string> = {
  PAID: "#00FF94",
  PENDING: "#FFB800",
  FAILED: "#FF4444",
  REFUNDED: "#888",
  NOT_REQUIRED: "#888",
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  NOT_REQUIRED: "Free",
};

interface Props {
  name?: string;
  image?: string;
  role?: string;
  paymentStatus?: PaymentStatus;
  index?: number;
}

export default function PlayerInfoCard({ name, paymentStatus, index }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const initials = name ? name.slice(0, 2).toUpperCase() : "?";

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 31,
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderBottomWidth: 2,
        borderBottomColor: isDark ? "#1a3d2b" : "#6BF8BD",
        backgroundColor: isDark ? "#0D1F17" : "#EDFFF8",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isDark ? "#aaa" : "#333",
              minWidth: 16,
            }}
          >
            {index}
          </Text>
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: isDark ? "#1f4d37" : "#000",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: isDark ? "#00FF94" : "#fff",
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              {initials}
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "500",
            color: isDark ? "#fff" : "#111",
          }}
        >
          {name}
        </Text>
      </View>

      {paymentStatus && paymentStatus !== "NOT_REQUIRED" && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: `${STATUS_COLOR[paymentStatus]}${isDark ? "25" : "18"}`,
            borderRadius: 20,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: STATUS_COLOR[paymentStatus],
            }}
          />
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: STATUS_COLOR[paymentStatus],
            }}
          >
            {STATUS_LABEL[paymentStatus]}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
