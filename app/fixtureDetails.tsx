import BookMarkIcon from "@/assets/svg/BookMarkIcon";
import FieldSvg from "@/assets/svg/FieldSvg";
import PitchIcon from "@/assets/svg/PitchSvg";
import Polygon from "@/components/Polygon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { LineupData, Player } from "@/components/typings";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function FixtureDetailsScreen() {
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"lineups" | "substitutes">(
    "lineups",
  );
  const [activeTeam, setActiveTeam] = useState<"T1" | "T2">("T1");

  // Parse the params
  const time = params.time as string;
  const teamA = params.teamA as string;
  const teamAName = params.teamAName as string;
  const teamB = params.teamB as string;
  const teamBName = params.teamBName as string;

  // Sample lineup data
  const lineups: LineupData = {
    goalkeeper: [{ id: 1, number: 1, name: "John Doe", initials: "JD" }],
    defenders: [
      { id: 2, number: 2, name: "John Doe", initials: "JD" },
      { id: 3, number: 3, name: "John Doe", initials: "JD" },
    ],
    midfielders: [
      { id: 4, number: 7, name: "John Doe", initials: "JD" },
      { id: 5, number: 10, name: "John Doe", initials: "JD" },
      { id: 6, number: 11, name: "John Doe", initials: "JD" },
    ],
    forwards: [{ id: 7, number: 9, name: "John Doe", initials: "JD" }],
  };

  const renderPlayer = (player: Player) => (
    <TouchableOpacity
      key={player.id}
      className="flex-row items-center justify-between bg-[#EDFFF8] dark:bg-gray-800 rounded-[5px] px-4 py-3 mb-2 border-b border-b-primary"
    >
      <View className="flex-row items-center gap-3">
        <ThemedText className="text-base font-medium w-6">
          {player.number}
        </ThemedText>
        <View className="w-10 h-10 rounded-full bg-black items-center justify-center">
          <ThemedText
            style={{ color: "white" }}
            className="text-white text-sm font-semibold"
          >
            {player.initials}
          </ThemedText>
        </View>
        <ThemedText className="text-base">{player.name}</ThemedText>
      </View>
      <View>
        <ThemedText className="text-xl">→</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaScreen className="flex-1">
      <View className="flex-row px-[35px] mb-[27px]">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ThemedText className="text-2xl">←</ThemedText>
        </TouchableOpacity>
        <View className="flex-1 items-center mr-8">
          <ThemedText className="text-xl font-bold">Upcoming Match</ThemedText>
          <ThemedText className="text-xs text-gray-600 dark:text-gray-400">
            Tiger Sports Sangotedo, Lagos
          </ThemedText>
          <ThemedText className="text-xs text-gray-600 dark:text-gray-400">
            Tue, Mar 19
          </ThemedText>
        </View>
        <BookMarkIcon />
      </View>

      <View className="flex-row items-center justify-center mb-9 gap-8">
        <View className="items-center">
          <Polygon teamCode={teamA} />
          <ThemedText className="text-xs mt-2 font-semibold">
            {teamAName}
          </ThemedText>
        </View>

        <View className="py-2 border-t-2 border-t-black dark:border-t-gray-700">
          <ThemedText className="text-base font-bold">{time}</ThemedText>
        </View>

        <View className="items-center">
          <Polygon teamCode={teamB} />
          <ThemedText className="text-xs mt-2 font-semibold">
            {teamBName}
          </ThemedText>
        </View>
      </View>

      <View className="flex-row border-b gap-[17px] border-t py-[21px] border-gray-300 dark:border-gray-700 mb-4 px-[35px]">
        <TouchableOpacity
          onPress={() => setActiveTab("lineups")}
          className="relative pb-3 items-center"
        >
          <ThemedText
            className={`text-center font-semibold text-base ${activeTab === "lineups" ? "text-primary" : "text-gray-500"}`}
            style={{
              color: activeTab === "lineups" ? "#000000" : "#B9B9B9",
            }}
          >
            Lineups
          </ThemedText>

          {activeTab === "lineups" && (
            <View className="absolute bottom-0 w-8 h-[2px] bg-[#46BB1C] rounded-full" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("substitutes")}
          className="relative pb-3 items-center"
        >
          <ThemedText
            className={`text-center font-semibold text-base`}
            style={{
              color: activeTab === "substitutes" ? "#000000" : "#B9B9B9",
            }}
          >
            Substitutes
          </ThemedText>

          {activeTab === "substitutes" && (
            <View className="absolute bottom-0 w-8 h-[2px] bg-[#46BB1C] rounded-full" />
          )}
        </TouchableOpacity>
      </View>

      {/* Team Selector */}
      <View className="flex-row gap-2 mb-4 justify-between items-center px-[35px]">
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => setActiveTeam("T1")}
            className={`p-2 rounded-[5px] ${
              activeTeam === "T1"
                ? "bg-primary"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <ThemedText
              className={`text-center font-semibold ${
                activeTeam === "T1"
                  ? "text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              T1
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTeam("T2")}
            className={`p-2 rounded-[5px] ${
              activeTeam === "T2"
                ? "bg-primary"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <ThemedText
              className={`text-center font-semibold ${
                activeTeam === "T2"
                  ? "text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              T2
            </ThemedText>
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-[18px] items-center">
          <PitchIcon />
          <FieldSvg />
        </View>
      </View>
      <ScrollView className="flex-1 px-[35px]">
        {/* Lineups Section */}
        {activeTab === "lineups" && (
          <View className="mb-6">
            {/* Goalkeeper */}
            <View className="mb-4">
              <ThemedText className="text-base font-bold mb-2">
                Goalkeeper
              </ThemedText>
              {lineups.goalkeeper.map(renderPlayer)}
            </View>

            {/* Defenders */}
            <View className="mb-4">
              <ThemedText className="text-base font-bold mb-2">
                Defenders
              </ThemedText>
              {lineups.defenders.map(renderPlayer)}
            </View>

            {/* Midfielders */}
            <View className="mb-4">
              <ThemedText className="text-base font-bold mb-2">
                Midfielders
              </ThemedText>
              {lineups.midfielders.map(renderPlayer)}
            </View>

            {/* Forward */}
            <View className="mb-6">
              <ThemedText className="text-base font-bold mb-2">
                Forward
              </ThemedText>
              {lineups.forwards.map(renderPlayer)}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaScreen>
  );
}
