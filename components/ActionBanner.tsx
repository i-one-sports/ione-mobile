import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { ThemedText } from "./ThemedText";

type ActionBannerProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  isDark: boolean;
  onPress: () => void;
};

export default function ActionBanner({
  title,
  description,
  icon,
  accent,
  isDark,
  onPress,
}: ActionBannerProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: isDark ? "#0D2B1F" : "#EDFFF8",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isDark ? "#1a3d2b" : "#c8f5e2",
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: `${accent}22`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={20} color={accent} />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText
          style={{
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 2,
          }}
        >
          {title}
        </ThemedText>

        <ThemedText lightColor="#666" darkColor="#aaa" style={{ fontSize: 11 }}>
          {description}
        </ThemedText>
      </View>

      <Ionicons name="chevron-forward" size={18} color={accent} />
    </TouchableOpacity>
  );
}
