import React from "react";
import { Text, View, useColorScheme } from "react-native";
import { initialsOf } from "@/utils/vote";

interface Props {
  name: string;
  size?: number;
}

// Same circle as PlayerInfoCard: black with white initials (green in dark mode).
export default function InitialsAvatar({ name, size = 40 }: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: isDark ? "#1f4d37" : "#000",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: isDark ? "#00FF94" : "#fff",
          fontSize: size * 0.33,
          fontWeight: "700",
        }}
      >
        {initialsOf(name)}
      </Text>
    </View>
  );
}
