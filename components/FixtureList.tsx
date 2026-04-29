"use client";

import RightArrow from "@/assets/svg/RightArrow";
import { useAppSelector } from "@/redux/store";
import { router } from "expo-router";
import React from "react";
import { FlatList, ListRenderItem, TouchableOpacity, View } from "react-native";
import Polygon from "./Polygon";
import { ThemedText } from "./ThemedText";
import { Fixture } from "./typings";

const FixtureList: React.FC = () => {
  const { sessions } = useAppSelector((state) => state.sessions);

  // Transform backend sessions → Fixture format
  const fixtures: Fixture[] = sessions.map((s) => ({
    id: s._id,
    time: "14:00", // placeholder until backend sends actual match time
    teamA: s.teamOne?.name?.slice(0, 2).toUpperCase() || "NA",
    teamAName: s.teamOne?.name || "Unknown",
    teamB: s.teamTwo?.name?.slice(0, 2).toUpperCase() || "NA",
    teamBName: s.teamTwo?.name || "Unknown",
    type: s.matchType || "Match",
  }));

  const handleFixturePress = (fixture: Fixture) => {
    router.push({
      pathname: "/fixtureDetails",
      params: fixture,
    });
  };

  const renderItem: ListRenderItem<Fixture> = ({ item }) => (
    <TouchableOpacity
      className="dark:bg-gray-800 rounded-[5px] py-[10px] px-[25px] flex-col justify-between gap-[7px]  bg-[#EDFFF8]"
      onPress={() => handleFixturePress(item)}
    >
      <View className="flex flex-row justify-between items-center">
        <ThemedText className="text-xs">{item.time}</ThemedText>
        <ThemedText className="text-xs text-gray-600 dark:text-gray-400">
          {item.type}
        </ThemedText>
        <RightArrow />
      </View>

      <View className="flex-row items-center gap-4 justify-center">
        <View className="items-center">
          <Polygon teamCode={item.teamA} />
          <ThemedText className="text-xs mt-1 font-semibold">
            {item.teamAName}
          </ThemedText>
        </View>

        <ThemedText className="text-xs">VS</ThemedText>

        <View className="items-center">
          <Polygon teamCode={item.teamB} />
          <ThemedText className="text-xs mt-1 font-semibold">
            {item.teamBName}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={fixtures}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{
        gap: 12,
        marginBottom: 70,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default FixtureList;
