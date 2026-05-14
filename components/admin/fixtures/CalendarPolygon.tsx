import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface Props {
  date: string;
  day: string;
  isActive: boolean;
  isToday: boolean;
}

export function CalendarPolygon({ date, day, isActive, isToday }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity className="items-center gap-1">
      <View className="h-[51px] w-[51px] items-center justify-center">
        {isActive ? (
          <View className="relative h-full w-full">
            <Image
              source={require("@/assets/images/activepolygon.png")}
              resizeMode="contain"
              className="h-full w-full"
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-base font-semibold text-black">{date}</Text>
            </View>
          </View>
        ) : (
          <View className="relative h-full w-full">
            <Image
              source={require("@/assets/images/inactivepolygon.png")}
              resizeMode="contain"
              className="h-full w-full"
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-base font-semibold text-[#929292]">
                {date}
              </Text>
            </View>
          </View>
        )}
      </View>
      <ThemedText
        lightColor={theme.text}
        darkColor={theme.text}
        className="px-4 text-center text-base leading-6 text-black"
      >
        {day}
      </ThemedText>
      {isToday && (
        <Text className="text-xs font-medium text-[#00FF94]">Today</Text>
      )}
    </TouchableOpacity>
  );
}
