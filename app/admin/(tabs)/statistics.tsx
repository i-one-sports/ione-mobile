import {
  getLocation,
  getRevenue,
  getUsersChart,
} from "@/api/ownerDashboardThunk";
import SettingsIcon from "@/assets/svg/SettingsIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const PERIOD_LABELS: Record<string, string> = {
  this_week: "This Week",
  this_month: "This Month",
  this_year: "This Year",
};

export default function AdminStatisticsScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [period, setPeriod] = useState<
    "this_week" | "this_month" | "this_year"
  >("this_month");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const [hideRevenue, setHideRevenue] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const dispatch = useAppDispatch();
  const { location, usersChart, revenueStats, loadingUsersChart } =
    useAppSelector((state) => state.ownerDashboard);

  useEffect(() => {
    dispatch(getLocation());
    if (location?._id) {
      dispatch(getUsersChart(location._id));
      dispatch(getRevenue(location._id));
    }
  }, [dispatch, location?._id]);

  const barData = useMemo(() => {
    if (!usersChart?.data) return [];
    return usersChart.data.map((item) => ({
      value: item.count,
      label: MONTHS[item.month - 1],
    }));
  }, [usersChart]);

  const selectedMonthData = useMemo(() => {
    if (!usersChart?.data || selectedMonth === null) return null;
    return usersChart.data.find((item) => item.month === selectedMonth);
  }, [usersChart, selectedMonth]);

  const revenueAmount = (revenueStats?.[period]?.total ?? 0).toLocaleString();
  const displayRevenue = hideRevenue ? "••••••" : `₦${revenueAmount}`;

  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "#242424" : "#F1F1F1";
  const accent = isDark ? "#00FF94" : "#00cc77";
  const statCardBg = isDark ? "#0D2B1F" : "#D4F5E9";
  const dropdownBg = isDark ? "#1e1e1e" : "#fff";
  const dropdownBorder = isDark ? "#2e2e2e" : "#e0e0e0";

  return (
    <SafeAreaScreen className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Revenue Card ── */}
        <View
          style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4 }}
        >
          <LinearGradient
            colors={["#00492A", "#61C89D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 20 }}
          >
            {/* Top row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Period selector */}
              <View style={{ position: "relative" }}>
                <TouchableOpacity
                  onPress={() => setOpenDropdown(!openDropdown)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      color: "#fff",
                      fontSize: 12,
                    }}
                  >
                    {PERIOD_LABELS[period]}
                  </Text>
                  <Ionicons
                    name={
                      openDropdown
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                    size={13}
                    color="#fff"
                  />
                </TouchableOpacity>

                {openDropdown && (
                  <View
                    style={{
                      position: "absolute",
                      top: 44,
                      left: 0,
                      zIndex: 20,
                      backgroundColor: dropdownBg,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: dropdownBorder,
                      minWidth: 140,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 8,
                      overflow: "hidden",
                    }}
                  >
                    {Object.entries(PERIOD_LABELS).map(
                      ([key, label], index, arr) => (
                        <TouchableOpacity
                          key={key}
                          onPress={() => {
                            setPeriod(key as typeof period);
                            setOpenDropdown(false);
                          }}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                            borderBottomColor: dropdownBorder,
                            backgroundColor:
                              period === key
                                ? isDark
                                  ? "#0D2B1F"
                                  : "#EDFFF8"
                                : "transparent",
                          }}
                        >
                          <ThemedText
                            style={{
                              fontSize: 13,
                              fontWeight: period === key ? "600" : "400",
                            }}
                            lightColor={period === key ? accent : "#333"}
                            darkColor={period === key ? accent : "#ccc"}
                          >
                            {label}
                          </ThemedText>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                )}
              </View>

              {/* Settings shortcut */}
              <TouchableOpacity
                onPress={() => router.push("/admin/settings")}
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  padding: 9,
                }}
              >
                <SettingsIcon width={16} height={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Revenue amount */}
            <View style={{ marginTop: 28 }}>
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                }}
              >
                Total Revenue
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlayfairDisplay_700Bold",
                    color: "#fff",
                    fontSize: 38,
                    letterSpacing: -1,
                  }}
                >
                  {displayRevenue}
                </Text>
                <Pressable
                  onPress={() => setHideRevenue((v) => !v)}
                  hitSlop={16}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    padding: 9,
                  }}
                >
                  <Ionicons
                    name={hideRevenue ? "eye-off" : "eye"}
                    size={17}
                    color="#fff"
                  />
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── Quick Stat Cards ── */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 24,
            marginTop: 20,
          }}
        >
          {[
            { icon: "star" as const, label: "Ratings", value: "245" },
            {
              icon: "sports-soccer" as const,
              label: "Matches Played",
              value: "12",
            },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                backgroundColor: statCardBg,
                borderRadius: 16,
                paddingVertical: 20,
                paddingHorizontal: 14,
                alignItems: "center",
                gap: 6,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${accent}22`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name={stat.icon} size={20} color={accent} />
              </View>
              <ThemedText
                lightColor={accent}
                darkColor={accent}
                style={{ fontSize: 28, fontWeight: "800", lineHeight: 34 }}
              >
                {stat.value}
              </ThemedText>
              <ThemedText
                lightColor="#555"
                darkColor="#aaa"
                style={{ fontSize: 11, fontWeight: "500", textAlign: "center" }}
              >
                {stat.label}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* ── Users Chart Card ── */}
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 20,
            backgroundColor: cardBg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: cardBorder,
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 18,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: cardBorder,
            }}
          >
            <ThemedText
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Number of Users
            </ThemedText>

            {/* Month selector */}
            <View style={{ position: "relative" }}>
              <TouchableOpacity
                onPress={() => setOpenUserDropdown(!openUserDropdown)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <ThemedText style={{ fontSize: 12, fontWeight: "500" }}>
                  {selectedMonth ? MONTHS[selectedMonth - 1] : "All"}
                </ThemedText>
                <Ionicons
                  name={
                    openUserDropdown
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                  size={12}
                  color={isDark ? "#aaa" : "#555"}
                />
              </TouchableOpacity>

              {openUserDropdown && usersChart?.data && (
                <View
                  style={{
                    position: "absolute",
                    top: 38,
                    right: 0,
                    zIndex: 20,
                    backgroundColor: dropdownBg,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: dropdownBorder,
                    minWidth: 110,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 8,
                    elevation: 8,
                    overflow: "hidden",
                  }}
                >
                  {usersChart.data.map((item, index) => (
                    <TouchableOpacity
                      key={item.month}
                      onPress={() => {
                        setSelectedMonth(item.month);
                        setOpenUserDropdown(false);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderBottomWidth:
                          index < usersChart.data.length - 1 ? 1 : 0,
                        borderBottomColor: dropdownBorder,
                        backgroundColor:
                          selectedMonth === item.month
                            ? isDark
                              ? "#0D2B1F"
                              : "#EDFFF8"
                            : "transparent",
                      }}
                    >
                      <ThemedText
                        style={{ fontSize: 13 }}
                        lightColor={
                          selectedMonth === item.month ? accent : "#333"
                        }
                        darkColor={
                          selectedMonth === item.month ? accent : "#ccc"
                        }
                      >
                        {MONTHS[item.month - 1]}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Selected month count */}
          <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
            <ThemedText
              lightColor="#888"
              darkColor="#666"
              style={{ fontSize: 11 }}
            >
              {selectedMonth ? MONTHS[selectedMonth - 1] : "All time"}
            </ThemedText>
            <ThemedText
              lightColor="#165BAA"
              darkColor={accent}
              style={{ fontSize: 36, fontWeight: "800", lineHeight: 44 }}
            >
              {selectedMonthData?.count ?? usersChart?.total ?? 0}
            </ThemedText>
          </View>

          {/* Bar chart */}
          <View
            style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16 }}
          >
            <BarChart
              barWidth={20}
              noOfSections={3}
              barBorderRadius={4}
              frontColor={isDark ? "#00FF94" : "#00cc77"}
              data={barData}
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisTextStyle={{ color: isDark ? "#555" : "#aaa", fontSize: 9 }}
              xAxisLabelTextStyle={{
                color: isDark ? "#aaa" : "#777",
                fontSize: 9,
              }}
              isAnimated
            />
          </View>

          {/* Footer legend */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: cardBorder,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isDark ? "#00FF94" : "#00cc77",
              }}
            />
            <ThemedText
              lightColor="#555"
              darkColor="#aaa"
              style={{ fontSize: 12 }}
            >
              Total users:{" "}
              <ThemedText style={{ fontWeight: "700", fontSize: 12 }}>
                {loadingUsersChart ? "..." : (usersChart?.total ?? 0)}
              </ThemedText>
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
