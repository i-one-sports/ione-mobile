import React from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import Polygon from "@/components/Polygon";

interface Props {
  teamCode: string;
  name: string;
  subtitle: string;
  /** Right-hand label, e.g. "Next up" or "3rd". */
  position: string;
  /** Show the position as a green pill (the team that plays next). */
  highlight?: boolean;
  onPress?: () => void;
}

// Same card style as PlayerInfoCard, with a team polygon instead of an avatar.
export default function TeamQueueRow({
  teamCode,
  name,
  subtitle,
  position,
  highlight,
  onPress,
}: Props) {
  const isDark = useColorScheme() === "dark";

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
        paddingVertical: 13,
        borderBottomWidth: 2,
        borderBottomColor: isDark ? "#1a3d2b" : "#6BF8BD",
        backgroundColor: isDark ? "#0D1F17" : "#EDFFF8",
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 15, flex: 1 }}
      >
        <Polygon teamCode={teamCode} size={44} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: isDark ? "#fff" : "#111",
            }}
          >
            {name}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 12,
              marginTop: 2,
              color: isDark ? "#9BA1A6" : "#6D717F",
            }}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      {highlight ? (
        <View
          style={{
            backgroundColor: isDark ? "#00FF9425" : "#00FF9430",
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: isDark ? "#00FF94" : "#00A85A",
            }}
          >
            {position}
          </Text>
        </View>
      ) : (
        <Text style={{ fontSize: 13, color: isDark ? "#9BA1A6" : "#6D717F" }}>
          {position}
        </Text>
      )}
    </TouchableOpacity>
  );
}
