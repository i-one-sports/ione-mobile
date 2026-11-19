import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { formatKoboAsNaira } from "@/utils/currency";
import {
  formatDayShort,
  formatDuration,
  formatRange,
} from "@/utils/pitchSlots";

interface Props {
  day: string;
  start: number;
  duration: number;
  /** Whole-pitch price per hour in kobo (hourly pitches). */
  pricePerHour?: number;
  onChange?: () => void;
}

// B03 · the chosen slot above the session details. The server has no way to
// hold a slot yet, so this is a summary, not a countdown: the time is only
// booked when the session is created (a clash then shows "Someone booked it
// first").
export default function SlotSummaryCard({
  day,
  start,
  duration,
  pricePerHour,
  onChange,
}: Props) {
  const total =
    pricePerHour && pricePerHour > 0
      ? Math.round(pricePerHour * (duration / 60))
      : 0;

  return (
    <View
      style={{
        backgroundColor: "#111",
        borderRadius: 14,
        padding: 20,
        gap: 6,
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
            color: "#1DE98B",
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1,
          }}
        >
          YOUR SLOT
        </Text>
        {onChange && (
          <TouchableOpacity onPress={onChange} hitSlop={10}>
            <Text style={{ color: "#1DE98B", fontSize: 14, fontWeight: "700" }}>
              Change
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
        {formatDayShort(day)} · {formatRange(start, start + duration)}
      </Text>
      <Text style={{ color: "#B5B8BE", fontSize: 13 }}>
        {formatDuration(duration)}
        {total > 0
          ? ` · ${formatKoboAsNaira(total)} split between players`
          : ""}
      </Text>
    </View>
  );
}
