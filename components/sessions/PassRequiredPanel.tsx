import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import {
  MonthlyPass,
  MyMonthlyPassResponse,
} from "@/components/typings/apiResponse";
import { formatKoboAsNaira } from "@/utils/currency";

const DAY_MS = 24 * 60 * 60 * 1000;
const PASS_DAYS = 30;

const formatShortDay = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

interface Props {
  locationName?: string;
  /** Session start; a pass bought now must cover it. */
  startTime?: string;
  /** The player's pass info for this pitch (null while loading). */
  passInfo: MyMonthlyPassResponse | null;
  loading: boolean;
  isDark: boolean;
  onBuy: () => void;
  onNotNow: () => void;
}

/**
 * M06 · Shown on Join Session after the server answers 402 PASS_REQUIRED:
 * the pitch is monthly and the player has no pass covering this game.
 */
export default function PassRequiredPanel({
  locationName,
  startTime,
  passInfo,
  loading,
  isDark,
  onBuy,
  onNotNow,
}: Props) {
  const mutedColor = isDark ? "#9CA3AF" : "#7C8483";
  const price = passInfo?.price ?? null;

  // A pass bought now starts when the player's last pass here ends, else now.
  const lastPass: MonthlyPass | null =
    [passInfo?.current, ...(passInfo?.queued ?? [])]
      .filter((p): p is MonthlyPass => Boolean(p))
      .sort((a, b) => b.endsAt.localeCompare(a.endsAt))[0] ?? null;
  const startsAt = lastPass ? new Date(lastPass.endsAt) : new Date();
  const endsAt = new Date(startsAt.getTime() + PASS_DAYS * DAY_MS);
  // The server refuses with PASS_WOULD_NOT_COVER in this case.
  const wouldNotCover =
    startTime != null && endsAt.getTime() <= new Date(startTime).getTime();

  const pitch = locationName || "This pitch";
  const canBuy = Boolean(price) && !wouldNotCover;

  return (
    <View style={{ width: "100%", paddingHorizontal: 20, marginTop: 24 }}>
      {/* Banner */}
      <View
        style={{
          backgroundColor: isDark ? "#2A2010" : "#FFF8EB",
          borderColor: "#F2C46D",
          borderWidth: 1.5,
          borderRadius: 14,
          padding: 16,
        }}
      >
        <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
          You need a monthly pass to play here
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 13,
            lineHeight: 19,
            color: mutedColor,
            marginTop: 4,
          }}
        >
          {passInfo && !price
            ? `${pitch} is a monthly pitch, but passes aren't on sale right now. Check back later.`
            : wouldNotCover
              ? `${pitch} is a monthly pitch. A pass bought now would end before this game starts.`
              : `${pitch} is a monthly pitch. One 30-day pass lets you join any game here.`}
        </ThemedText>
      </View>

      {/* Pass summary */}
      {loading && !passInfo ? (
        <ActivityIndicator color="#00FF94" style={{ marginTop: 20 }} />
      ) : (
        price && (
          <View
            style={{
              backgroundColor: isDark ? "#0F2A1E" : "#EBF8F1",
              borderRadius: 14,
              paddingHorizontal: 20,
              paddingVertical: 6,
              marginTop: 16,
            }}
          >
            {[
              {
                label: `Monthly pass · ${PASS_DAYS} days`,
                value: formatKoboAsNaira(price.baseAmount),
              },
              {
                label: "Covers",
                value: `${formatShortDay(startsAt)} – ${formatShortDay(endsAt)}`,
              },
            ].map((row) => (
              <View
                key={row.label}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                }}
              >
                <ThemedText style={{ fontSize: 15, color: mutedColor }}>
                  {row.label}
                </ThemedText>
                <ThemedText style={{ fontSize: 15, fontWeight: "700" }}>
                  {row.value}
                </ThemedText>
              </View>
            ))}
          </View>
        )
      )}

      {/* Actions */}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
        <TouchableOpacity
          onPress={onNotNow}
          style={{
            flex: 1,
            height: 56,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: "#16A34A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ThemedText
            style={{ fontSize: 16, fontWeight: "600", color: "#16A34A" }}
          >
            Not now
          </ThemedText>
        </TouchableOpacity>
        {canBuy && (
          <TouchableOpacity
            onPress={onBuy}
            style={{
              flex: 1,
              height: 56,
              borderRadius: 10,
              backgroundColor: "#00FF94",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ThemedText
              style={{ fontSize: 16, fontWeight: "700", color: "#000" }}
            >
              Buy pass & join
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
