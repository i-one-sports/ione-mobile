import Polygon from "@/components/Polygon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import React from "react";
import { ScrollView, Text, View } from "react-native";

type Team = {
  name: string;
  code: string;
};

type Match = {
  id: string;
  time: string;
  teams: Team[];
  minute?: string;
  scores: [number | string, number | string];
};

export default function Approved() {
  const competitions: Match[] = [
    {
      id: "1",
      time: "14:00",
      teams: [
        { name: "Team Name", code: "TN" },
        { name: "Team Name", code: "TN" },
      ],
      minute: "85'",
      scores: [2, 0],
    },
    {
      id: "2",
      time: "16:30",
      teams: [
        { name: "Team Name", code: "TN" },
        { name: "Team Name", code: "TN" },
      ],
      minute: "85'",
      scores: ["?", "?"],
    },
    {
      id: "3",
      time: "12:00",
      teams: [
        { name: "Team Name", code: "TN" },
        { name: "Team Name", code: "TN" },
      ],
      minute: "45'",
      scores: [1, 1],
    },
    {
      id: "4",
      time: "15:00",
      teams: [
        { name: "Team Name", code: "TN" },
        { name: "Team Name", code: "TN" },
      ],
      minute: "60'",
      scores: [0, 3],
    },
    {
      id: "5",
      time: "15:00",
      teams: [
        { name: "Team Name", code: "TN" },
        { name: "Team Name", code: "TN" },
      ],
      minute: "60'",
      scores: [0, 3],
    },
  ];

  const MatchRow = ({ match }: { match: Match }) => {
    return (
      <View className="flex flex-row justify-between py-4 items-center border-t border-b border-[#DFDFDF]">
        {/* Time */}
        <View className="px-2 border-r border-[#DFDFDF] self-stretch justify-center">
          <Text className="-rotate-90">{match.time}</Text>
        </View>

        {/* Teams */}
        <View className="flex flex-col gap-[3px]">
          {match.teams.map((team, index) => (
            <View key={index} className="flex flex-row gap-2 items-center">
              <Polygon size={30} teamCode={team.code} />
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-sm"
              >
                {team.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Minute */}
        {match.minute && (
          <Text
            className="text-xs"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            {match.minute}
          </Text>
        )}

        {/* Score */}
        <View className="flex flex-col gap-[14px] border-l border-[#DFDFDF] px-8 self-stretch justify-center">
          <Text>{match.scores[0]}</Text>
          <Text>{match.scores[1]}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaScreen className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: 1,
        }}
      >
        <View className="px-[35px] gap-4">
          {competitions.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
