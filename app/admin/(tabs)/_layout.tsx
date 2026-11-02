import HomeIcon from "@/assets/svg/HomeIcon";
import SessionsIcon from "@/assets/svg/SessionsIcon";
import SettingsIcon from "@/assets/svg/SettingsIcon";
import SatisticsIcon from "@/assets/svg/StatisticsIcon";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import { DynamicColorIOS, Platform } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // iOS: the native tab bar — on iOS 26 the floating Liquid Glass bar (as in
  // Sofascore). Same tabs as below, with SF Symbols. Android is unchanged.
  if (Platform.OS === "ios") {
    return (
      <NativeTabs
        tintColor={DynamicColorIOS({ light: "#00A85A", dark: "#00FF94" })}
        minimizeBehavior="onScrollDown"
      >
        <NativeTabs.Trigger name="index">
          <Label>Home</Label>
          <Icon sf={{ default: "house", selected: "house.fill" }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="fixtures">
          <Label>Fixtures</Label>
          <Icon sf={{ default: "calendar", selected: "calendar" }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="statistics">
          <Label>Statistics</Label>
          <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <Label>Settings</Label>
          <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: isDark ? "#000" : "#F3FFFA",
        },
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          sceneStyle: { backgroundColor: isDark ? "#000" : "#FFFFFF" },
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
