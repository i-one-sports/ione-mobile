import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaIcon?: keyof typeof Ionicons.glyphMap;
  onCta?: () => void;
  isDark: boolean;
}

export function EmptyState({
  icon = "football-outline",
  title,
  message,
  ctaLabel,
  ctaIcon = "add",
  onCta,
  isDark,
}: Props) {
  const mutedText = isDark ? "#555" : "#999";
  const primaryText = isDark ? "#FFF" : "#111";

  return (
    <View style={{ alignItems: "center", paddingVertical: 60 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: isDark ? "#1A1A1A" : "#F0F0F0",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon} size={30} color={mutedText} />
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: primaryText,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 13,
          color: mutedText,
          textAlign: "center",
          lineHeight: 20,
          paddingHorizontal: 24,
        }}
      >
        {message}
      </Text>

      {ctaLabel && onCta && (
        <TouchableOpacity
          onPress={onCta}
          style={{
            marginTop: 20,
            backgroundColor: "#00FF94",
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Ionicons name={ctaIcon} size={16} color="#000" />
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#000" }}>
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
