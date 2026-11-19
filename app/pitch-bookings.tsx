import PitchDayTimeline from "@/components/PitchDayTimeline";
import DayStrip, { type DayStatus } from "@/components/booking/DayStrip";
import { getSessionsByLocation } from "@/api/sessions";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  formatDayShort,
  freeGaps,
  locationDayKey,
  todayKey,
  upcomingDays,
} from "@/utils/pitchSlots";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// Any player can check when a pitch is booked over the next 14 days (from
// Home → a pitch → See bookings), then start a session on the chosen day.
export default function PitchBookings() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];

  const params = useLocalSearchParams<{
    pitchId?: string;
    pitchName?: string;
    pitchAddress?: string;
    pitchOpening?: string;
    pitchClosing?: string;
    pitchHourly?: string;
    pitchPrice?: string;
  }>();
  const dispatch = useAppDispatch();
  const days = useMemo(() => upcomingDays(), []);
  const [day, setDay] = useState(todayKey());
  const byDay = useAppSelector((state) => state.sessions.locationSessionsByDay);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";

  // All 14 days, for the dots: green has an hour free, red is full.
  useEffect(() => {
    if (!params.pitchId) return;
    days.forEach((d) =>
      dispatch(getSessionsByLocation({ locationId: params.pitchId!, date: d })),
    );
  }, [dispatch, params.pitchId, days, refreshKey]);

  const status: Record<string, DayStatus> = {};
  if (params.pitchId)
    for (const d of days) {
      const s = byDay[locationDayKey(params.pitchId, d)];
      if (s)
        status[d] = freeGaps(
          s,
          d,
          params.pitchOpening,
          params.pitchClosing,
        ).some((g) => g.end - g.start >= 60)
          ? "free"
          : "full";
    }

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    // The timeline shows its own loading state; release the pull at once.
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <SafeAreaScreen>
      <ScrollView
        className="flex-1 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF94"
            colors={["#00FF94"]}
          />
        }
      >
        <View className="mx-[24px] gap-[24px]">
          {/* Header */}
          <View>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={isDark ? "#fff" : "#111"}
                />
              </TouchableOpacity>
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[20px] font-[600]"
              >
                Bookings
              </ThemedText>
              <View style={{ width: 22 }} />
            </View>
            <View className="mt-[6px] items-center gap-[2px]">
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[15px] font-[700]"
              >
                {params.pitchName ?? "Pitch"}
              </ThemedText>
              {!!params.pitchAddress && (
                <Text style={{ color: mutedColor, fontSize: 13 }}>
                  {params.pitchAddress}
                </Text>
              )}
            </View>
          </View>

          <DayStrip
            days={days}
            selected={day}
            onSelect={setDay}
            status={status}
          />

          <View className="gap-[12px]">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[17px] font-[700]"
            >
              {day === todayKey() ? "Today · " : ""}
              {formatDayShort(day)}
            </ThemedText>
            {params.pitchId ? (
              <PitchDayTimeline
                locationId={params.pitchId}
                date={day}
                openingHour={params.pitchOpening}
                closingHour={params.pitchClosing}
                skipFetch
              />
            ) : (
              <Text style={{ color: mutedColor }}>Pitch not found.</Text>
            )}
          </View>

          {!!params.pitchId && (
            <CustomButton
              primary
              title="Create a session here"
              onPress={() =>
                router.push({
                  pathname: "/screens/newsession",
                  params: {
                    pitchId: params.pitchId,
                    pitchName: params.pitchName ?? "",
                    pitchAddress: params.pitchAddress ?? "",
                    date: day,
                    ...(params.pitchHourly
                      ? { pitchHourly: params.pitchHourly }
                      : {}),
                    ...(params.pitchPrice
                      ? { pitchPrice: params.pitchPrice }
                      : {}),
                    ...(params.pitchOpening
                      ? { pitchOpening: params.pitchOpening }
                      : {}),
                    ...(params.pitchClosing
                      ? { pitchClosing: params.pitchClosing }
                      : {}),
                  },
                })
              }
              style={{ borderRadius: 10, paddingVertical: 18 }}
              titleStyle={{ color: "#000", fontWeight: "700" }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
