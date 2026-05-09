import {
  getLocation,
  getSummary,
  updatePitchCondition,
} from "@/api/ownerDashboardThunk";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
import { useColorScheme } from "nativewind";
import { ThemedText } from "@/components/ThemedText";
import { PitchConditionType } from "@/components/typings/apiResponse";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Toast } from "toastify-react-native";
import { formatPitchCondition } from "@/utils/formatPitchCondition";

export default function AdminPitchConditionScreen() {
  const { colorScheme } = useColorScheme();
  const pitchState = [
    {
      id: 1,
      label: "Excellent",
      value: "excellent",
    },
    {
      id: 2,
      label: "Good",
      value: "good",
    },
    {
      id: 3,
      label: "Fair",
      value: "fair",
    },
    {
      id: 4,
      label: "Poor",
      value: "poor",
    },
    {
      id: 5,
      label: "Wet",
      value: "wet",
    },
    {
      id: 6,
      label: "Under Maintenance",
      value: "under_maintenance",
    },
  ] as const;
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [pitchCondition, setPitchCondition] = useState<PitchConditionType>();
  const { dashboardSummary, location, loadingPitchCondition } = useAppSelector(
    (state) => state.ownerDashboard,
  );

  useEffect(() => {
    dispatch(getLocation());
    if (location?._id) {
      dispatch(getSummary(location._id));
    }
  }, [dispatch, location?._id]);

  const handleUpdatePitch = async () => {
    if (!location?._id || !pitchCondition) return;

    try {
      const res = await dispatch(
        updatePitchCondition({
          locationId: location._id,
          pitchCondition,
        }),
      ).unwrap();

      Toast.show({
        type: "success",
        text1: "Success",
        text2: res.message,
      });
      router.replace("/admin/(tabs)");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.message || "Failed to update pitch condition",
      });
    }
  };

  return (
    <View className="flex-1 dark:bg-black">
      <View className="pb-6 pt-16 px-[35px] flex-1">
        <View>
          <View className="flex flex-row items-center justify-between">
            <ThemedText
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-xl"
              darkColor="#FFFFFF"
              lightColor="#000000"
            >
              Pitch Condition
            </ThemedText>
            <TouchableOpacity className="bg-[#00FF943B] rounded-[10px] w-[30px] h-[32px] items-center justify-center">
              <AdminNotificationIcon />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setOpenDropdown(!openDropdown)}
            className="mt-12 relative"
          >
            <View
              style={{ borderColor: "#B2B2B2", borderRadius: 5 }}
              className="flex-row px-[10px] border h-14 items-center justify-between"
            >
              <ThemedText darkColor="#FFFFFF" lightColor="#000000">
                {pitchCondition ||
                  formatPitchCondition(dashboardSummary?.pitchCondition) ||
                  "Select condition"}
              </ThemedText>

              <View className="bg-[#00000033] dark:bg-[#FFFFFF1A] rounded-[10px] p-[5px]">
                <Ionicons
                  size={14}
                  color={isDark ? "#fff" : "#00000033"}
                  name={
                    openDropdown ? "chevron-up-outline" : "chevron-down-outline"
                  }
                />
              </View>
            </View>
          </TouchableOpacity>

          {openDropdown && (
            <View className="mt-2 bg-white rounded-md shadow">
              {pitchState?.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setOpenDropdown(false);
                    setPitchCondition(item.value);
                  }}
                  className="p-2"
                >
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="mt-auto mb-[42px]">
          <TouchableOpacity onPress={handleUpdatePitch}>
            <ThemedText
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-[#000000] text-center py-5 text-[15px] bg-[#00FF94]"
            >
              {loadingPitchCondition ? "Updating...." : "Update"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
