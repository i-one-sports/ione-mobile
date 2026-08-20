import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

interface Props {
  title: string;
  isDark: boolean;
  onCalendarPress: () => void;
}

export function FixturesHeader({ title, isDark, onCalendarPress }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
      }}
    >
      <ThemedText
        style={{ fontSize: 22, fontWeight: "800", letterSpacing: -0.5 }}
      >
        {title}
      </ThemedText>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity
          onPress={onCalendarPress}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: isDark ? "#1A1A1A" : "#F0F0F0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={isDark ? "#CCC" : "#444"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
