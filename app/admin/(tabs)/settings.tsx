import { getSummary } from "@/api/ownerDashboardThunk";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
import { ThemedText } from "@/components/ThemedText";
import { logout } from "@/redux/reducers/auth";
import { persistor, useAppDispatch, useAppSelector } from "@/redux/store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, TouchableOpacity, View, ScrollView } from "react-native";
import { Toast } from "toastify-react-native";
import { useColorScheme } from "nativewind";

export default function AdminSettingsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { dashboardSummary, location } = useAppSelector(
    (state) => state.ownerDashboard,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location?._id) {
      dispatch(getSummary(location?._id));
    }
  }, [dispatch]);

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
    <View className="flex-1 dark:bg-black">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 35,
          paddingTop: 64,
          paddingBottom: 105,
          flexGrow: 1,
        }}
      >
        <View className="flex-1 justify-between">
          <View>
            <View className="flex flex-row items-center justify-between">
              <ThemedText
                style={{ fontFamily: "Poppins_600SemiBold" }}
                className="text-xl"
                darkColor="#FFFFFF"
                lightColor="#000000"
              >
                Settings
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.navigate("/admin/notification")}
                className="bg-[#00FF943B] rounded-[10px] w-[30px] h-[32px] items-center justify-center"
              >
                <AdminNotificationIcon />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row mt-12 py-5 items-center justify-between">
              <ThemedText
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[15px]"
                darkColor="#FFFFFF"
                lightColor="#000000"
              >
                Open Hours
              </ThemedText>
              <View className="flex flex-row gap-[9px]">
                <ThemedText
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-[15px]"
                  darkColor="#FFFFFF"
                  lightColor="#000000"
                >
                  {!dashboardSummary?.openingHour && "8am"}-
                  {!dashboardSummary?.closingHour && "10pm"}
                </ThemedText>
                <TouchableOpacity className="bg-[#00000033] dark:bg-[#FFFFFF1A] rounded-[10px] p-[5px]">
                  <MaterialIcons
                    name="chevron-right"
                    color={isDark ? "#fff" : "#00000033"}
                    size={15}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/admin/changepassword")}
              className="flex flex-row mt-12 py-5 items-center justify-between"
            >
              <ThemedText
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[15px]"
                darkColor="#FFFFFF"
                lightColor="#000000"
              >
                Change Password
              </ThemedText>

              <View className="bg-[#00000033] dark:bg-[#FFFFFF1A] rounded-[10px] p-[5px]">
                <MaterialIcons
                  name="chevron-right"
                  color={isDark ? "#fff" : "#00000033"}
                  size={15}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/admin/pitchcondition")}
              className="flex flex-row mt-4 py-5 items-center justify-between"
            >
              <ThemedText
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[15px]"
                darkColor="#FFFFFF"
                lightColor="#000000"
              >
                Update Pitch Condition
              </ThemedText>
              <View className="bg-[#00000033] dark:bg-[#FFFFFF1A] rounded-[10px] p-[5px]">
                <MaterialIcons
                  name="chevron-right"
                  color={isDark ? "#fff" : "#00000033"}
                  size={15}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/admin/pricingoption")}
              className="flex flex-row mt-4 py-5 items-center justify-between"
            >
              <ThemedText
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[15px]"
                darkColor="#FFFFFF"
                lightColor="#000000"
              >
                Pricing Options
              </ThemedText>
              <View className="bg-[#00000033] dark:bg-[#FFFFFF1A] rounded-[10px] p-[5px]">
                <MaterialIcons
                  name="chevron-right"
                  color={isDark ? "#fff" : "#00000033"}
                  size={15}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/admin/transactionhistory")}
              className="flex flex-row mt-4 py-5 items-center justify-between"
            >
              <ThemedText
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[15px]"
                darkColor="#FFFFFF"
                lightColor="#000000"
              >
                Transaction History
              </ThemedText>
              <View className="bg-[#00000033] dark:bg-[#FFFFFF1A] rounded-[10px] p-[5px]">
                <MaterialIcons
                  name="chevron-right"
                  color={isDark ? "#fff" : "#00000033"}
                  size={15}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-6">
            <TouchableOpacity
              onPress={handleLogout}
              disabled={isLoading}
              className="flex flex-row items-center justify-between"
            >
              <ThemedText
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[15px]"
                darkColor="#FFFFFF"
                lightColor="#000000"
              >
                {isLoading ? "Logging out..." : "Logout"}
              </ThemedText>

              <MaterialIcons name="logout" size={20} color="#FF00008C" />
            </TouchableOpacity>

            <View className="flex flex-row items-center justify-between">
              <ThemedText
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[15px]"
                darkColor="#FFFFFF"
                lightColor="#000000"
              >
                Delete Account
              </ThemedText>
              <TouchableOpacity className="bg-[#FF00008C] rounded-[10px] p-3">
                <MaterialIcons name="logout" size={20} color="#2D264B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
