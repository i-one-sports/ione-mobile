import React from "react";
import { Text, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import Polygon from "@/components/Polygon";
import { Colors } from "@/constants/Colors";

export interface ScoreboardTeam {
  code: string;
  name: string;
  score: number;
}

interface Props {
  teamOne: ScoreboardTeam;
  teamTwo: ScoreboardTeam;
  /** e.g. "06:32 / 10:00" or "10:00" */
  clock: string;
  /** Show a "Winner" pill under this team. */
  winner?: "teamOne" | "teamTwo" | null;
}

export default function Scoreboard({ teamOne, teamTwo, clock, winner }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];

  const renderTeam = (team: ScoreboardTeam, isWinner: boolean) => (
    <View className="w-[100px] items-center gap-[10px]">
      <Polygon teamCode={team.code} size={64} />
      <ThemedText
        lightColor={theme.text}
        darkColor={theme.text}
        className="text-[15px] font-[500]"
      >
        {team.name}
      </ThemedText>
      {isWinner && (
        <View
          className="rounded-full px-[14px] py-[5px]"
          style={{ backgroundColor: isDark ? "#0D3B26" : "#D4FFF0" }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: isDark ? "#00FF94" : "#00A85A",
            }}
          >
            Winner
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex flex-row items-start justify-between px-[12px]">
      {renderTeam(teamOne, winner === "teamOne")}

      <View className="items-center pt-[4px]">
        <ThemedText
          lightColor={theme.text}
          darkColor={theme.text}
          style={{ fontSize: 34, fontWeight: "800", lineHeight: 40 }}
        >
          {teamOne.score} – {teamTwo.score}
        </ThemedText>
        <View
          className="mt-[4px] h-[3px] w-[64px] rounded-full"
          style={{ backgroundColor: isDark ? "#fff" : "#111" }}
        />
        <View className="mt-[8px] flex flex-row items-center gap-[4px]">
          <Ionicons name="time-outline" size={16} color="#6D717F" />
          <Text className="text-[13px] text-[#6D717F]">{clock}</Text>
        </View>
      </View>

      {renderTeam(teamTwo, winner === "teamTwo")}
    </View>
  );
}
