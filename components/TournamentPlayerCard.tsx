import ChevronRight from "@/assets/svg/ChevronRight";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type TournamentPlayerCardProps = {
  number: number;
  name: string;
  initials?: string;
  textColor: string;
  mutedTextColor: string;
  onPress?: () => void;
};

export default function TournamentPlayerCard({
  number,
  name,
  initials = "JD",
  textColor,
  mutedTextColor,
  onPress,
}: TournamentPlayerCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-[#69F99B] bg-[#EDFFF8] px-[14px] py-[14px]"
    >
      <View className="flex-row items-center gap-[14px]">
        <Text className="w-[18px] text-center text-[13px] font-[600] text-black">
          {number}
        </Text>
        <View className="h-[40px] w-[40px] items-center justify-center rounded-full bg-black">
          <Text className="text-[11px] font-[700] text-white">{initials}</Text>
        </View>
        <Text className="text-[13px] font-[600] text-black">{name}</Text>
      </View>

      <ChevronRight
        width={18}
        height={18}
        color={mutedTextColor || textColor}
      />
    </TouchableOpacity>
  );
}
