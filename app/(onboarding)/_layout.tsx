import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function OnboardingLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? "#000" : "#fff" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="role" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="resetpassword" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="forgottenpassword" />
      <Stack.Screen name="success" />
      <Stack.Screen name="admin-signup" />
      <Stack.Screen name="admin-signup-2" />
    </Stack>
  );
}
