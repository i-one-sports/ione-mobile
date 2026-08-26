import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { WalletsHeaderProps as Props } from "./types";

export function WalletsHeader({ availableBalance, currency, status }: Props) {
  return (
    <LinearGradient
      colors={["#00492A", "#61C89D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20, padding: 20, marginBottom: 20 }}
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
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            fontWeight: "500",
          }}
        >
          Available Balance
        </ThemedText>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <ThemedText
            style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}
          >
            {status}
          </ThemedText>
        </View>
      </View>

      <ThemedText
        style={{
          color: "#fff",
          fontSize: 36,
          fontWeight: "800",
          letterSpacing: -1,
          marginTop: 8,
          marginBottom: 12,
        }}
      >
        ₦{(availableBalance / 100).toLocaleString()}
      </ThemedText>
    </LinearGradient>
  );
}
