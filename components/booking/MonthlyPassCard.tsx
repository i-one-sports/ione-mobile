import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MyMonthlyPassResponse } from "@/components/typings/apiResponse";
import { formatKoboAsNaira } from "@/utils/currency";

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

interface Props {
  /** The pitch's 30-day pass price (kobo), from the pitch details. */
  pitchPrice?: number;
  /** The player's pass info here; null for guests or while loading. */
  passInfo: MyMonthlyPassResponse | null;
  loading: boolean;
  isDark: boolean;
  onBuy: () => void;
}

/**
 * M03 · On a monthly pitch's page: what a pass costs and whether the player
 * has one. Buying (or renewing) opens the Monthly Pass screen.
 */
export default function MonthlyPassCard({
  pitchPrice,
  passInfo,
  loading,
  isDark,
  onBuy,
}: Props) {
  const mutedColor = isDark ? "#9CA3AF" : "#7C8483";
  const current = passInfo?.current ?? null;
  const lastQueued = passInfo?.queued.length
    ? [...passInfo.queued].sort((a, b) => b.endsAt.localeCompare(a.endsAt))[0]
    : null;
  const salesPaused = passInfo?.salesPaused ?? false;
  // Signed-in: the live price (null when paused). Guests: the pitch's price.
  const basePrice = passInfo
    ? (passInfo.price?.baseAmount ?? null)
    : (pitchPrice ?? null);

  const badge = current
    ? { text: "PASS ACTIVE", bg: "#00FF94", color: "#000" }
    : salesPaused
      ? { text: "SALES PAUSED", bg: "#FFF1D6", color: "#B45309" }
      : { text: "PASS NEEDED", bg: "#D9F7E8", color: "#0E9F5A" };

  const description = current
    ? `Your pass covers every game here until ${formatDay(
        (lastQueued ?? current).endsAt,
      )}${current.daysLeft != null ? ` · ${current.daysLeft} days left` : ""}.`
    : salesPaused
      ? "The owner has paused pass sales for now. Players with a pass can still join games."
      : "Buy a 30-day pass once and join any game here. No paying per game.";

  const canBuy = !salesPaused && basePrice != null;
  const buyTitle = current ? "Renew +30 days" : "Buy pass";

  return (
    <View
      style={{
        borderWidth: 1.5,
        borderColor: "#00E88F",
        borderRadius: 16,
        padding: 18,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            flexShrink: 1,
          }}
        >
          <ThemedText style={{ fontSize: 17, fontWeight: "700" }}>
            Monthly pitch
          </ThemedText>
          <View
            style={{
              backgroundColor: badge.bg,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <ThemedText
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.5,
                color: badge.color,
              }}
            >
              {badge.text}
            </ThemedText>
          </View>
        </View>
        {basePrice != null && (
          <ThemedText style={{ fontSize: 18, fontWeight: "700" }}>
            {formatKoboAsNaira(basePrice)}
          </ThemedText>
        )}
      </View>

      {loading && !passInfo ? (
        <ActivityIndicator
          color="#00FF94"
          style={{ marginTop: 12, alignSelf: "flex-start" }}
        />
      ) : (
        <ThemedText
          style={{
            fontSize: 13,
            lineHeight: 19,
            color: mutedColor,
            marginTop: 8,
          }}
        >
          {description}
        </ThemedText>
      )}

      {canBuy && (
        <TouchableOpacity
          onPress={onBuy}
          style={{
            marginTop: 14,
            height: 48,
            borderRadius: 10,
            backgroundColor: current ? "transparent" : "#00FF94",
            borderWidth: current ? 1.5 : 0,
            borderColor: "#16A34A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ThemedText
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: current ? "#16A34A" : "#000",
            }}
          >
            {buyTitle}
            {!current && basePrice != null
              ? ` · ${formatKoboAsNaira(basePrice)}`
              : ""}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}
