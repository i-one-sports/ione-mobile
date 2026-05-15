import React from "react";
import { View, useColorScheme, Text } from "react-native";

import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
export function Icon() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View>
      <ThemedText
        lightColor={theme.text}
        darkColor={theme.text}
        className="mb-2 text-center text-[29px] font-[800]"
      >
        i-<Text className="text-[#00FF94]">o</Text>ne
      </ThemedText>
    </View>
  );
}
