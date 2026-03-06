import {
  getLocation,
  getRevenue,
  getUsersChart,
} from "@/api/ownerDashboardThunk";
import SettingsIcon from "@/assets/svg/SettingsIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function AdminStatisticsScreen() {
  const [period, setPeriod] = useState<
    "this_week" | "this_month" | "this_year"
  >("this_month");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const {
    location,
    usersChart,
    revenueStats,
    loadingUsersChart,
    loadingRevenueStats,
    errorLocation,
    errorUsersChart,
  } = useAppSelector((state) => state.ownerDashboard);

  useEffect(() => {
    dispatch(getLocation());
    if (location?._id) {
      dispatch(getUsersChart(location._id));
      dispatch(getRevenue(location._id));
    }
  }, [dispatch, location?._id]);

  console.log("getUsers response in StatScreen:", usersChart);
  const handlePasswordVisibility = () => {
    setHidePassword((prevState) => !prevState);
  };

  const periodLabels = {
    this_week: "This Week",
    this_month: "This Month",
    this_year: "This Year",
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const barData = useMemo(() => {
    if (!usersChart?.data) return [];

    return usersChart.data.map((item) => ({
      value: item.count,
      label: months[item.month - 1],
      frontColor: "#7987FF",
    }));
  }, [usersChart]);

  const selectedMonthData = useMemo(() => {
    if (!usersChart?.data || selectedMonth === null) return null;

    return usersChart.data.find((item) => item.month === selectedMonth);
  }, [usersChart, selectedMonth]);

  const revenue = hidePassword
    ? "****"
    : (revenueStats?.[period]?.total ?? 0).toLocaleString();

  return (
    <SafeAreaScreen className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: 1,
        }}
      >
        <View className="py-6 px-[35px]">
          <LinearGradient
            colors={["#00492A", "#61C89D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View className="px-[18px] pt-6 pb-9">
              <View className="flex flex-row items-center justify-between">
                <View>
                  <TouchableOpacity
                    onPress={() => setOpenDropdown(!openDropdown)}
                    className="flex-row items-center gap-[3px] bg-[#FFFFFF33] rounded-[10px] p-[10px]"
                  >
                    <Text
                      style={{ fontFamily: "Poppins_600SemiBold" }}
                      className="text-white"
                    >
                      {periodLabels[period]}
                    </Text>

                    <Ionicons
                      size={14}
                      color="#fff"
                      name={
                        openDropdown
                          ? "chevron-up-outline"
                          : "chevron-down-outline"
                      }
                    />
                  </TouchableOpacity>

                  {openDropdown && (
                    <View className="absolute top-12 z-10 bg-white rounded-lg p-2 shadow-md">
                      {Object.entries(periodLabels).map(([key, label]) => (
                        <TouchableOpacity
                          key={key}
                          onPress={() => {
                            setPeriod(key as typeof period);
                            setOpenDropdown(false);
                          }}
                          className="py-2 px-3"
                        >
                          <Text>{label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity className="bg-[#FFFFFF33]  py-2 px-2 rounded-[10px]">
                  <SettingsIcon width={14} height={14} color="#2D264B" />
                </TouchableOpacity>
              </View>

              <View className="mt-8">
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-white text-sm"
                >
                  Revenue:
                </Text>
                <View className="flex flex-row items-center justify-between">
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                    className="text-[40px] items-center text-white"
                  >
                    ₦{revenue}
                  </Text>

                  <Pressable
                    className="bg-[#FFFFFF33] py-[9px] px-2 rounded-full"
                    hitSlop={20}
                    onPress={handlePasswordVisibility}
                  >
                    <Ionicons
                      name={!hidePassword ? "eye" : "eye-off"}
                      size={16}
                      color="#2D264B"
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View className="mt-7 px-[14px] flex flex-row gap-[10px]">
          <View className="border w-full border-[#F1F1F1] rounded pt-4 pb-8 px-6">
            <View className="flex flex-row justify-between bg-white p-2">
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-black text-base"
              >
                Number of Users
              </Text>
              <TouchableOpacity
                onPress={() => setOpenUserDropdown(!openUserDropdown)}
                className="flex-row items-center gap-2"
              >
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-black text-base"
                >
                  {selectedMonth ? months[selectedMonth - 1] : "Select Month"}
                </Text>

                <Ionicons
                  size={14}
                  color="#000"
                  name={
                    openUserDropdown
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                />
              </TouchableOpacity>
            </View>
            {openUserDropdown && (
              <View className="mt-2 bg-white rounded-md shadow">
                {usersChart?.data.map((item) => (
                  <TouchableOpacity
                    key={item.month}
                    onPress={() => {
                      setSelectedMonth(item.month);
                      setOpenUserDropdown(false);
                    }}
                    className="p-2"
                  >
                    <Text>{months[item.month - 1]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View>
              <Text className="mt-3 font-normal text-[32px] text-[#165BAA]">
                {selectedMonthData?.count ?? 0}
              </Text>
            </View>
            <View className="mt-10 w-full">
              <BarChart
                barWidth={22}
                noOfSections={3}
                barBorderRadius={4}
                frontColor="lightgray"
                data={barData}
                yAxisThickness={0}
                xAxisThickness={0}
              />
            </View>
            <View className="flex flex-row gap-[5px] pl-4 items-center pt-6 pb-2">
              <View className="w-2 h-2 bg-[#7987FF] rounded-full" />
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-black text-base"
              >
                Total number of Users:{" "}
                {loadingUsersChart ? "loading..." : usersChart?.total}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-[31px] mt-[29px] flex flex-row gap-[10px]">
          <View className="px-[10px]">
            <ThemedText
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-black text-xs font-normal"
            >
              Ratings
            </ThemedText>
            <Text
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
              className="text-black mt-3 text-[40px]"
            >
              245
            </Text>
          </View>
          <View className="px-[10px]">
            <ThemedText
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-black text-xs"
            >
              Tournaments Hosted
            </ThemedText>
            <ThemedText
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
              className="text-black mt-3 text-[40px]"
            >
              12
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
