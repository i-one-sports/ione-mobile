import BackIcon from "@/assets/svg/BackIcon";
import BookMarkIcon from "@/assets/svg/BookMarkIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import TournamentPlayerCard from "@/components/TournamentPlayerCard";
import { Colors } from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const teamPlayers = [
  {
    title: "Goalkeeper",
    players: [{ id: "gk-1", number: 1, name: "John Doe", initials: "JD" }],
  },
  {
    title: "Defenders",
    players: [
      { id: "df-1", number: 2, name: "John Doe", initials: "JD" },
      { id: "df-2", number: 3, name: "John Doe", initials: "JD" },
    ],
  },
  {
    title: "Midfielders",
    players: [
      { id: "mf-1", number: 7, name: "John Doe", initials: "JD" },
      { id: "mf-2", number: 10, name: "John Doe", initials: "JD" },
      { id: "mf-3", number: 11, name: "John Doe", initials: "JD" },
    ],
  },
  {
    title: "Forward",
    players: [{ id: "fw-1", number: 9, name: "John Doe", initials: "JD" }],
  },
];

const accolades = ["Tournament MVP", "Best Defence", "Clean Sheet"];
const accoladeImage = require("@/assets/images/accolade.png");

export default function TournamentTeamScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const textColor = colorScheme === "dark" ? "#FFFFFF" : "#000000";
  const mutedTextColor = colorScheme === "dark" ? "#CFCFCF" : "#B8B8B8";
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"players" | "accolades">(
    "players",
  );

  const teamName = (params.teamName as string) || "Team Name";
  const location = (params.location as string) || "Location";

  return (
    <SafeAreaScreen>
      <ScrollView
        className="h-full flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="px-[32px] py-6">
          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <BackIcon />
            </TouchableOpacity>
            <TouchableOpacity>
              <BookMarkIcon />
            </TouchableOpacity>
          </View>

          <View className="mb-8 items-center">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-center text-[20px] font-[700]"
            >
              {teamName}
            </ThemedText>
            <ThemedText
              lightColor="#3D3D3D"
              darkColor="#9BA1A6"
              className="mt-1 text-center text-xs"
            >
              {location}
            </ThemedText>
          </View>
        </View>

        <View className="border-b border-t border-[#E6E6E6] px-[32px] py-[20px]">
          <View className="flex-row items-center gap-[24px]">
            {(["players", "accolades"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                className="items-center"
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  className="text-[14px] font-[600]"
                  style={{
                    color: activeTab === tab ? textColor : mutedTextColor,
                  }}
                >
                  {tab === "players" ? "Players" : "Accolades"}
                </Text>
                <View
                  className={`absolute bottom-[-21.8px] h-[2px] w-full ${
                    activeTab === tab ? "bg-[#69F99B]" : "bg-transparent"
                  }`}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-[32px] pt-[35px]">
          {activeTab === "players" ? (
            <View className="gap-[25px]">
              {teamPlayers.map((section) => (
                <View key={section.title}>
                  <Text
                    className="mb-[15px] text-[13px] font-[700]"
                    style={{ color: textColor }}
                  >
                    {section.title}
                  </Text>
                  <View className="gap-[13px]">
                    {section.players.map((player) => (
                      <TournamentPlayerCard
                        key={player.id}
                        number={player.number}
                        name={player.name}
                        initials={player.initials}
                        textColor={textColor}
                        mutedTextColor={mutedTextColor}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between gap-y-[18px]">
              {accolades.map((accolade) => (
                <View
                  key={accolade}
                  className="w-[48%] items-center rounded-[5px] bg-[#EDFFF8] px-[10px] py-[14px]"
                >
                  <Image
                    source={accoladeImage}
                    resizeMode="contain"
                    className="h-[110px] w-full"
                    accessibilityLabel={accolade}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
