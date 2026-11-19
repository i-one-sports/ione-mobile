import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useBookingColors } from "./bookingColors";

interface Props {
  /** Minutes. */
  value: number;
  onChange: (minutes: number) => void;
  /** Hourly pitches only take whole hours. */
  wholeHours?: boolean;
}

const PRESETS = [60, 120, 180];

// B01 · "How long": 1, 2 or 3 hours, or a custom length.
export default function DurationChips({ value, onChange, wholeHours }: Props) {
  const c = useBookingColors();
  const isPreset = PRESETS.includes(value);
  const [custom, setCustom] = useState(!isPreset);
  const [text, setText] = useState(
    isPreset ? "" : String(wholeHours ? value / 60 : value),
  );

  // A suggestion (e.g. "2 hours on Fri") can change the length from
  // outside; show it on a preset chip, or in the custom box.
  useEffect(() => {
    const typed = Number(text) * (wholeHours ? 60 : 1);
    if (custom && typed === value) return;
    if (isPreset) setCustom(false);
    else {
      setCustom(true);
      setText(String(wholeHours ? value / 60 : value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const chip = (label: string, active: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        flex: 1,
        paddingVertical: 13,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: active ? c.cta : c.border,
        backgroundColor: active ? c.freeBg : c.surface,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: active ? "700" : "500",
          color: active ? c.accent : c.text,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const onCustomText = (t: string) => {
    const digits = t.replace(/[^0-9]/g, "");
    setText(digits);
    const n = Number(digits);
    if (n > 0) onChange(wholeHours ? n * 60 : n);
  };

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>
        How long
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {PRESETS.map((m) =>
          chip(
            m === 60 ? "1 hr" : `${m / 60} hrs`,
            !custom && value === m,
            () => {
              setCustom(false);
              onChange(m);
            },
          ),
        )}
        {chip("Custom", custom, () => {
          setCustom(true);
          const n = Number(text);
          if (n > 0) onChange(wholeHours ? n * 60 : n);
        })}
      </View>
      {custom && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TextInput
            value={text}
            onChangeText={onCustomText}
            keyboardType="number-pad"
            placeholder={wholeHours ? "e.g. 4" : "e.g. 90"}
            placeholderTextColor={c.muted}
            autoFocus
            maxLength={wholeHours ? 2 : 4}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: c.text,
              backgroundColor: c.surface,
            }}
          />
          <Text style={{ color: c.muted, fontSize: 14 }}>
            {wholeHours ? "hours (whole hours only)" : "minutes"}
          </Text>
        </View>
      )}
    </View>
  );
}
