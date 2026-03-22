import {
  getLocation,
  getSummary,
  getTransactionHistory,
} from "@/api/ownerDashboardThunk";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
import MoneyIcon from "@/assets/svg/MoneyIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function AdminTransactionHistoryScreen() {
  const recentActivity = [
    {
      id: 1,
      teamName: "Eagle FC.",
      time: "5:00PM",
      booking: "Hourly Booking",
      date: "2026-03-19T17:00:00Z",
      price: "#5,000",
    },
    {
      id: 2,
      teamName: "Falcons FC.",
      time: "7:00PM",
      booking: "Weekly Booking",
      date: "2026-03-19T17:00:00Z",
      price: "#25,000",
    },
    {
      id: 3,
      teamName: "Captains FC.",
      time: "10:50PM",
      booking: "Hourly Booking",
      date: "2026-03-19T17:00:00Z",
      price: "#5,000",
    },
    {
      id: 4,
      teamName: "Eagle FC.",
      time: "10:50PM",
      booking: "Hourly Booking",
      date: "2026-03-16T17:00:00Z",
      price: "#5,000",
    },
    {
      id: 5,
      teamName: "Falcons FC.",
      time: "10:50PM",
      booking: "Hourly Booking",
      date: "2026-03-16T17:00:00Z",
      price: "#25,000",
    },
    {
      id: 6,
      teamName: "Captains FC.",
      time: "10:50PM",
      booking: "Hourly Booking",
      date: "2026-03-16T17:00:00Z",
      price: "#5,000",
    },
    {
      id: 7,
      teamName: "Captains FC.",
      time: "10:50PM",
      booking: "Hourly Booking",
      date: "2026-03-16T17:00:00Z",
      price: "#5,000",
    },
    {
      id: 8,
      teamName: "Captains FC.",
      time: "10:50PM",
      booking: "Hourly Booking",
      date: "2026-03-16T17:00:00Z",
      price: "#5,000",
    },
    {
      id: 9,
      teamName: "Captains FC.",
      time: "10:50PM",
      booking: "Hourly Booking",
      date: "2026-03-16T17:00:00Z",
      price: "#5,000",
    },
    {
      id: 10,
      teamName: "Captains FC.",
      time: "10:50PM",
      booking: "Hourly Booking",
      date: "2026-03-16T17:00:00Z",
      price: "#5,000",
    },
  ];
  const formatDate = (date: string) => {
    if (dayjs(date).isSame(dayjs(), "day")) return "Today";
    if (dayjs(date).isSame(dayjs().subtract(1, "day"), "day"))
      return "Yesterday";
    return dayjs(date).format("ddd D MMM");
  };

  //   const grouped = recentActivity.reduce(
  //     (
  //       acc: Record<string, { label: string; activities: typeof recentActivity }>,
  //       item,
  //     ) => {
  //       const dateKey = dayjs(item.date).format("YYYY-MM-DD");
  //       if (!acc[dateKey]) {
  //         acc[dateKey] = {
  //           label: getLabel(dateKey),
  //           activities: [],
  //         };
  //       }
  //       acc[dateKey].activities.push(item);
  //       return acc;
  //     },
  //     {},
  //   );
  const dispatch = useAppDispatch();
  const { location, transactionHistory } = useAppSelector(
    (state) => state.ownerDashboard,
  );

  useEffect(() => {
    dispatch(getLocation());
    if (location?._id) {
      dispatch(getSummary(location._id));
      dispatch(getTransactionHistory(location._id));
    }
  }, [dispatch, location?._id]);

  console.log(location);
  return (
    <SafeAreaScreen className="flex-1">
      <View className="py-6 px-[35px] flex-1">
        <View>
          <View className="flex flex-row items-center justify-between">
            <ThemedText
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-black text-xl"
            >
              Transaction History
            </ThemedText>
            <TouchableOpacity className="bg-[#00FF943B] rounded-[10px] w-[30px] h-[32px] items-center justify-center">
              <AdminNotificationIcon />
            </TouchableOpacity>
          </View>

          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-black mt-5 text-lg"
          >
            Recent Activity
          </Text>
        </View>
        {/* <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(grouped).map(([date, group]) => (
            <View className="mt-3" key={date}>
              <Text className="text-[#7D7D7D]">{group.label}</Text>

              {group.activities.map((item) => (
                <View className="mt-2 flex-row items-center justify-between py-3 px-[10px]">
                  <View className="flex-row items-center gap-4">
                    <View className="bg-[#00FF9433] h-10 w-10 flex-row items-center justify-center rounded-full">
                      <MoneyIcon />
                    </View>
                    <View>
                      <Text
                        style={{ fontFamily: "Poppins_500Medium" }}
                        className="text-black text-lg"
                        key={item.id}
                      >
                        {item.teamName}
                      </Text>
                      <View className="mt-1 flex-row items-center gap-5">
                        <Text
                          style={{ fontFamily: "Poppins_300Light" }}
                          className="text-[#7D7D7D] text-sm"
                        >
                          {item.time}
                        </Text>
                        <View className="h-1 w-1 bg-[#000000BF] rounded-full" />
                        <Text
                          style={{ fontFamily: "Poppins_300Light" }}
                          className="text-[#7D7D7D] text-sm"
                        >
                          {item.booking}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text
                    style={{ fontFamily: "Poppins_500Medium" }}
                    className="text-black"
                  >
                    {item.price}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView> */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {transactionHistory.map((group) => (
            <View className="mt-3" key={group.date}>
              <Text className="text-[#7D7D7D]">{formatDate(group.date)}</Text>

              {group.entries.map((item) => (
                <View
                  key={item.setId}
                  className="mt-2 flex-row items-center justify-between py-3 px-[10px]"
                >
                  <View className="flex-row items-center gap-4">
                    <View className="bg-[#00FF9433] h-10 w-10 items-center justify-center rounded-full">
                      <MoneyIcon />
                    </View>

                    <View>
                      <Text
                        style={{ fontFamily: "Poppins_500Medium" }}
                        className="text-black text-lg"
                      >
                        {item.teamName}
                      </Text>

                      <View className="mt-1 flex-row items-center gap-5">
                        <Text
                          style={{ fontFamily: "Poppins_300Light" }}
                          className="text-[#7D7D7D] text-sm"
                        >
                          {dayjs(item.sessionStartTime).format("h:mm A")}
                        </Text>

                        <View className="h-1 w-1 bg-[#000000BF] rounded-full" />

                        <Text
                          style={{ fontFamily: "Poppins_300Light" }}
                          className="text-[#7D7D7D] text-sm"
                        >
                          {item.pricingOption}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text
                    style={{ fontFamily: "Poppins_500Medium" }}
                    className="text-black"
                  >
                    ₦{item.totalPaid.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaScreen>
  );
}
