import React from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  setNumber: number;
  teamOne: string;
  teamTwo: string;
  teamOneScore: number;
  teamTwoScore: number;
  onPress?: () => void;
  /** e.g. "To review" / "Disputed" for Referee-mode results. */
  badge?: { label: string; tone: "warning" | "danger" };
}

// Same card style as PlayerInfoCard: one finished set, tap for its result.
export default function SetPlayedRow({
  setNumber,
  teamOne,
  teamTwo,
  teamOneScore,
  teamTwoScore,
  onPress,
  badge,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const textColor = isDark ? "#fff" : "#111";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 31,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 2,
        borderBottomColor: isDark ? "#1a3d2b" : "#6BF8BD",
        backgroundColor: isDark ? "#0D1F17" : "#EDFFF8",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: isDark ? "#aaa" : "#6D717F",
            minWidth: 18,
          }}
        >
          S{setNumber}
        </Text>
        <Text style={{ fontSize: 15, color: textColor }}>
          {teamOne}{" "}
          <Text style={{ fontWeight: "800" }}>
            {teamOneScore} – {teamTwoScore}
          </Text>{" "}
          {teamTwo}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {badge && (
          <View
            style={{
              borderRadius: 20,
              paddingHorizontal: 8,
              paddingVertical: 3,
              backgroundColor:
                badge.tone === "danger" ? "#FF444425" : "#FFB80030",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: badge.tone === "danger" ? "#FF4444" : "#B8860B",
              }}
            >
              {badge.label}
            </Text>
          </View>
        )}
        <Ionicons name="arrow-forward" size={20} color={textColor} />
      </View>
    </TouchableOpacity>
  );
}
