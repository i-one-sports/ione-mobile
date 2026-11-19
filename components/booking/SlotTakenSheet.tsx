import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useBookingColors } from "./bookingColors";
import {
  durationAdjective,
  formatClock,
  formatDayShort,
  formatRange,
} from "@/utils/pitchSlots";

interface Props {
  visible: boolean;
  day: string;
  /** The start time that was just taken. */
  takenStart: number;
  duration: number;
  /** Free start times left that day (minutes), nearest first. */
  alternatives: number[];
  onBook: (start: number) => void;
  onOtherDays: () => void;
  onClose: () => void;
}

// B04 · the server answered 409: offer the next free times instead of an
// error.
export default function SlotTakenSheet({
  visible,
  day,
  takenStart,
  duration,
  alternatives,
  onBook,
  onOtherDays,
  onClose,
}: Props) {
  const c = useBookingColors();
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    if (visible) setPicked(alternatives[0] ?? null);
  }, [visible, alternatives]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 36,
            gap: 16,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 40,
              height: 5,
              borderRadius: 3,
              backgroundColor: c.border,
            }}
          />
          <View style={{ gap: 8, alignItems: "center" }}>
            <Text
              style={{
                color: c.text,
                fontSize: 20,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {formatClock(takenStart)} was just booked
            </Text>
            <Text
              style={{
                color: c.muted,
                fontSize: 14,
                lineHeight: 20,
                textAlign: "center",
              }}
            >
              {alternatives.length
                ? `Another captain got there first. These ${durationAdjective(
                    duration,
                  )} times are still free on ${formatDayShort(day)}:`
                : `Another captain got there first, and no ${durationAdjective(
                    duration,
                  )} times are left on ${formatDayShort(day)}.`}
            </Text>
          </View>

          {alternatives.length > 0 && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              {alternatives.map((m) => {
                const active = picked === m;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setPicked(m)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 10,
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: active ? c.cta : c.freeBorder,
                      backgroundColor: active ? c.cta : c.surface,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: active ? "700" : "500",
                        color: active ? "#000" : c.text,
                      }}
                    >
                      {formatClock(m)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text style={{ color: c.muted, fontSize: 12, textAlign: "center" }}>
            Or try another day
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onOtherDays}
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
              <Text
                style={{ color: c.accent, fontSize: 16, fontWeight: "600" }}
              >
                Other days
              </Text>
            </TouchableOpacity>
            {picked != null && (
              <TouchableOpacity
                onPress={() => onBook(picked)}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: c.cta,
                }}
              >
                <Text
                  style={{ color: "#000", fontSize: 16, fontWeight: "700" }}
                >
                  Book {formatRange(picked, picked + duration)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
