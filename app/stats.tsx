import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

const STAT_CARDS = [
  { icon: "sports-soccer" as const, value: "10", label: "Goals" },
  { icon: "thumb-up" as const, value: "8", label: "Assists" },
  { icon: "event-available" as const, value: "15", label: "Matches" },
  { icon: "military-tech" as const, value: "67%", label: "Win Rate" },
];

const STAT_ROWS = [
  { label: "Goals", value: "10" },
  { label: "Assists", value: "8" },
  { label: "Total Matches Played", value: "15" },
  { label: "Wins", value: "10" },
  { label: "Losses", value: "5" },
  { label: "Win Rate", value: "67%" },
];

const SEASONS = ["23/24", "22/23", "21/22"];

export default function Stats() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedSeason, setSelectedSeason] = useState("23/24");

  const accent = isDark ? "#00FF94" : "#00cc77";
  const cardBg = isDark ? "#0D2B1F" : "#D4F5E9";
  const surfaceBg = isDark ? "#141414" : "#fff";
  const borderColor = isDark ? "#242424" : "#efefef";
  const rowDivider = isDark ? "#1e1e1e" : "#f5f5f5";

  return (
    <SafeAreaScreen className="flex-1">
      {/* Header */}
      <View className="flex-row justify-between items-center w-full px-[35px] mb-8">
        <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
          Stats
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 20,
          }}
        >
          <MaterialIcons
            name="arrow-back"
            size={15}
            color={isDark ? "#fff" : "#111"}
          />
          <ThemedText style={{ fontSize: 13, fontWeight: "500" }}>
            Profile
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="w-full px-[35px] pb-10" style={{ gap: 32 }}>
          {/* Stat Cards 2×2 Grid */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {STAT_CARDS.slice(0, 2).map((card) => (
                <View
                  key={card.label}
                  style={{
                    flex: 1,
                    backgroundColor: cardBg,
                    borderRadius: 16,
                    paddingVertical: 22,
                    paddingHorizontal: 12,
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${accent}22`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name={card.icon} size={22} color={accent} />
                  </View>
                  <ThemedText
                    lightColor={accent}
                    darkColor={accent}
                    style={{ fontSize: 30, fontWeight: "800", lineHeight: 36 }}
                  >
                    {card.value}
                  </ThemedText>
                  <ThemedText
                    lightColor="#555"
                    darkColor="#aaa"
                    style={{ fontSize: 11, fontWeight: "500" }}
                  >
                    {card.label}
                  </ThemedText>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {STAT_CARDS.slice(2, 4).map((card) => (
                <View
                  key={card.label}
                  style={{
                    flex: 1,
                    backgroundColor: cardBg,
                    borderRadius: 16,
                    paddingVertical: 22,
                    paddingHorizontal: 12,
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${accent}22`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name={card.icon} size={22} color={accent} />
                  </View>
                  <ThemedText
                    lightColor={accent}
                    darkColor={accent}
                    style={{ fontSize: 30, fontWeight: "800", lineHeight: 36 }}
                  >
                    {card.value}
                  </ThemedText>
                  <ThemedText
                    lightColor="#555"
                    darkColor="#aaa"
                    style={{ fontSize: 11, fontWeight: "500" }}
                  >
                    {card.label}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Season Statistics */}
          <View style={{ gap: 16 }}>
            {/* Section header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                Season Statistics
              </ThemedText>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <ThemedText style={{ fontSize: 12, fontWeight: "600" }}>
                  {selectedSeason}
                </ThemedText>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={16}
                  color={isDark ? "#aaa" : "#555"}
                />
              </TouchableOpacity>
            </View>

            {/* Stats rows card */}
            <View
              style={{
                backgroundColor: surfaceBg,
                borderRadius: 16,
                borderWidth: 1,
                borderColor,
                overflow: "hidden",
              }}
            >
              {STAT_ROWS.map((row, index) => (
                <View
                  key={row.label}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 18,
                    borderBottomWidth: index < STAT_ROWS.length - 1 ? 1 : 0,
                    borderBottomColor: rowDivider,
                  }}
                >
                  <ThemedText
                    lightColor="#555"
                    darkColor="#aaa"
                    style={{ fontSize: 13 }}
                  >
                    {row.label}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14, fontWeight: "700" }}>
                    {row.value}
                  </ThemedText>
                </View>
              ))}
            </View>

            {/* Info note */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: cardBg,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <MaterialIcons name="info-outline" size={15} color={accent} />
              <ThemedText
                lightColor="#555"
                darkColor="#aaa"
                style={{ fontSize: 11, flex: 1, lineHeight: 17 }}
              >
                Additional stats depend on player position and may vary each
                season.
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
