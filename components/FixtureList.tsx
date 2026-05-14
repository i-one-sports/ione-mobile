import RightArrow from "@/assets/svg/RightArrow";
import { useAppSelector } from "@/redux/store";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  ListRenderItem,
  Platform,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Polygon from "./Polygon";
import { ThemedText } from "./ThemedText";
import { Fixture } from "./typings";

interface Props {
  limit?: number;
}

const FixtureList: React.FC<Props> = ({ limit }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  // On iOS the tab bar is absolutely positioned and overlays content, so we
  // need extra bottom clearance. On Android it pushes content up natively.
  const bottomPadding = Platform.OS === "ios" ? insets.bottom + 80 : 32;
  const { sessions } = useAppSelector((state) => state.sessions);

  const allFixtures: Fixture[] = sessions.map((s) => ({
    id: s._id,
    time: "14:00",
    teamA: s.teamOne?.name?.slice(0, 2).toUpperCase() || "NA",
    teamAName: s.teamOne?.name || "Unknown",
    teamB: s.teamTwo?.name?.slice(0, 2).toUpperCase() || "NA",
    teamBName: s.teamTwo?.name || "Unknown",
    type: s.matchType || "Match",
  }));

  const fixtures = limit ? allFixtures.slice(0, limit) : allFixtures;

  const handleFixturePress = (fixture: Fixture) => {
    router.push({ pathname: "/fixtureDetails", params: fixture });
  };

  const cardBg = isDark ? "#0D2B1F" : "#EDFFF8";
  const cardBorder = isDark ? "#1a3d2b" : "#c8f5e2";
  const accent = isDark ? "#00FF94" : "#00cc77";

  const renderItem: ListRenderItem<Fixture> = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleFixturePress(item)}
      style={{
        backgroundColor: cardBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: cardBorder,
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 12,
      }}
    >
      {/* Top row: time | type badge | arrow */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ThemedText lightColor="#555" darkColor="#aaa" style={{ fontSize: 11 }}>
          {item.time}
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
            {item.type}
          </ThemedText>
        </View>
        <RightArrow />
      </View>

      {/* Teams row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <View style={{ alignItems: "center", flex: 1 }}>
          <Polygon teamCode={item.teamA} />
          <ThemedText
            style={{
              fontSize: 11,
              marginTop: 4,
              fontWeight: "600",
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {item.teamAName}
          </ThemedText>
        </View>

        <ThemedText
          lightColor="#aaa"
          darkColor="#555"
          style={{ fontSize: 12, fontWeight: "700" }}
        >
          VS
        </ThemedText>

        <View style={{ alignItems: "center", flex: 1 }}>
          <Polygon teamCode={item.teamB} />
          <ThemedText
            style={{
              fontSize: 11,
              marginTop: 4,
              fontWeight: "600",
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {item.teamBName}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (allFixtures.length === 0) {
    return (
      <View
        style={{
          backgroundColor: isDark ? "#0D2B1F" : "#EDFFF8",
          borderRadius: 12,
          paddingVertical: 32,
          alignItems: "center",
          gap: 8,
        }}
      >
        <ThemedText
          lightColor="#666"
          darkColor="#aaa"
          style={{ fontSize: 13, textAlign: "center" }}
        >
          No upcoming fixtures yet
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={fixtures}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ gap: 10, paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
    />
  );
};

export default FixtureList;
