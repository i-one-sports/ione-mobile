import PitchDayTimeline from "@/components/PitchDayTimeline";
import DayStrip, { type DayStatus } from "@/components/booking/DayStrip";
import { getPitchDetails, getSessionsByLocation } from "@/api/sessions";
import { useRequireSignIn } from "@/components/guest/SignInPrompt";
import { formatKoboAsNaira } from "@/utils/currency";
import {
  formatClock,
  toMinutes,
  formatDayShort,
  freeGaps,
  locationDayKey,
  todayKey,
  upcomingDays,
} from "@/utils/pitchSlots";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MonthlyPassCard from "@/components/booking/MonthlyPassCard";
import { getMyMonthlyPass } from "@/api/monthlyPassThunks";

// A pitch's details (photo, address, hours, price) and when it's booked over
// the next 14 days (Home → a pitch → See bookings). Open to guests; creating
// a session asks them to sign in.
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
  const requireSignIn = useRequireSignIn();

  useEffect(() => {
    if (params.pitchId) dispatch(getPitchDetails(params.pitchId));
  }, [dispatch, params.pitchId, refreshKey]);
  const pitch: any = useAppSelector((state) =>
    params.pitchId ? state.sessions.pitchDetails[params.pitchId] : undefined,
  );
  const name = pitch?.name ?? params.pitchName ?? "Pitch";
  const address = pitch?.address ?? params.pitchAddress;
  const opening = pitch?.openingHour ?? params.pitchOpening;
  const closing = pitch?.closingHour ?? params.pitchClosing;
  const hourly = pitch
    ? pitch.tier === "paid" && pitch.pricingOption === "hourly"
    : params.pitchHourly === "1";
  const pricePerHour = pitch?.pricePerHour ?? (Number(params.pitchPrice) || 0);
  const price = !pitch
    ? hourly && pricePerHour
      ? `${formatKoboAsNaira(pricePerHour)}/hr`
      : null
    : pitch.tier !== "paid"
      ? "Free"
      : hourly
        ? pricePerHour
          ? `${formatKoboAsNaira(pricePerHour)}/hr`
          : null
        : pitch.paymentPerPersonMonthly
          ? `${formatKoboAsNaira(pitch.paymentPerPersonMonthly)} per 30 days`
          : null;
  const monthly = pitch?.tier === "paid" && pitch?.pricingOption === "monthly";

  // Monthly pitch: the player's pass here (M03). Signed-in only; reloaded on
  // focus so it shows a pass bought on the Monthly Pass screen.
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { myPass, loadingMyPass } = useAppSelector((s) => s.monthlyPass);
  const passInfo =
    isAuthenticated && myPass?.locationId === params.pitchId ? myPass : null;
  useFocusEffect(
    useCallback(() => {
      if (monthly && isAuthenticated && params.pitchId)
        dispatch(getMyMonthlyPass({ locationId: params.pitchId }));
    }, [dispatch, monthly, isAuthenticated, params.pitchId]),
  );

  const openBuyPass = () => {
    if (!params.pitchId || !requireSignIn("buy a monthly pass")) return;
    router.push({
      pathname: "/payment-screens/monthly-pass",
      params: {
        locationId: params.pitchId,
        locationName: address ? `${name}, ${address}` : name,
      },
    });
  };

  const hours =
    opening && closing
      ? `Open ${formatClock(toMinutes(opening)!)} – ${formatClock(toMinutes(closing)!)}`
      : "Open all day";

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
        status[d] = freeGaps(s, d, opening, closing).some(
          (g) => g.end - g.start >= 60,
        )
          ? "free"
          : "full";
    }

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    if (monthly && isAuthenticated && params.pitchId)
      dispatch(getMyMonthlyPass({ locationId: params.pitchId }));
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
                Pitch
              </ThemedText>
              <View style={{ width: 22 }} />
            </View>
            {!!pitch?.pitchPhoto && (
              <Image
                source={{ uri: pitch.pitchPhoto }}
                accessibilityLabel={`Photo of ${name}`}
                style={{
                  width: "100%",
                  height: 170,
                  borderRadius: 14,
                  marginTop: 16,
                  backgroundColor: isDark ? "#1a1a1a" : "#F1F1F1",
                }}
                resizeMode="cover"
              />
            )}
            <View className="mt-[12px] gap-[4px]">
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[18px] font-[700]"
              >
                {name}
              </ThemedText>
              {!!address && (
                <Text style={{ color: mutedColor, fontSize: 13 }}>
                  {address}
                </Text>
              )}
              <Text style={{ color: mutedColor, fontSize: 13 }}>
                {[hours, price].filter(Boolean).join(" · ")}
              </Text>
            </View>
          </View>

          {monthly && (
            <MonthlyPassCard
              pitchPrice={pitch?.paymentPerPersonMonthly}
              passInfo={passInfo}
              loading={loadingMyPass}
              isDark={isDark}
              onBuy={openBuyPass}
            />
          )}

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
                openingHour={opening}
                closingHour={closing}
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
                requireSignIn("create a session") &&
                router.push({
                  pathname: "/screens/newsession",
                  params: {
                    pitchId: params.pitchId,
                    pitchName: name,
                    pitchAddress: address ?? "",
                    date: day,
                    ...(hourly ? { pitchHourly: "1" } : {}),
                    ...(pricePerHour
                      ? { pitchPrice: String(pricePerHour) }
                      : {}),
                    ...(opening ? { pitchOpening: opening } : {}),
                    ...(closing ? { pitchClosing: closing } : {}),
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
