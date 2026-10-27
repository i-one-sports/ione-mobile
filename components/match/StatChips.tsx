import React from "react";
import { Text, View, useColorScheme } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  goals: number;
  assists: number;
}

// Goal and assist count chips, as on the vote and result screens.
export default function StatChips({ goals, assists }: Props) {
  const isDark = useColorScheme() === "dark";
  const accent = isDark ? "#00FF94" : "#00A85A";
  const chipBg = isDark ? "#0D3B26" : "#D4FFF0";

  return (
    <View className="flex-row gap-[6px]">
      {(
        [
          { icon: "soccer", value: goals },
          { icon: "shoe-sneaker", value: assists },
        ] as const
      ).map((chip) => (
        <View
          key={chip.icon}
          className="flex-row items-center gap-[6px] rounded-full px-[10px] py-[4px]"
          style={{ backgroundColor: chipBg }}
        >
          <MaterialCommunityIcons
            name={chip.icon}
            size={15}
            color={isDark ? "#fff" : "#111"}
          />
          <Text style={{ fontSize: 14, fontWeight: "700", color: accent }}>
            {chip.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
