import React from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import InitialsAvatar from "@/components/match/InitialsAvatar";
import { PoolSnapshot } from "@/components/typings/payment";
import { formatKoboAsNaira } from "@/utils/currency";

interface Props {
  pool: PoolSnapshot;
  /** Open the payment screen (full contributors list, chip in). */
  onPress: () => void;
}

const MAX_AVATARS = 4;

// A pooled session's pot at a glance: paid of target, what's left, and who
// chipped in. Deliberately no "who hasn't paid" — in a pool nobody owes a
// fixed share.
export default function PoolSummaryCard({ pool, onPress }: Props) {
  const isDark = useColorScheme() === "dark";
  const accent = isDark ? "#00FF94" : "#00A85A";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const full = pool.fullyFunded;

  const paidPct = pool.target > 0 ? Math.min(pool.paid / pool.target, 1) : 0;
  const heldPct =
    pool.target > 0
      ? Math.min((pool.paid + pool.reserved) / pool.target, 1)
      : 0;
  const shown = pool.contributors.slice(0, MAX_AVATARS);
  const extra = pool.contributors.length - shown.length;
  const count = pool.contributors.length;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="w-full gap-[12px] rounded-[14px] border p-[16px]"
      style={{
        backgroundColor: full
          ? isDark
            ? "#0D2B1F"
            : "#E8FFF4"
          : isDark
            ? "#111"
            : "#F9FAFB",
        borderColor: full ? accent : isDark ? "#222" : "#E5E7EB",
      }}
    >
      <View className="flex-row items-center justify-between">
        <ThemedText className="text-[14px] font-[700]">Session pot</ThemedText>
        {full ? (
          <View className="flex-row items-center gap-[4px]">
            <Ionicons name="checkmark-circle" size={16} color={accent} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: accent }}>
              Pot full
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 13, fontWeight: "700", color: accent }}>
            {formatKoboAsNaira(pool.remaining)} left
          </Text>
        )}
      </View>

      <ThemedText className="text-[20px] font-[800]">
        {formatKoboAsNaira(pool.paid)}
        <Text style={{ fontSize: 14, fontWeight: "500", color: mutedColor }}>
          {"  "}of {formatKoboAsNaira(pool.target)}
        </Text>
      </ThemedText>

      <View
        className="h-[8px] overflow-hidden rounded-full"
        style={{ backgroundColor: isDark ? "#222" : "#E5E7EB" }}
      >
        {/* Checkouts in progress sit behind the paid part */}
        <View
          className="absolute bottom-0 left-0 top-0 rounded-full"
          style={{ width: `${heldPct * 100}%`, backgroundColor: "#FFB80080" }}
        />
        <View
          className="absolute bottom-0 left-0 top-0 rounded-full"
          style={{ width: `${paidPct * 100}%`, backgroundColor: accent }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-[10px]">
          {count > 0 && (
            <View className="flex-row">
              {shown.map((c, i) => (
                <View
                  key={c.userId}
                  style={{
                    marginLeft: i === 0 ? 0 : -10,
                    borderWidth: 2,
                    borderColor: isDark ? "#111" : "#F9FAFB",
                    borderRadius: 16,
                  }}
                >
                  <InitialsAvatar name={c.name} size={28} />
                </View>
              ))}
              {extra > 0 && (
                <View
                  className="h-[32px] w-[32px] items-center justify-center rounded-full"
                  style={{
                    marginLeft: -10,
                    backgroundColor: isDark ? "#222" : "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: mutedColor,
                    }}
                  >
                    +{extra}
                  </Text>
                </View>
              )}
            </View>
          )}
          <Text style={{ fontSize: 13, color: mutedColor }}>
            {full
              ? "The pitch is covered"
              : count === 0
                ? "No one has chipped in yet"
                : `${count} player${count === 1 ? "" : "s"} chipped in`}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text style={{ fontSize: 13, fontWeight: "600", color: accent }}>
            View
          </Text>
          <Ionicons name="chevron-forward" size={16} color={accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
