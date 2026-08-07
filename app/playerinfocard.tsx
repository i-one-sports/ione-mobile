import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";

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
  const initials = name ? name.slice(0, 2).toUpperCase() : "?";

  return (
    <TouchableOpacity className="mx-[31px] flex flex-row items-center justify-between border-b-[2px] border-[#6BF8BD] bg-[#EDFFF8] px-[16px] py-[13px]">
      <View className="flex flex-row items-center gap-[12px]">
        <View className="flex flex-row gap-[15px] items-center">
          <View>
            <Text className="font-[600] text-[13px]">{index}</Text>
          </View>
          <View className="h-[40px] w-[40px] rounded-full bg-black items-center justify-center">
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
              {initials}
            </Text>
          </View>
        </View>
        <ThemedText className="text-[15px] font-[500] text-black">
          {name}
        </ThemedText>
      </View>

      {paymentStatus && paymentStatus !== "NOT_REQUIRED" && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: `${STATUS_COLOR[paymentStatus]}18`,
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
