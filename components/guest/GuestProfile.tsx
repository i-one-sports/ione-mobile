import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { SettingsRow } from "@/components/admin/settings/SettingsRow";
import { SettingsSection } from "@/components/admin/settings/SettingsSection";
import { openWebPage, PRIVACY_URL, TERMS_URL } from "@/constants/legal";
import { setReturnRoute } from "@/utils/pendingDeepLink";

// Profile tab for signed-out users: what an account gives you, sign in or
// create one, and the Terms / Privacy links.
export default function GuestProfile() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const accent = isDark ? "#00FF94" : "#00A85A";
  const muted = isDark ? "#9BA1A6" : "#6D717F";

  const go = (path: "/(onboarding)/signin" | "/(onboarding)/role") => {
    setReturnRoute({ pathname: "/profile" });
    router.push(path);
  };

  return (
    <SafeAreaScreen className="flex-1">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 110,
        }}
      >
        <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
          Profile
        </ThemedText>

        <View
          style={{
            alignItems: "center",
            gap: 12,
            marginTop: 40,
            marginBottom: 32,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isDark ? "#0D2B1F" : "#E8FFF4",
            }}
          >
            <Ionicons name="person-outline" size={34} color={accent} />
          </View>
          <ThemedText
            style={{ fontSize: 20, fontWeight: "700", textAlign: "center" }}
          >
            Join i-One
          </ThemedText>
          <Text
            style={{
              color: muted,
              fontSize: 14,
              lineHeight: 20,
              textAlign: "center",
            }}
          >
            Sign in to join and book games, pay your share, track your stats and
            badges, and vote for player of the session.
          </Text>
        </View>

        <View style={{ gap: 12, marginBottom: 32 }}>
          <TouchableOpacity
            onPress={() => go("/(onboarding)/signin")}
            accessibilityRole="button"
            style={{
              paddingVertical: 16,
              borderRadius: 10,
              alignItems: "center",
              backgroundColor: "#1DE98B",
            }}
          >
            <Text style={{ color: "#000", fontSize: 16, fontWeight: "700" }}>
              Sign in
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => go("/(onboarding)/role")}
            accessibilityRole="button"
            style={{
              paddingVertical: 16,
              borderRadius: 10,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: accent,
            }}
          >
            <Text style={{ color: accent, fontSize: 16, fontWeight: "600" }}>
              Create account
            </Text>
          </TouchableOpacity>
        </View>

        <SettingsSection title="Legal">
          <SettingsRow
            icon="description"
            iconColor="#607D8B"
            label="Terms and Conditions"
            onPress={() => openWebPage(TERMS_URL)}
          />
          <SettingsRow
            icon="privacy-tip"
            iconColor="#607D8B"
            label="Privacy Policy"
            onPress={() => openWebPage(PRIVACY_URL)}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaScreen>
  );
}
