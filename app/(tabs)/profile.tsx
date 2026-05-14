import ProfileSkeleton from "@/components/ProfileSkeleton";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { PlayerDetailsCard } from "@/components/profile/PlayerDetailsCard";
import { ProfileCard } from "@/components/profile/ProfileCard";
import {
  convertHeightToFeet,
  formatDate,
  getPositionName,
} from "@/components/profile/utils";
import { logout } from "@/redux/reducers/auth";
import { persistor, useAppDispatch, useAppSelector } from "@/redux/store";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Toast } from "toastify-react-native";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const accent = isDark ? "#00FF94" : "#00cc77";

  const formattedUserData = useMemo(() => {
    if (!user) return null;
    return {
      firstName: user.firstName || "Not set",
      lastName: user.lastName || "Not set",
      nickname: user.nickname || "Not set",
      dateOfBirth: formatDate(user.dateOfBirth || ""),
      height: convertHeightToFeet(user.height || 0),
      placeOfBirth: user.placeOfBirth || "Not set",
      position: getPositionName(user.position || ""),
      email: user.email || "Not set",
      phoneNumber: user.phoneNumber || "Not set",
      address: user.address || "Not set",
      isCaptain: user.isCaptain ? "Yes" : "No",
      isAdmin: user.isAdmin ? "Yes" : "No",
    };
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            try {
              setIsLoggingOut(true);
              dispatch(logout());
              router.replace("/(onboarding)/signin");
              SecureStore.deleteItemAsync("i-one").catch(() => {});
              SecureStore.deleteItemAsync("user-data").catch(() => {});
              persistor.purge().catch(() => {});
              Toast.show({
                type: "success",
                text1: "Logged out",
                text2: "See you soon!",
              });
            } catch {
              setIsLoggingOut(false);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please try again.",
              });
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  if (isLoggingOut) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }} />
    );
  }

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
          paddingBottom: 8,
        }}
      >
        <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
          Profile
        </ThemedText>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push("/stats")}
            style={{
              backgroundColor: `${accent}20`,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderWidth: 1,
              borderColor: `${accent}44`,
            }}
          >
            <ThemedText
              lightColor={accent}
              darkColor={accent}
              style={{ fontSize: 12, fontWeight: "600" }}
            >
              Stats
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#DC262620",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#DC262640",
            }}
          >
            <MaterialIcons name="logout" size={17} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
      >
        {!user || !formattedUserData ? (
          <ProfileSkeleton />
        ) : (
          <>
            <ProfileCard
              avatar={user.avatar}
              nickname={user.nickname}
              firstName={user.firstName}
              data={formattedUserData}
            />
            <PlayerDetailsCard data={formattedUserData} />
          </>
        )}
      </ScrollView>
    </SafeAreaScreen>
  );
}
