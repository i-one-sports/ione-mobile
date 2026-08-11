import React, { useRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DateItem } from "./types";

interface Props {
  dates: DateItem[];
  selectedDate: Date | null;
  onDatePress: (item: DateItem) => void;
  isDark: boolean;
}

export function DateStrip({ dates, selectedDate, onDatePress, isDark }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const mutedText = isDark ? "#555" : "#999";

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 6 }}
    >
      {dates.map((item) => {
        const isSelected = selectedDate?.getTime() === item.id;
        const isToday = item.isToday;

        const bg = isSelected
          ? "#00FF94"
          : isToday
            ? isDark
              ? "#0D2B1F"
              : "#E6FFF4"
            : isDark
              ? "#181818"
              : "#F2F2F2";

        const numColor = isSelected
          ? "#000"
          : isToday
            ? "#00CC77"
            : isDark
              ? "#CCC"
              : "#333";

        const dayColor = isSelected
          ? "#003A1A"
          : isToday
            ? "#00AA66"
            : mutedText;

        return (
          <Pressable
            key={item.id}
            onPress={() => onDatePress(item)}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 68,
              borderRadius: 16,
              backgroundColor: bg,
              borderWidth: isToday && !isSelected ? 1.5 : 0,
              borderColor: "#00FF94",
              gap: 2,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: dayColor,
                letterSpacing: 0.3,
              }}
            >
              {item.dayName.toUpperCase()}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: numColor,
                lineHeight: 24,
              }}
            >
              {item.dateNumber}
            </Text>
            {isToday && (
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: isSelected ? "#003A1A" : "#00FF94",
                }}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
