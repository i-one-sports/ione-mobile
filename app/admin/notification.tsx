import React, { useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setNotification } from "@/redux/reducers/ownerDashboard";
import EventSource from "react-native-sse";
import * as SecureStore from "expo-secure-store";

export default function Notification() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const latestNotification = useAppSelector(
    (state) => state.ownerDashboard.latestNotification,
  );

  useEffect(() => {
    let es: EventSource;

    const initSSE = async () => {
      const token = await SecureStore.getItemAsync("i-one");
      if (!token) return;

      es = new EventSource(
        `${process.env.EXPO_PUBLIC_API_URL}/notifications/stream`,
        {
          headers: {
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      es.addEventListener("message", (event) => {
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);
          dispatch(setNotification(data));
        } catch (err) {
          console.log("SSE parse error", err);
        }
      });

      es.addEventListener("error", (err) => {
        console.log("SSE error", err);
      });
    };

    initSSE();

    // Cleanup on unmount
    return () => {
      es?.close();
    };
  }, []);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 35,
          paddingTop: 64,
          paddingBottom: 120,
          flexGrow: 1,
        }}
      >
        <View className="flex-1">
          <View className="flex flex-row items-center gap-8">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={28}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
            <ThemedText
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-2xl"
              lightColor="#000000"
              darkColor="#FFFFFF"
            >
              Notifications
            </ThemedText>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 35 }}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText
              style={{ fontFamily: "Poppins_500Medium" }}
              lightColor="#000000"
              darkColor="#FFFFFF"
              className="text-xl text-center mt-10"
            >
              {latestNotification?.body || "No notification"}
            </ThemedText>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
