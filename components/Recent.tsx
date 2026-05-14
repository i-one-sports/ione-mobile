import RightArrow from "@/assets/svg/RightArrow";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import Polygon from "./Polygon";
import { ThemedText } from "./ThemedText";

type RecentProps = {
  matchId: string;
  date: string;
  type?: string;
  homeTeamInitial: string;
  homeTeamId: string;
  awayTeamId: string;
  awayTeamInitial: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
};

export const getInitials = (name: string) => {
  if (!name) return "";
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
};

export const formateDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
};

export default function Recent({
  matchId,
  date,
  type,
  homeTeamInitial,
  awayTeamInitial,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
}: RecentProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const accent = isDark ? "#00FF94" : "#00cc77";
  const cardBg = isDark ? "#0D2B1F" : "#EDFFF8";
  const cardBorder = isDark ? "#1a3d2b" : "#c8f5e2";
  const scoreBg = isDark ? "rgba(0,255,148,0.1)" : "rgba(0,204,119,0.08)";

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/admin/recentdetails",
          params: { matchId, date },
        })
      }
      style={{
        backgroundColor: cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: cardBorder,
        paddingVertical: 14,
        paddingHorizontal: 18,
        gap: 12,
      }}
    >
      {/* Top row: date | type badge | arrow */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ThemedText lightColor="#777" darkColor="#888" style={{ fontSize: 11 }}>
          {formateDate(date)}
        </ThemedText>

        <View
          style={{
            backgroundColor: `${accent}22`,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 20,
          }}
        >
          <ThemedText
            lightColor={accent}
            darkColor={accent}
            style={{ fontSize: 10, fontWeight: "600" }}
          >
            {type || "Friendly"}
          </ThemedText>
        </View>

        <RightArrow color={isDark ? "#00FF94" : "#00cc77"} />
      </View>

      {/* Teams + score */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Home team */}
        <View style={{ alignItems: "center", flex: 1 }}>
          <Polygon teamCode={getInitials(homeTeamInitial)} />
          <ThemedText
            style={{
              fontSize: 11,
              marginTop: 4,
              fontWeight: "600",
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {homeTeamName}
          </ThemedText>
        </View>

        {/* Score */}
        <View
          style={{
            backgroundColor: scoreBg,
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 8,
            alignItems: "center",
            minWidth: 72,
          }}
        >
          <ThemedText
            style={{ fontSize: 20, fontWeight: "800", letterSpacing: 2 }}
          >
            {homeScore}
            <ThemedText
              lightColor="#ccc"
              darkColor="#555"
              style={{ fontSize: 16 }}
            >
              {" "}
              –{" "}
            </ThemedText>
            {awayScore}
          </ThemedText>
          <ThemedText
            lightColor="#aaa"
            darkColor="#666"
            style={{ fontSize: 9, marginTop: 2 }}
          >
            FT
          </ThemedText>
        </View>

        {/* Away team */}
        <View style={{ alignItems: "center", flex: 1 }}>
          <Polygon teamCode={getInitials(awayTeamInitial)} />
          <ThemedText
            style={{
              fontSize: 11,
              marginTop: 4,
              fontWeight: "600",
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {awayTeamName}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}
