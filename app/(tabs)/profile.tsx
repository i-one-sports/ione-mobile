/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useMemo } from "react";
import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
  useColorScheme,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import * as SecureStore from "expo-secure-store";
import { Toast } from "toastify-react-native";
import { logout } from "@/redux/reducers/auth";
import { persistor, useAppDispatch, useAppSelector } from "@/redux/store";
import { Colors } from "@/constants/Colors";
import ProfileSkeleton from "@/components/ProfileSkeleton";

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "Not set";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

// Helper function to convert height from cm to feet/inches
const convertHeightToFeet = (cm: number) => {
  if (!cm) return "Not set";
  const inches = cm * 0.393701;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}ft ${remainingInches}in`;
};

// Helper function to get position name
const getPositionName = (positionCode: string) => {
  const positions: { [key: string]: string } = {
    GK: "Goalkeeper",
    DF: "Defender",
    MF: "Midfielder",
    FW: "Forward",
    ST: "Striker",
    CM: "Central Midfielder",
    CDM: "Defensive Midfielder",
    CAM: "Attacking Midfielder",
    LW: "Left Winger",
    RW: "Right Winger",
    CB: "Center Back",
    LB: "Left Back",
    RB: "Right Back",
  };
  return positions[positionCode] || positionCode || "Not set";
};

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const { width, height } = Dimensions.get("window");
  const theme = Colors[colorScheme ?? "light"];
  const iconColor = colorScheme === "dark" ? "#F5FFF2BA" : "#1C1C1C";
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  // Memoized user data formatting
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

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);

              // Retrieve token for API logout if needed
              const token = await SecureStore.getItemAsync("i-one");

              // Dispatch Redux logout to reset auth slice
              dispatch(logout());

              // Remove tokens from SecureStore
              await SecureStore.deleteItemAsync("i-one");
              await SecureStore.deleteItemAsync("user-data");

              // Clear Redux persist storage
              await persistor.purge();

              // Navigate back to onboarding or login
              router.replace("/(onboarding)/signin");

              Toast.show({
                type: "success",

                text1: "Success",
                text2: "You have been logged out successfully.",
              });
            } catch (error) {
              console.log("Logout error:", error);
              Toast.show({
                type: "error",

                text1: "Error",
                text2: "Please try again.",
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <SafeAreaScreen className="flex-1">
      <View className="py-6 px-[35px]">
        <View className="flex-row justify-between flex items-center w-full">
          <ThemedText className="text-2xl font-semibold">Profile</ThemedText>
          <View className="flex-row gap-4 items-center">
            <TouchableOpacity onPress={() => router.push("/stats")}>
              <ThemedText className="text-sm font-medium">Stats</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              disabled={isLoading}
              className="flex-row items-center gap-1"
            >
              <MaterialIcons name="logout" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="mt-10"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 90,
            flexGrow: 1,
          }}
        >
          {!user ? (
            <ProfileSkeleton />
          ) : (
            <>
              <View className="bg-white dark:bg-[#111111] p-4 rounded-md">
                <View className="flex-row gap-4 items-center pb-4 border-b border-gray-100 dark:border-zinc-900">
                  <Image
                    source={user?.avatar}
                    resizeMode="contain"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 100,
                      objectFit: "contain",
                    }}
                  />
                  <View>
                    {/* Use nickname or full name as the display name */}
                    <ThemedText className="text-xl font-semibold uppercase">
                      Hi, {user?.nickname || user?.firstName}
                    </ThemedText>
                    <ThemedText className="mt-1 text-base">
                      {formattedUserData?.phoneNumber}
                    </ThemedText>
                  </View>
                </View>
                <View className="flex flex-row justify-between py-4 items-center border-b border-gray-100 dark:border-zinc-900">
                  <ThemedText className="text-xl font-normal">Name:</ThemedText>
                  <ThemedText className="text-base" lightColor="#00FF94">
                    {formattedUserData?.firstName} {formattedUserData?.lastName}
                  </ThemedText>
                </View>
                <View className="flex flex-row justify-between items-center border-b py-4 border-gray-100 dark:border-zinc-900">
                  <ThemedText className="text-xl font-normal">
                    Email:
                  </ThemedText>
                  <ThemedText className="text-base" lightColor="#00FF94">
                    {formattedUserData?.email}
                  </ThemedText>
                </View>
                <View className="flex flex-row justify-between items-center pt-4">
                  <ThemedText className="text-xl font-normal">
                    Position:
                  </ThemedText>
                  <ThemedText className="text-base" lightColor="#00FF94">
                    {formattedUserData?.position}
                  </ThemedText>
                </View>
              </View>
              <View className="bg-white dark:bg-[#111111] p-4 rounded-md mt-4">
                <View className="flex flex-row justify-between items-center border-b py-4 border-gray-100 dark:border-zinc-900">
                  <ThemedText className="text-xl font-normal">
                    Date of Birth:
                  </ThemedText>
                  <ThemedText className="text-base" lightColor="#00FF94">
                    {formattedUserData?.dateOfBirth}
                  </ThemedText>
                </View>

                <View className="flex flex-row justify-between items-center border-b py-4 border-gray-100 dark:border-zinc-900">
                  <ThemedText className="text-xl font-normal">
                    Height:
                  </ThemedText>
                  <ThemedText className="text-base" lightColor="#00FF94">
                    {formattedUserData?.height}
                  </ThemedText>
                </View>

                <View className="flex flex-row justify-between items-center border-b py-4 border-gray-100 dark:border-zinc-900">
                  <ThemedText className="text-xl font-normal">
                    Place of Birth:
                  </ThemedText>
                  <ThemedText className="text-base" lightColor="#00FF94">
                    {formattedUserData?.placeOfBirth}
                  </ThemedText>
                </View>

                <View className="flex flex-row justify-between items-center border-b py-4 border-gray-100 dark:border-zinc-900">
                  <ThemedText className="text-xl font-normal">
                    Captain:
                  </ThemedText>
                  <ThemedText className="text-base" lightColor="#00FF94">
                    {formattedUserData?.isCaptain}
                  </ThemedText>
                </View>

                <View className="flex flex-row justify-between items-center border-b py-4 border-gray-100 dark:border-zinc-900">
                  <ThemedText className="text-xl font-normal">
                    Phone:
                  </ThemedText>
                  <ThemedText className="text-base" lightColor="#00FF94">
                    {formattedUserData?.phoneNumber}
                  </ThemedText>
                </View>

                <View className="flex flex-row justify-between items-center pt-4">
                  <ThemedText className="text-xl font-normal">
                    Address:
                  </ThemedText>
                  <ThemedText className="text-base" lightColor="#00FF94">
                    {formattedUserData?.address}
                  </ThemedText>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaScreen>
  );
}
