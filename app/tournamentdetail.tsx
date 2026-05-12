import BackIcon from "@/assets/svg/BackIcon";
import BookMarkIcon from "@/assets/svg/BookMarkIcon";
import ChevronRight from "@/assets/svg/ChevronRight";
import Polygon from "@/components/Polygon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import BracketDiagram from "@/components/BracketDiagram";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { TournamentSession } from "@/components/typings";

const fallbackSession: TournamentSession = {
  tournamentName: "Island Champions Cup",
  location: {
    name: "Victoria Island",
    address: "Victoria Island, Lagos",
  },
  teams: {
    teamOne: "Team Alpha",
    teamTwo: "Team Beta",
  },
  startTime: new Date().toISOString(),
  playersPerTeam: 5,
  setNumber: 3,
};

const bracketTeams = ["Team Alpha", "Team Beta", "VI Strikers", "Marina FC"];
const rewardTabs = ["teams", "fixtures", "rewards"] as const;
const winningTeamRewards = ["Cash Prize", "Cash Prize", "Cash Prize"];
const playerBasedRewards = [
  "Cash Prize",
  "Cash Prize",
  "Cash Prize",
  "Cash Prize",
];

export default function TournamentDetailScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const detailTextColor = colorScheme === "dark" ? "#FFFFFF" : "#000000";
  const mutedDetailTextColor = colorScheme === "dark" ? "#CFCFCF" : "#7D7D7D";
  const fixtureTimeColor = colorScheme === "dark" ? "#CFCFCF" : "#3D3D3D";
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] =
    useState<(typeof rewardTabs)[number]>("teams");

  const session = useMemo<TournamentSession>(() => {
    if (!params.session) return fallbackSession;

    try {
      return JSON.parse(params.session as string);
    } catch {
      return fallbackSession;
    }
  }, [params.session]);

  const startTime = session.startTime
    ? new Date(session.startTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "TBD";

  const fixtures = [
    {
      id: "fixture-1",
      title: "Semi Final 1",
      teams: `${bracketTeams[0]} vs ${bracketTeams[1]}`,
      time: startTime,
    },
    {
      id: "fixture-2",
      title: "Semi Final 2",
      teams: `${bracketTeams[2]} vs ${bracketTeams[3]}`,
      time: "TBD",
    },
    {
      id: "fixture-3",
      title: "Final",
      teams: "Winner SF1 vs Winner SF2",
      time: "TBD",
    },
  ];

  const openTeam = (name: string) => {
    router.push({
      pathname: "/tournamentteam",
      params: {
        teamName: name,
        location: session.location?.name || "Location",
      },
    });
  };

  const TeamBadge = ({ name }: { name: string }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      className="flex-row items-center gap-3 py-4"
      onPress={() => openTeam(name)}
    >
      <Polygon teamCode="TN" size={52} />
      <View className="flex-1">
        <Text
          className="text-base font-[500]"
          style={{ color: detailTextColor }}
        >
          {name}
        </Text>
        <Text className="mt-1 text-xs" style={{ color: mutedDetailTextColor }}>
          {session.location?.name || "Location"}
        </Text>
      </View>
      <ChevronRight width={18} height={18} color={detailTextColor} />
    </TouchableOpacity>
  );

  const RewardItem = ({ label }: { label: string }) => (
    <View className="flex-row items-center gap-2 py-[7px]">
      <BookMarkIcon width={14} height={18} />
      <Text
        className="text-sm font-[400]"
        style={{ color: mutedDetailTextColor }}
      >
        {label}
      </Text>
    </View>
  );

  const RewardsContent = () => (
    <View className="pt-[18px]">
      <View>
        <Text
          className="mb-[12px] text-sm font-[600]"
          style={{ color: detailTextColor }}
        >
          Winning Team Rewards
        </Text>
        {winningTeamRewards.map((reward, index) => (
          <RewardItem key={`winning-team-reward-${index}`} label={reward} />
        ))}
      </View>

      <View className="mt-[28px]">
        <Text
          className="mb-[12px] text-sm font-[600]"
          style={{ color: detailTextColor }}
        >
          Player Based Rewards
        </Text>
        {playerBasedRewards.map((reward, index) => (
          <RewardItem key={`player-based-reward-${index}`} label={reward} />
        ))}
      </View>
    </View>
  );

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

          <View className="mb-7 items-center">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-center text-[24px] font-[700]"
            >
              Victoria Island Cup
            </ThemedText>
            <ThemedText
              lightColor="#3D3D3D"
              darkColor="#9BA1A6"
              className="mt-1 text-center text-sm"
            >
              Tiger Sports Sangotedo, Lagos
            </ThemedText>
            <ThemedText
              lightColor="#3D3D3D"
              darkColor="#9BA1A6"
              className="mt-1 text-center text-sm"
            >
              Tue, Mar 19
            </ThemedText>
          </View>

          <View className="mb-8 min-h-[270px] w-full items-center justify-center overflow-hidden">
            <BracketDiagram />
          </View>
        </View>

        <View className="border-b border-t border-[#E6E6E6] px-[32px] py-[27px]">
          <View className="flex-row items-center gap-[44px]">
            {rewardTabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="items-center"
              >
                <Text
                  className="text-[20px] font-[600]"
                  style={{
                    color: activeTab === tab ? detailTextColor : "#B8B8B8",
                  }}
                >
                  {tab === "teams"
                    ? "Teams"
                    : tab === "fixtures"
                      ? "Fixtures"
                      : "Rewards"}
                </Text>
                <View
                  className={`mt-3 h-[2px] w-[39px] ${
                    activeTab === tab ? "bg-[#69F99B]" : "bg-transparent"
                  }`}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-[32px] pt-5">
          {activeTab === "teams" ? (
            <View>
              {bracketTeams.map((team, index) => (
                <TeamBadge key={team} name={team || `Team ${index + 1}`} />
              ))}
            </View>
          ) : activeTab === "fixtures" ? (
            <View>
              {fixtures.map((fixture, index) => (
                <View
                  key={fixture.id}
                  className={`flex-row items-center border-b border-[#DFDFDF] py-5 ${
                    index === 0 ? "border-t" : ""
                  }`}
                >
                  <View className="mr-4 h-[59px] w-[44px] items-center justify-center border-r border-[#DFDFDF] pr-3">
                    <View
                      className="items-center"
                      style={{ width: 59, transform: [{ rotate: "-90deg" }] }}
                    >
                      <Text
                        className="text-xs"
                        style={{ color: fixtureTimeColor }}
                      >
                        {fixture.time}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-1 gap-3">
                    <View className="flex-row items-center gap-3">
                      <Polygon teamCode="TN" size={29} />
                      <Text
                        className="text-sm font-[500]"
                        style={{ color: detailTextColor }}
                      >
                        Team Name
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <Polygon teamCode="TN" size={29} />
                      <Text
                        className="text-sm font-[500]"
                        style={{ color: detailTextColor }}
                      >
                        Team Name
                      </Text>
                    </View>
                  </View>
                  <View className="ml-4 flex-row items-center">
                    <View className="h-[59px] border-r border-[#DFDFDF]" />
                    <View className="ml-5 gap-3">
                      <Text
                        className="text-sm"
                        style={{ color: mutedDetailTextColor }}
                      >
                        -
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: mutedDetailTextColor }}
                      >
                        -
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <RewardsContent />
          )}
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
