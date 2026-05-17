import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Text, View } from "react-native";

interface StepBarProps {
  step: number;
  total?: number;
}

export default function StepBar({ step, total = 2 }: StepBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 28,
      }}
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((s, i) => (
        <View
          key={s}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: s <= step ? "#00FF94" : "transparent",
              borderWidth: 1.5,
              borderColor: s <= step ? "#00FF94" : "#ccc",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: s <= step ? "#000" : "#aaa",
              }}
            >
              {s}
            </Text>
          </View>
          {i < total - 1 && (
            <View
              style={{
                width: 32,
                height: 1.5,
                backgroundColor: step > s ? "#00FF94" : "#ddd",
              }}
            />
          )}
        </View>
      ))}
      <ThemedText
        lightColor="#999"
        darkColor="#666"
        style={{ fontSize: 12, marginLeft: 4 }}
      >
        Step {step} of {total}
      </ThemedText>
    </View>
  );
}
