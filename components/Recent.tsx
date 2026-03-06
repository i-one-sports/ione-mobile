import RightArrow from "@/assets/svg/RightArrow";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import Polygon from "./Polygon";
import { ThemedText } from "./ThemedText";

type RecentProps = {
  date: string;
  type?: string;
  homeTeamInitial: string;
  awayTeamInitial: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
};

const getInitials = (name: string) => {
  return (
    name
      .trim()
      .split(" ")
      // .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("")
  );
};

const formateDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });
};

export default function Recent({
  date,
  type,
  homeTeamInitial,
  awayTeamInitial,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
}: RecentProps) {
  return (
    <TouchableOpacity className="dark:bg-gray-800 rounded-[5px] py-[10px] px-[25px] flex-col justify-between gap-[7px] bg-[#EDFFF8]">
      <View className="flex flex-row justify-between items-center">
        <ThemedText className="text-xs">{formateDate(date)}</ThemedText>
        <ThemedText className="text-xs text-gray-600 dark:text-gray-400">
          {type || "friendly"}
        </ThemedText>
        <RightArrow />
      </View>

      <View className="flex-row items-center gap-4 justify-center">
        <View className="items-center">
          <Polygon teamCode={getInitials(homeTeamInitial)} />
          <ThemedText className="text-xs mt-1 font-semibold">
            {homeTeamName}
          </ThemedText>
        </View>

        <View className="flex flex-row gap-1">
          <ThemedText className="text-xs">{homeScore}</ThemedText>
          <ThemedText className="text-xs">-</ThemedText>
          <ThemedText className="text-xs">{awayScore}</ThemedText>
        </View>

        <View className="items-center">
          <Polygon teamCode={getInitials(awayTeamInitial)} />
          <ThemedText className="text-xs mt-1 font-semibold">
            {awayTeamName}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}
