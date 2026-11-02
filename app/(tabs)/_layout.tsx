import HomeIcon from "@/assets/svg/HomeIcon";
import ProfileIcon from "@/assets/svg/ProfileIcon";
import SessionsIcon from "@/assets/svg/SessionsIcon";
import TournamentIcon from "@/assets/svg/TournamentIcon";
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

  // iOS: the native tab bar — on iOS 26 the floating Liquid Glass bar (as in
  // Sofascore), which shrinks while scrolling down. Icons are SF Symbols,
  // outline when idle and filled when selected. Android keeps the bar below.
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
        <NativeTabs.Trigger name="sessions">
          <Label>Sessions</Label>
          <Icon sf={{ default: "sportscourt", selected: "sportscourt.fill" }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="tournaments">
          <Label>Tournaments</Label>
          <Icon sf={{ default: "trophy", selected: "trophy.fill" }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Label>Profile</Label>
          <Icon sf={{ default: "person", selected: "person.fill" }} />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
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
