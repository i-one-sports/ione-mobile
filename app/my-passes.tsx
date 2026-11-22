import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getUserMonthlyPasses } from "@/api/monthlyPassThunks";
import { MonthlyPass } from "@/components/typings/apiResponse";

const PASS_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const formatShort = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** "Tiger Sports, Sangotedo": the name plus the first part of the address. */
const pitchLabel = (pass: MonthlyPass) => {
  const name = pass.pitch?.name ?? "Pitch";
  const area = pass.pitch?.address?.split(",")[0]?.trim();
  return area && area !== name ? `${name}, ${area}` : name;
};

const PAST_STATES: MonthlyPass["state"][] = [
  "EXPIRED",
  "REFUND_PENDING",
  "REFUNDED",
  "REFUND_FAILED",
];

const PAST_LABEL: Partial<Record<MonthlyPass["state"], string>> = {
  EXPIRED: "EXPIRED",
  REFUND_PENDING: "REFUNDING",
  REFUNDED: "REFUNDED",
  REFUND_FAILED: "REFUND FAILED",
};

/** M05 · My passes: active passes, queued renewals and past passes. */
export default function MyPassesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();
  const { userPasses, loadingUserPasses, errorUserPasses } = useAppSelector(
    (s) => s.monthlyPass,
  );
  const [refreshing, setRefreshing] = useState(false);

  // Reload on focus: picks up a pass just bought or renewed.
  useFocusEffect(
    useCallback(() => {
      dispatch(getUserMonthlyPasses());
    }, [dispatch]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getUserMonthlyPasses());
    setRefreshing(false);
  };

  const active = userPasses.filter((p) => p.state === "ACTIVE");
  const queued = userPasses
    .filter((p) => p.state === "QUEUED")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const pending = userPasses.filter((p) => p.state === "PENDING");
  const past = userPasses.filter((p) => PAST_STATES.includes(p.state));

  const mutedColor = isDark ? "#9CA3AF" : "#7C8483";
  const rowBg = isDark ? "#0D1F17" : "#EDFFF8";
  const rowBorder = isDark ? "#1a3d2b" : "#9DF0CB";
  const accent = "#00FF94";

  const openPitch = (pass: MonthlyPass) =>
    router.push({
      pathname: "/pitch-bookings",
      params: {
        pitchId: pass.locationId,
        pitchName: pass.pitch?.name ?? "",
        pitchAddress: pass.pitch?.address ?? "",
      },
    });

  const openBuy = (pass: MonthlyPass) =>
    router.push({
      pathname: "/payment-screens/monthly-pass",
      params: { locationId: pass.locationId, locationName: pitchLabel(pass) },
    });

  const sectionTitle = (text: string) => (
    <ThemedText
      style={{
        fontSize: 16,
        fontWeight: "700",
        marginTop: 28,
        marginBottom: 12,
      }}
    >
      {text}
    </ThemedText>
  );

  const listRow = (
    pass: MonthlyPass,
    title: string,
    subtitle: string,
    tag: string,
    tagStyle: { bg?: string; color: string },
    bold = false,
    onPress?: () => void,
  ) => (
    <TouchableOpacity
      key={pass._id}
      disabled={!onPress}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: rowBg,
        borderBottomWidth: 2,
        borderBottomColor: rowBorder,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <ThemedText style={{ fontSize: 16, fontWeight: bold ? "700" : "500" }}>
          {title}
        </ThemedText>
        <ThemedText style={{ fontSize: 13, color: mutedColor, marginTop: 2 }}>
          {subtitle}
        </ThemedText>
      </View>
      <View
        style={{
          backgroundColor: tagStyle.bg ?? "transparent",
          borderRadius: 6,
          paddingHorizontal: tagStyle.bg ? 10 : 0,
          paddingVertical: 4,
        }}
      >
        <ThemedText
          style={{
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.5,
            color: tagStyle.color,
          }}
        >
          {tag}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const isEmpty =
    !active.length && !queued.length && !pending.length && !past.length;

  return (
    <SafeAreaScreen
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={{ position: "absolute", left: 20 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#111"}
          />
        </TouchableOpacity>
        <ThemedText style={{ fontSize: 20, fontWeight: "700" }}>
          My Passes
        </ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accent}
            colors={[accent]}
          />
        }
      >
        {loadingUserPasses && !userPasses.length && !refreshing ? (
          <ActivityIndicator
            color={accent}
            size="large"
            style={{ marginTop: 60 }}
          />
        ) : errorUserPasses && !userPasses.length ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <ThemedText style={{ color: mutedColor, textAlign: "center" }}>
              {errorUserPasses}
            </ThemedText>
            <TouchableOpacity
              onPress={() => dispatch(getUserMonthlyPasses())}
              style={{ marginTop: 12 }}
            >
              <ThemedText style={{ color: "#16A34A", fontWeight: "700" }}>
                Try again
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : isEmpty ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="ticket-outline" size={40} color={mutedColor} />
            <ThemedText
              style={{ fontSize: 16, fontWeight: "700", marginTop: 12 }}
            >
              No passes yet
            </ThemedText>
            <ThemedText
              style={{
                color: mutedColor,
                textAlign: "center",
                marginTop: 6,
                lineHeight: 20,
              }}
            >
              Monthly pitches need a 30-day pass to play. Buy one from the pitch
              page.
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Active passes */}
            {active.map((pass, i) => {
              const daysLeft =
                pass.daysLeft ??
                Math.max(
                  0,
                  Math.ceil(
                    (new Date(pass.endsAt).getTime() - Date.now()) / DAY_MS,
                  ),
                );
              const used = Math.min(
                PASS_DAYS,
                Math.max(0, PASS_DAYS - daysLeft),
              );
              const hasRenewal = queued.some(
                (q) => q.locationId === pass.locationId,
              );
              return (
                <View key={pass._id} style={{ marginTop: i ? 24 : 0 }}>
                  <View
                    style={{
                      backgroundColor: "#141414",
                      borderRadius: 20,
                      padding: 20,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <ThemedText
                        style={{
                          color: accent,
                          fontSize: 13,
                          fontWeight: "700",
                          letterSpacing: 2,
                        }}
                      >
                        MONTHLY PASS
                      </ThemedText>
                      <View
                        style={{
                          backgroundColor: accent,
                          borderRadius: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        }}
                      >
                        <ThemedText
                          style={{
                            color: "#000",
                            fontSize: 12,
                            fontWeight: "700",
                          }}
                        >
                          ACTIVE
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText
                      style={{
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: "700",
                        marginTop: 12,
                      }}
                    >
                      {pitchLabel(pass)}
                    </ThemedText>
                    <ThemedText
                      style={{ color: "#9CA3AF", fontSize: 14, marginTop: 4 }}
                    >
                      Active until {formatDay(pass.endsAt)}
                    </ThemedText>
                    <View
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#2E3432",
                        marginTop: 16,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          width: `${(used / PASS_DAYS) * 100}%`,
                          height: "100%",
                          backgroundColor: accent,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                    <ThemedText
                      style={{ color: "#9CA3AF", fontSize: 13, marginTop: 8 }}
                    >
                      {used} of {PASS_DAYS} days used · {daysLeft} left
                    </ThemedText>
                  </View>

                  <View
                    style={{ flexDirection: "row", gap: 12, marginTop: 14 }}
                  >
                    <TouchableOpacity
                      onPress={() => openPitch(pass)}
                      style={{
                        flex: 1,
                        height: 52,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: "#16A34A",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#16A34A",
                        }}
                      >
                        View games
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => openBuy(pass)}
                      style={{
                        flex: 1,
                        height: 52,
                        borderRadius: 10,
                        backgroundColor: accent,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#000",
                        }}
                      >
                        {hasRenewal ? "Add +30 days" : "Renew +30 days"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Checkouts opened but not paid (lapse after 30 minutes) */}
            {pending.length > 0 && (
              <>
                {sectionTitle("Payment not finished")}
                {pending.map((pass) =>
                  listRow(
                    pass,
                    pass.pitch?.name ?? "Pitch",
                    "Tap to finish paying. Unpaid checkouts close after 30 minutes.",
                    "PENDING",
                    { bg: "#FFF1D6", color: "#B45309" },
                    true,
                    () => openBuy(pass),
                  ),
                )}
              </>
            )}

            {queued.length > 0 && (
              <>
                {sectionTitle("Queued")}
                {queued.map((pass) =>
                  listRow(
                    pass,
                    `${pass.pitch?.name ?? "Pitch"} · renewal`,
                    `Starts ${formatDay(pass.startsAt)} · runs to ${formatDay(pass.endsAt)}`,
                    "QUEUED",
                    { bg: isDark ? "#123826" : "#D9F7E8", color: "#0E9F5A" },
                    true,
                  ),
                )}
              </>
            )}

            {past.length > 0 && (
              <>
                {sectionTitle("Past")}
                {past.map((pass) =>
                  listRow(
                    pass,
                    pass.pitch?.name ?? "Pitch",
                    `${formatShort(pass.startsAt)} – ${formatShort(pass.endsAt)}`,
                    PAST_LABEL[pass.state] ?? pass.state,
                    {
                      color:
                        pass.state === "REFUND_FAILED" ? "#DC2626" : mutedColor,
                    },
                    false,
                    () => openPitch(pass),
                  ),
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaScreen>
  );
}
