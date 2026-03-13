import { getLocation, getSummary } from "@/api/ownerDashboardThunk";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function AdminPitchConditionScreen() {
  const pitchState = [
    {
      id: 1,
      state: "Good",
    },
    {
      id: 2,
      state: "Maintenance",
    },
    {
      id: 3,
      state: "Bad",
    },
  ];
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [pitchCondition, setPitchCondition] = useState<string>("");
  const dispatch = useAppDispatch();
  const { dashboardSummary, loadingSummmary, location } = useAppSelector(
    (state) => state.ownerDashboard,
  );

  useEffect(() => {
    dispatch(getLocation());
    if (location?._id) {
      dispatch(getSummary(location._id));
    }
  }, [dispatch, location?._id]);
  return (
    <SafeAreaScreen className="flex-1">
      <View className="py-6 px-[35px] flex-1">
        <View>
          <View className="flex flex-row items-center justify-between">
            <ThemedText
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-black text-xl"
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
              <Text>
                {loadingSummmary
                  ? "loading.."
                  : dashboardSummary?.pitchCondition}
              </Text>

              <View className="bg-[#00000033] rounded-[10px] p-[5px]">
                <Ionicons
                  size={14}
                  color="#00000033"
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
                    setPitchCondition(item.state);
                  }}
                  className="p-2"
                >
                  <Text>{item.state}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="mt-auto mb-[42px]">
          <TouchableOpacity>
            <ThemedText
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-[#000000] text-center py-5 text-[15px] bg-[#00FF94]"
            >
              Update
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaScreen>
  );
}
