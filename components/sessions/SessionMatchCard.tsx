import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Match } from "./types";

interface Props {
  match: Match;
  sessionData?: any;
}

export function SessionMatchCard({ match, sessionData }: Props) {
  const handlePress = () => {
    if (sessionData) {
      router.push({
        pathname: "/joinsession",
        params: { session: JSON.stringify(sessionData) },
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="border-b border-gray-200 items-center justify-center p-3"
    >
      <View className="mb-3 flex-row justify-between" />
      <View className="mb-3 flex w-full flex-row items-center justify-between">
        <Text className="origin-center rotate-[-90deg] text-sm font-medium">
          {match.time}
        </Text>

        <View className="w-full flex-1 flex-col relative items-start gap-2 whitespace-nowrap border-l-[1px] border-[#DFDFDF] pl-4">
          <View className="flex flex-row border-[0.1px] border-primary">
            <ThemedText lightColor="#00FF94">
              {match.sessionData?.location?.name ?? "Unknown Location"}
            </ThemedText>
          </View>

          <View className="flex-row flex-1 items-center justify-between w-full pr-[23px]">
            <View className="flex flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center">
                <Image
                  source={require("@/assets/images/dropdownpolygon.png")}
                  resizeMode="contain"
                  className="h-full w-full"
                />
                <View className="absolute inset-0 items-center justify-center">
                  <Text className="text-xs font-bold text-black">
                    {match.teams.team1.initials}
                  </Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium">
                  {match.teams.team1.name}
                </Text>
                {match.teams.team1.number && (
                  <Text className="text-xs text-gray-500">
                    {match.teams.team1.number}
                  </Text>
                )}
              </View>
            </View>
            <Text
              className={`text-[12px] ${match.joined ? "hidden" : "flex"} font-bold text-black`}
            >
              {match.team1score}
            </Text>
          </View>

          <View className="absolute right-[50px] top-0 bottom-0 border-[#DFDFDF] border-r-[1px] px-3 justify-center">
            <Text className="text-sm font-medium text-black">
              {match.minute}
            </Text>
          </View>

          <View className="flex-row flex-1 items-center justify-between w-full pr-[23px]">
            <View className="flex flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center">
                <Image
                  source={require("@/assets/images/dropdownpolygon.png")}
                  resizeMode="contain"
                  className="h-full w-full"
                />
                <View className="absolute inset-0 items-center justify-center">
                  <Text className="text-xs font-bold text-black">
                    {match.teams.team2.initials}
                  </Text>
                </View>
              </View>
              <Text className="flex-1 text-sm font-medium">
                {match.teams.team2.name}
              </Text>
            </View>
            <Text
              className={`text-[12px] ${match.joined ? "hidden" : "flex"} font-bold text-black`}
            >
              {match.team2score}
            </Text>
          </View>
        </View>

        {match.joined && (
          <TouchableOpacity
            onPress={handlePress}
            className="absolute bg-[#00FF94] px-[5px] rounded-[5px] font-[400] py-[20px] right-[5px]"
          >
            <Text className="origin-center flex items-center justify-center text-center rotate-[-90deg] text-sm font-medium">
              join
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
