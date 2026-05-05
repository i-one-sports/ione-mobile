import {
  getLocation,
  getSummary,
  getTransactionHistory,
} from "@/api/ownerDashboardThunk";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
import MoneyIcon from "@/assets/svg/MoneyIcon";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

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

  return (
    <View className="flex-1 dark:bg-black">
      <View className="pb-6 pt-16 px-[35px] flex-1">
        <View>
          <View className="flex flex-row items-center justify-between">
            <ThemedText
              darkColor="#FFFFFF"
              lightColor="#000000"
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-xl"
            >
              Transaction History
            </ThemedText>
            <TouchableOpacity className="bg-[#00FF943B] rounded-[10px] w-[30px] h-[32px] items-center justify-center">
              <AdminNotificationIcon />
            </TouchableOpacity>
          </View>

          <ThemedText
            darkColor="#FFFFFF"
            lightColor="#000000"
            style={{ fontFamily: "Poppins_500Medium" }}
            className="mt-5 text-lg"
          >
            Recent Activity
          </ThemedText>
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
          {transactionHistory.length === 0 && (
            <ThemedText
              darkColor="#FFFFFF"
              lightColor="#000000"
              className="text-center mt-10"
            >
              No transactions yet
            </ThemedText>
          )}
          {transactionHistory.map((group) => (
            <View className="mt-3" key={group.date}>
              <ThemedText darkColor="#FFFFFF" lightColor="#7D7D7D">
                {formatDate(group.date)}
              </ThemedText>

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
                      <ThemedText
                        darkColor="#FFFFFF"
                        lightColor="#000000"
                        style={{ fontFamily: "Poppins_500Medium" }}
                        className="text-lg"
                      >
                        {item.teamName}
                      </ThemedText>

                      <View className="mt-1 flex-row items-center gap-5">
                        <ThemedText
                          darkColor="#FFFFFF"
                          lightColor="#7D7D7D"
                          style={{ fontFamily: "Poppins_300Light" }}
                          className="text-sm"
                        >
                          {dayjs(item.sessionStartTime).format("h:mm A")}
                        </ThemedText>

                        <View className="h-1 w-1 bg-[#000000BF] rounded-full" />

                        <ThemedText
                          darkColor="#FFFFFF"
                          lightColor="#7D7D7D"
                          style={{ fontFamily: "Poppins_300Light" }}
                          className="text-sm"
                        >
                          {item.pricingOption}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  <ThemedText
                    darkColor="#FFFFFF"
                    lightColor="#000000"
                    style={{ fontFamily: "Poppins_500Medium" }}
                  >
                    ₦{item.totalPaid.toLocaleString()}
                  </ThemedText>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
