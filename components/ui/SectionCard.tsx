import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { StyleProp, useColorScheme, View, ViewStyle } from "react-native";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function SectionCard({
  title,
  children,
  isDark: isDarkProp,
  style,
}: SectionCardProps) {
  const colorScheme = useColorScheme();
  const isDark = isDarkProp ?? colorScheme === "dark";

  return (
    <View
      style={[
        {
          backgroundColor: isDark ? "#111" : "#F9FAFB",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: isDark ? "#222" : "#F0F0F0",
          padding: 16,
          marginBottom: 16,
        },
        style,
      ]}
    >
      <ThemedText
        lightColor="#555"
        darkColor="#aaa"
        style={{
          fontSize: 11,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 12,
        }}
      >
        {title}
      </ThemedText>
      {children}
    </View>
  );
}
