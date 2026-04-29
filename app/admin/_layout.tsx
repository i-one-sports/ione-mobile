import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display/700Bold";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";

function AdminAppNavigator() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#F3FFFA" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="changepassword"
        options={{ title: "Change Password", headerShown: false }}
      />
      <Stack.Screen
        name="joinsession"
        options={{
          title: "Join Session",
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFFFF" },
        }}
      />
      <Stack.Screen
        name="recentdetails"
        options={{
          title: "Recent Details",
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFFFF" },
        }}
      />

      <Stack.Screen
        name="pricingoption"
        options={{
          title: "Pricing Option",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="pitchcondition"
        options={{
          title: "Pitch Condition",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="transactionhistory"
        options={{
          title: "Transaction History",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function AdminLayout() {
  const [loaded] = useFonts({
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }
  return <AdminAppNavigator />;
}
