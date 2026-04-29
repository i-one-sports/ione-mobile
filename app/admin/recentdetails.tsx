import { getMatchDetails } from "@/api/matchDetailsThunk";
import BookMarkIcon from "@/assets/svg/BookMarkIcon";
import FieldSvg from "@/assets/svg/FieldSvg";
import PitchIcon from "@/assets/svg/PitchSvg";
import Polygon from "@/components/Polygon";
import { formateDate, getInitials } from "@/components/Recent";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function recentDetails() {
  const dispatch = useAppDispatch();
  const { matchId, date } = useLocalSearchParams<{
    date: string;
    matchId: string;
  }>();
  const [activeTab, setActiveTab] = useState<"lineups" | "substitutes">(
    "lineups",
  );
  const [activeTeam, setActiveTeam] = useState<"T1" | "T2">("T1");
  const { matchDetails } = useAppSelector((state) => state.matchDetails);

  const match = matchDetails[matchId];

  useEffect(() => {
    if (matchId) {
      dispatch(getMatchDetails(matchId));
    }
  }, [dispatch, matchId]);

  const homeTeam = match?.teamOne;
  const awayTeam = match?.teamTwo;

  const homePlayers = homeTeam?.players || [];
  const awayPlayers = awayTeam?.players || [];

  const homeLineups = {
    goalkeeper: homePlayers.filter((p) => p.position === "GK"),
    defenders: homePlayers.filter((p) => p.position === "DF"),
    midfielders: homePlayers.filter((p) => p.position === "MF"),
    forwards: homePlayers.filter((p) => p.position === "FW"),
  };

  const awayLineups = {
    goalkeeper: awayPlayers.filter((p) => p.position === "GK"),
    defenders: awayPlayers.filter((p) => p.position === "DF"),
    midfielders: awayPlayers.filter((p) => p.position === "MF"),
    forwards: awayPlayers.filter((p) => p.position === "FW"),
  };

  const [teamOneScorers, teamTwoScorers] = useMemo(() => {
    if (!match?.goalScorers) return [[], []];

    const teamOne = match.goalScorers
      .filter((g) => g.team === "teamOne")
      .map((g) => g.player.firstName);

    const teamTwo = match.goalScorers
      .filter((g) => g.team === "teamTwo")
      .map((g) => g.player.firstName);

    return [teamOne, teamTwo];
  }, [match]);

  const renderPlayer = (player: any) => (
    <View
      key={player._id}
      className="flex-row items-center justify-between bg-[#EDFFF8] dark:bg-gray-800 rounded-[5px] px-4 py-3 mb-2 border-b border-b-primary"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-black items-center justify-center">
          <ThemedText
            style={{ color: "white" }}
            className="text-white text-sm font-semibold"
          >
            {getInitials(player.firstName + " " + player.lastName)}
          </ThemedText>
        </View>
        <ThemedText className="text-base">
          {" "}
          {player.firstName} {player.lastName}
        </ThemedText>
      </View>
      <View>
        <ThemedText className="text-xl">→</ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaScreen className="flex-1">
      <View className="flex-row px-[35px] mb-[27px]">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ThemedText className="text-2xl">←</ThemedText>
        </TouchableOpacity>
        <View className="flex-1 items-center mr-8">
          <ThemedText className="text-xl font-bold">Recent Match</ThemedText>
          <ThemedText className="text-xs text-gray-600 dark:text-gray-400">
            Tiger Sports Sangotedo, Lagos
          </ThemedText>
          <ThemedText className="text-xs text-gray-600 dark:text-gray-400">
            {formateDate(date)}
          </ThemedText>
        </View>
        <BookMarkIcon />
      </View>

      <View className="flex-row items-center justify-between mb-9 px-4">
        {/* Team One */}
        <View className="items-center flex-1">
          <Polygon teamCode={getInitials(match?.teamOne.name)} />

          <ThemedText className="text-xs mt-2 font-semibold text-center">
            {match?.teamOne.name}
          </ThemedText>

          {teamOneScorers.length > 0 && (
            <ThemedText className="text-[10px] text-gray-600 mt-1 text-center">
              ⚽ {teamOneScorers.join(", ")}
            </ThemedText>
          )}
        </View>

        {/* Score Section */}
        <View className="items-center mx-4">
          <View className="flex-row items-center gap-3">
            <ThemedText className="text-lg font-bold">
              {match?.teamOneScore}
            </ThemedText>

            <View className="w-5 h-[2px] bg-black dark:bg-gray-700" />

            <ThemedText className="text-lg font-bold">
              {match?.teamTwoScore}
            </ThemedText>
          </View>

          <ThemedText className="text-xs text-gray-500 mt-1">
            Finished
          </ThemedText>
        </View>

        {/* Team Two */}
        <View className="items-center flex-1">
          <Polygon teamCode={getInitials(match?.teamTwo.name)} />

          <ThemedText className="text-xs mt-2 font-semibold text-center">
            {match?.teamTwo.name}
          </ThemedText>

          {teamTwoScorers.length > 0 && (
            <ThemedText className="text-[10px] text-gray-600 mt-1 text-center">
              ⚽ {teamTwoScorers.join(", ")}
            </ThemedText>
          )}
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
        {activeTab === "lineups" && activeTeam === "T1" && (
          <View className="mb-6">
            {/* Goalkeeper */}
            <View className="mb-4">
              <ThemedText className="text-base font-bold mb-2">
                Goalkeeper
              </ThemedText>
              {homeLineups.goalkeeper.map(renderPlayer)}
            </View>

            {/* Defenders */}
            <View className="mb-4">
              <ThemedText className="text-base font-bold mb-2">
                Defenders
              </ThemedText>
              {homeLineups.defenders.map(renderPlayer)}
            </View>

            {/* Midfielders */}
            <View className="mb-4">
              <ThemedText className="text-base font-bold mb-2">
                Midfielders
              </ThemedText>
              {homeLineups.midfielders.map(renderPlayer)}
            </View>

            {/* Forward */}
            <View className="mb-6">
              <ThemedText className="text-base font-bold mb-2">
                Forward
              </ThemedText>
              {homeLineups.forwards.map(renderPlayer)}
            </View>
          </View>
        )}

        {activeTab === "lineups" && activeTeam === "T2" && (
          <View className="mb-6">
            {/* Goalkeeper */}
            <View className="mb-4">
              <ThemedText className="text-base font-bold mb-2">
                Goalkeeper
              </ThemedText>
              {awayLineups.goalkeeper.map(renderPlayer)}
            </View>

            {/* Defenders */}
            <View className="mb-4">
              <ThemedText className="text-base font-bold mb-2">
                Defenders
              </ThemedText>
              {awayLineups.defenders.map(renderPlayer)}
            </View>

            {/* Midfielders */}
            <View className="mb-4">
              <ThemedText className="text-base font-bold mb-2">
                Midfielders
              </ThemedText>
              {awayLineups.midfielders.map(renderPlayer)}
            </View>

            {/* Forward */}
            <View className="mb-6">
              <ThemedText className="text-base font-bold mb-2">
                Forward
              </ThemedText>
              {awayLineups.forwards.map(renderPlayer)}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaScreen>
  );
}
