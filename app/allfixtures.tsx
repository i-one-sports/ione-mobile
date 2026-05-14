import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import FixtureList from "@/components/FixtureList";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View, useColorScheme } from "react-native";

export default function AllFixturesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaScreen className="flex-1">
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 35,
          paddingTop: 24,
          paddingBottom: 20,
        }}
      >
        <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
          All Fixtures
        </ThemedText>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <MaterialIcons
            name="arrow-back"
            size={15}
            color={isDark ? "#fff" : "#111"}
          />
          <ThemedText style={{ fontSize: 13, fontWeight: "500" }}>
            Back
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Full fixture list (no limit) */}
      <View style={{ flex: 1, paddingHorizontal: 35 }}>
        <FixtureList />
      </View>
    </SafeAreaScreen>
  );
}
