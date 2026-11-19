import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useBookingColors } from "./bookingColors";
import PitchDayTimeline from "@/components/PitchDayTimeline";
import type { SessionByDateResponse } from "@/components/typings/apiResponse";
import { formatKoboAsNaira } from "@/utils/currency";
import {
  bookedRanges,
  durationAdjective,
  formatClock,
  formatDayShort,
  formatRange,
  freeGaps,
  nowOn,
  pitchWindow,
  toHHMM,
} from "@/utils/pitchSlots";

interface Props {
  visible: boolean;
  locationId: string;
  pitchName: string;
  day: string;
  duration: number;
  sessions: SessionByDateResponse[];
  openingHour?: string;
  closingHour?: string;
  /** Whole-pitch price per hour in kobo (hourly pitches). */
  pricePerHour?: number;
  /** Start times snap to this many minutes. */
  step: number;
  initialStart?: number | null;
  onBook: (start: number) => void;
  onClose: () => void;
}

const HOUR_H = 56;
const LABEL_W = 50;

// B02 · "See the day": the day drawn to scale — booked blocks greyed out,
// free space dashed, and the captain's game placed where they tap.
export default function SeeTheDayModal({
  visible,
  locationId,
  pitchName,
  day,
  duration,
  sessions,
  openingHour,
  closingHour,
  pricePerHour,
  step,
  initialStart,
  onBook,
  onClose,
}: Props) {
  const c = useBookingColors();
  const [listView, setListView] = useState(false);
  const [start, setStart] = useState<number | null>(initialStart ?? null);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (visible) {
      setStart(initialStart ?? null);
      setHint("");
    }
  }, [visible, initialStart]);

  const { close } = pitchWindow(openingHour, closingHour);
  const gaps = freeGaps(sessions, day, openingHour, closingHour);
  const now = nowOn(day);
  const { open } = pitchWindow(openingHour, closingHour);
  const from = Math.max(open, now == null ? 0 : Math.floor(now / 15) * 15);
  const rangeStart = Math.floor(from / 60) * 60;
  const rangeEnd = Math.ceil(close / 60) * 60;
  const height = ((rangeEnd - rangeStart) / 60) * HOUR_H;
  const y = (m: number) => ((m - rangeStart) / 60) * HOUR_H;

  const booked = bookedRanges(sessions, day)
    .map((b) => ({
      ...b,
      top: Math.max(b.start, rangeStart),
      bottom: Math.min(b.end, close),
    }))
    .filter((b) => b.bottom > b.top);

  const total =
    pricePerHour && pricePerHour > 0
      ? Math.round(pricePerHour * (duration / 60))
      : 0;

  const onTap = (locationY: number) => {
    const tapped = rangeStart + (locationY / HOUR_H) * 60;
    const gap = gaps.find((g) => g.start <= tapped && tapped < g.end);
    if (!gap) {
      setHint("That time is booked. Tap a free space.");
      return;
    }
    const earliest = Math.ceil(gap.start / 15) * 15;
    const snapped = Math.floor(tapped / step) * step;
    const s = Math.max(earliest, Math.min(snapped, gap.end - duration));
    if (s + duration > gap.end) {
      setHint(
        `That gap is too short for a ${durationAdjective(duration)} game.`,
      );
      return;
    }
    setHint("");
    setStart(s);
  };

  const hours: number[] = [];
  for (let m = rangeStart; m <= rangeEnd; m += 60) hours.push(m);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: c.surface }}>
        {/* Header */}
        <View
          style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="arrow-back" size={24} color={c.text} />
            </TouchableOpacity>
            <Text style={{ color: c.text, fontSize: 22, fontWeight: "700" }}>
              {formatDayShort(day)}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <Text
            style={{
              color: c.muted,
              fontSize: 13,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            {pitchName} · {durationAdjective(duration)} game
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        >
          {listView ? (
            <PitchDayTimeline
              locationId={locationId}
              date={day}
              openingHour={openingHour}
              closingHour={closingHour}
              skipFetch
            />
          ) : from >= close ? (
            <Text style={{ color: c.muted, fontSize: 14 }}>
              This pitch is closed for the rest of the day.
            </Text>
          ) : (
            <>
              <View style={{ flexDirection: "row", height: height + 10 }}>
                {/* Hour labels */}
                <View style={{ width: LABEL_W }}>
                  {hours.map((m) => (
                    <Text
                      key={m}
                      style={{
                        position: "absolute",
                        top: y(m) - 8,
                        color: c.muted,
                        fontSize: 12,
                      }}
                    >
                      {toHHMM(m === 24 * 60 ? 0 : m)}
                    </Text>
                  ))}
                </View>

                {/* Day column: children ignore touches so locationY is
                    measured from the column itself. */}
                <Pressable
                  style={{ flex: 1, height }}
                  onPress={(e) => onTap(e.nativeEvent.locationY)}
                  accessibilityHint="Tap a free space to start your game there"
                >
                  {hours.map((m) => (
                    <View
                      key={`line-${m}`}
                      pointerEvents="none"
                      style={{
                        position: "absolute",
                        top: y(m),
                        left: 0,
                        right: 0,
                        height: 1,
                        backgroundColor: c.border,
                      }}
                    />
                  ))}

                  {gaps.map((g) => (
                    <View
                      key={`free-${g.start}`}
                      pointerEvents="none"
                      style={{
                        position: "absolute",
                        top: y(g.start) + 1,
                        height: y(g.end) - y(g.start) - 2,
                        left: 0,
                        right: 0,
                        borderWidth: 1.5,
                        borderStyle: "dashed",
                        borderColor: c.freeBorder,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingTop: 4,
                        overflow: "hidden",
                      }}
                    >
                      {y(g.end) - y(g.start) >= 20 && (
                        <Text style={{ color: c.accent, fontSize: 12 }}>
                          Free
                        </Text>
                      )}
                    </View>
                  ))}

                  {booked.map((b) => (
                    <View
                      key={`booked-${b.start}`}
                      pointerEvents="none"
                      style={{
                        position: "absolute",
                        top: y(b.top) + 1,
                        height: y(b.bottom) - y(b.top) - 2,
                        left: 0,
                        right: 0,
                        backgroundColor: c.unavailableBg,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingTop: 4,
                        overflow: "hidden",
                      }}
                    >
                      <Text
                        style={{
                          color: c.muted,
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        Booked · {formatRange(b.start, b.end)}
                      </Text>
                    </View>
                  ))}

                  {start != null && (
                    <View
                      pointerEvents="none"
                      style={{
                        position: "absolute",
                        top: y(start) + 1,
                        height: y(start + duration) - y(start) - 2,
                        left: 0,
                        right: 0,
                        backgroundColor: c.freeBg,
                        borderWidth: 1.5,
                        borderColor: c.cta,
                        borderRadius: 8,
                        paddingHorizontal: 14,
                        paddingTop: 8,
                        gap: 4,
                        overflow: "hidden",
                      }}
                    >
                      <Text
                        style={{
                          color: c.text,
                          fontSize: 14,
                          fontWeight: "700",
                        }}
                      >
                        Your game · {formatRange(start, start + duration)}
                      </Text>
                      <Text style={{ color: c.accent, fontSize: 12 }}>
                        Free
                        {total > 0
                          ? ` · ${formatKoboAsNaira(total)} split between players`
                          : ""}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
              <Text
                style={{
                  color: hint ? c.full : c.muted,
                  fontSize: 12,
                  marginLeft: LABEL_W,
                  marginTop: 4,
                }}
              >
                {hint ||
                  `Closes ${formatClock(close)} · tap any free space to start there`}
              </Text>
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => setListView((v) => !v)}
            accessibilityRole="button"
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: 10,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: c.accent,
            }}
          >
            <Text style={{ color: c.accent, fontSize: 16, fontWeight: "600" }}>
              {listView ? "Day view" : "List view"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={start == null}
            onPress={() => start != null && onBook(start)}
            accessibilityRole="button"
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: 10,
              alignItems: "center",
              backgroundColor: start == null ? c.unavailableBg : c.cta,
            }}
          >
            <Text
              style={{
                color: start == null ? c.unavailableText : "#000",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {start == null
                ? "Tap a free time"
                : `Book ${formatRange(start, start + duration)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
