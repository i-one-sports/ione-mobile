import { getSummary } from "@/api/ownerDashboardThunk";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
import ChevronRight from "@/assets/svg/ChevronRight";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { logout } from "@/redux/reducers/auth";
import { persistor, useAppDispatch, useAppSelector } from "@/redux/store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Toast } from "toastify-react-native";

export default function AdminSettingsScreen() {
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
    <SafeAreaScreen className="flex-1">
      <View className="py-6 px-[35px] flex-1 justify-between">
        <View>
          <View className="flex flex-row items-center justify-between">
            <ThemedText
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-black text-xl"
            >
              Settings
            </ThemedText>
            <TouchableOpacity className="bg-[#00FF943B] rounded-[10px] w-[30px] h-[32px] items-center justify-center">
              <AdminNotificationIcon />
            </TouchableOpacity>
          </View>

          <View className="flex flex-row mt-12 py-5 items-center justify-between">
            <ThemedText
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-black text-[15px]"
            >
              Open Hours
            </ThemedText>
            <View className="flex flex-row gap-[9px]">
              <ThemedText
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#00000080] text-[15px]"
              >
                {!dashboardSummary?.openingHour && "8am"}-
                {!dashboardSummary?.closingHour && "10pm"}
              </ThemedText>
              <TouchableOpacity className="bg-[#00000033] rounded-[10px] p-[5px]">
                <ChevronRight />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/admin/changepassword")}
            className="flex flex-row mt-12 py-5 items-center justify-between"
          >
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-black text-[15px]"
            >
              Change Password
            </Text>

            <View className="bg-[#00000033] rounded-[10px] p-[5px]">
              <ChevronRight />
            </View>
          </TouchableOpacity>
          <View className="flex flex-row mt-4 py-5 items-center justify-between">
            <ThemedText
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-black text-[15px]"
            >
              Change Account Number
            </ThemedText>
            <TouchableOpacity className="bg-[#00000033] rounded-[10px] p-[5px]">
              <ChevronRight />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-col gap-6">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoading}
            className="flex flex-row items-center justify-between"
          >
            <ThemedText
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-black text-[15px]"
            >
              {isLoading ? "Logging out..." : "Logout"}
            </ThemedText>

            <MaterialIcons name="logout" size={20} color="#FF00008C" />
          </TouchableOpacity>

          <View className="flex flex-row items-center justify-between">
            <ThemedText
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-black text-[15px]"
            >
              Delete Account
            </ThemedText>
            <TouchableOpacity className="bg-[#FF00008C] rounded-[10px] p-3">
              <MaterialIcons name="logout" size={20} color="#2D264B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaScreen>
  );
}
