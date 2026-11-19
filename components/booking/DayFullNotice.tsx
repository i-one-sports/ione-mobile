import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBookingColors } from "./bookingColors";
import {
  durationAdjective,
  formatDayShort,
  formatDuration,
  formatRange,
  type Gap,
} from "@/utils/pitchSlots";

export interface Suggestion {
  key: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface Props {
  day: string;
  duration: number;
  /** The longest free gap that day, if any. */
  longest: Gap | null;
  suggestions: Suggestion[];
}

// B05 · the chosen length doesn't fit anywhere that day: say why and offer a
// shorter game or another day.
export default function DayFullNotice({
  day,
  duration,
  longest,
  suggestions,
}: Props) {
  const c = useBookingColors();

  return (
    <View style={{ gap: 18 }}>
      <View
        accessibilityRole="alert"
        style={{
          borderWidth: 1.5,
          borderColor: c.warnBorder,
          backgroundColor: c.warnBg,
          borderRadius: 12,
          padding: 18,
          gap: 6,
        }}
      >
        <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>
          No {durationAdjective(duration)} slots left on {formatDayShort(day)}
        </Text>
        <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>
          {longest
            ? `The longest free gap that day is ${formatDuration(
                longest.end - longest.start,
              )} (${formatRange(longest.start, longest.end)}).`
            : "There's no free time left that day."}
        </Text>
      </View>

      {suggestions.length > 0 && (
        <View style={{ gap: 12 }}>
          <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>
            Try instead
          </Text>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s.key}
              onPress={s.onPress}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: c.freeBg,
                borderBottomWidth: 1.5,
                borderBottomColor: c.freeBorder,
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderRadius: 4,
              }}
            >
              <View style={{ gap: 4, flex: 1 }}>
                <Text
                  style={{ color: c.text, fontSize: 15, fontWeight: "700" }}
                >
                  {s.title}
                </Text>
                <Text style={{ color: c.muted, fontSize: 13 }}>
                  {s.subtitle}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={c.text} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
