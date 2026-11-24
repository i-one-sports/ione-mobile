import { SessionByIdResponse } from "@/components/typings/apiResponse";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Badge = { label: string; color: string };

/**
 * What the session needs from the player right now. Order matters: a
 * draft has no players or payment yet, and a pass session never has a bill.
 */
function badgeFor(session: SessionByIdResponse): Badge {
  if (!session.startTime)
    return { label: "Setup not finished", color: "#F59E0B" };
  if (session.inProgress) return { label: "Playing now", color: "#00C8A0" };
  if (session.requiresPass) return { label: "Monthly pass", color: "#0E9F5A" };
  if (session.paymentRequired && session.paymentStatus !== "COMPLETED")
    return { label: "Waiting for payment", color: "#F59E0B" };
  if (session.isFull) return { label: "Ready", color: "#00C8A0" };
  return { label: "Waiting for players", color: "#9BA1A6" };
}

function whenLabel(startTime?: string): string {
  if (!startTime) return "No date yet";
  const start = new Date(startTime);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const time = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (start.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (start.toDateString() === tomorrow.toDateString())
    return `Tomorrow, ${time}`;
  const day = start.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `${day}, ${time}`;
}

/**
 * The player's current or next session (GET /sessions/my-current), pinned
 * above the session list. Tapping it opens the session.
 */
export default function CurrentSessionCard({
  session,
  isDark,
  onPress,
}: {
  session: SessionByIdResponse;
  isDark: boolean;
  onPress: () => void;
}) {
  const badge = badgeFor(session);
  const players = session.members?.length ?? 0;
  const draft = !session.startTime;

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Your current session at ${session.location?.name ?? "a pitch"}`}
      style={{
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: isDark ? "#1F3B2C" : "#BFE9CF",
        backgroundColor: isDark ? "#0B1A12" : "#ECF8EF",
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.5,
            color: isDark ? "#00FF94" : "#0E9F5A",
          }}
        >
          YOUR CURRENT SESSION
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
            backgroundColor: `${badge.color}22`,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: badge.color,
            }}
          />
          <Text style={{ fontSize: 11, fontWeight: "600", color: badge.color }}>
            {badge.label}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: isDark ? "#FFF" : "#111",
            }}
          >
            {session.location?.name ?? "Your session"}
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? "#9BA1A6" : "#6C757D" }}>
            {draft
              ? "Finish setting it up, or delete it"
              : `${whenLabel(session.startTime)} · ${players}/${session.maxNumber ?? 0} players`}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? "#9BA1A6" : "#6C757D"}
        />
      </View>
    </TouchableOpacity>
  );
}
