import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useBookingColors } from "./bookingColors";
import {
  formatClock,
  formatDayShort,
  durationAdjective,
  type StartOption,
} from "@/utils/pitchSlots";

interface Props {
  day: string;
  duration: number;
  options: StartOption[];
  selected?: number | null;
  onPick: (minute: number) => void;
}

// B01 · "Free start times": only times where the whole game fits are
// tappable; the rest are struck through.
export default function StartTimeGrid({
  day,
  duration,
  options,
  selected,
  onPick,
}: Props) {
  const c = useBookingColors();

  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>
          Free start times
        </Text>
        <Text style={{ color: c.muted, fontSize: 12 }}>
          {formatDayShort(day)} · {durationAdjective(duration)} games
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map(({ minute, free }) => {
          const active = selected === minute;
          return (
            <TouchableOpacity
              key={minute}
              disabled={!free}
              onPress={() => onPick(minute)}
              accessibilityRole="button"
              accessibilityState={{ disabled: !free, selected: active }}
              accessibilityLabel={`${formatClock(minute)}${free ? "" : ", not available"}`}
              style={{
                width: "22.8%",
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
                borderWidth: free ? 1.5 : 0,
                borderColor: active ? c.cta : c.freeBorder,
                backgroundColor: active
                  ? c.cta
                  : free
                    ? c.surface
                    : c.unavailableBg,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: active ? "700" : "500",
                  color: active ? "#000" : free ? c.text : c.unavailableText,
                  textDecorationLine: free ? "none" : "line-through",
                }}
              >
                {formatClock(minute)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
        }}
      >
        <Legend dot={c.cta} label="Has free times" muted={c.muted} />
        <Text style={{ color: c.muted, fontSize: 11 }}>
          <Text style={{ textDecorationLine: "line-through" }}>4 PM</Text>
          {" Booked or doesn't fit"}
        </Text>
        <Legend dot={c.full} label="Day full" muted={c.muted} />
      </View>
    </View>
  );
}

function Legend({
  dot,
  label,
  muted,
}: {
  dot: string;
  label: string;
  muted: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <View
        style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }}
      />
      <Text style={{ color: muted, fontSize: 11 }}>{label}</Text>
    </View>
  );
}
