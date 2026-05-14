import HomeIcon from "@/assets/svg/HomeIcon";
import ProfileIcon from "@/assets/svg/ProfileIcon";
import SessionsIcon from "@/assets/svg/SessionsIcon";
import TournamentIcon from "@/assets/svg/TournamentIcon";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color} width={28} height={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",

          tabBarIcon: ({ color }) => (
            <SessionsIcon color={color} width={28} height={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="tournaments"
        options={{
          title: "Tournaments",

          tabBarIcon: ({ color }) => (
            <TournamentIcon color={color} width={28} height={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({ color }) => (
            <ProfileIcon color={color} width={28} height={28} />
          ),
        }}
      />
    </Tabs>
  );
}
