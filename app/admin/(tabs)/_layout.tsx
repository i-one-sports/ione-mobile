import HomeIcon from "@/assets/svg/HomeIcon";
import SessionsIcon from "@/assets/svg/SessionsIcon";
import SettingsIcon from "@/assets/svg/SettingsIcon";
import SatisticsIcon from "@/assets/svg/StatisticsIcon";
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
        sceneStyle: { backgroundColor: "#F3FFFA" },
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
          default: {
            backgroundColor: "#F3FFFA",
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          sceneStyle: { backgroundColor: "#FFFFFF" },
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color} width={28} height={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="fixtures"
        options={{
          title: "Fixtures",

          tabBarIcon: ({ color }) => (
            <SessionsIcon color={color} width={28} height={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistics",

          tabBarIcon: ({ color }) => (
            <SatisticsIcon color={color} width={28} height={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",

          tabBarIcon: ({ color }) => (
            <SettingsIcon color={color} width={28} height={28} />
          ),
        }}
      />
    </Tabs>
  );
}
