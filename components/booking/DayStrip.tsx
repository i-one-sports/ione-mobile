import React, { useEffect, useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useBookingColors } from "./bookingColors";
import { dayOfMonth, monthLong, weekdayShort } from "@/utils/pitchSlots";

export type DayStatus = "free" | "full" | undefined;

interface Props {
  days: string[];
  selected: string;
  onSelect: (day: string) => void;
  /** Dot under each day: green has free times, red full, none loading. */
  status?: Record<string, DayStatus>;
}

const CHIP_WIDTH = 56;
const GAP = 8;

// B01 · the next 14 days as a sideways strip.
export default function DayStrip({ days, selected, onSelect, status }: Props) {
  const c = useBookingColors();
  const scrollRef = useRef<ScrollView>(null);

  // Keep the chosen day in view (e.g. picked from "Try instead").
  useEffect(() => {
    const index = days.indexOf(selected);
    if (index > 2)
      scrollRef.current?.scrollTo({
        x: (index - 2) * (CHIP_WIDTH + GAP),
        animated: true,
      });
  }, [days, selected]);

  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>
          Day
        </Text>
        <Text style={{ color: c.muted, fontSize: 13 }}>
          {monthLong(selected)}
        </Text>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: GAP }}
      >
        {days.map((day) => {
          const active = day === selected;
          const dot = status?.[day];
          return (
            <TouchableOpacity
              key={day}
              onPress={() => onSelect(day)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${weekdayShort(day)} ${dayOfMonth(day)}${
                dot === "full"
                  ? ", full"
                  : dot === "free"
                    ? ", has free times"
                    : ""
              }`}
              style={{
                width: CHIP_WIDTH,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: "center",
                gap: 4,
                backgroundColor: active ? c.selectedBg : c.chipBg,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: active ? c.selectedText : c.muted,
                }}
              >
                {weekdayShort(day)}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: active ? c.selectedText : c.text,
                }}
              >
                {dayOfMonth(day)}
              </Text>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    dot === "full"
                      ? c.full
                      : dot === "free"
                        ? c.cta
                        : "transparent",
                }}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
