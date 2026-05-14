import React from "react";
import { Pressable, Text, View } from "react-native";
import { DropdownIcon } from "./DropdownIcon";
import { Match, TeamSchedule } from "./types";

interface Props {
  teamSchedule: TeamSchedule;
  isExpanded: boolean;
  onToggle: () => void;
  renderMatch: (match: Match, idx: number) => React.ReactNode;
}

export function TeamScheduleGroup({
  teamSchedule,
  isExpanded,
  onToggle,
  renderMatch,
}: Props) {
  return (
    <View className="overflow-hidden rounded-md bg-[#ECFFF8]">
      <Pressable
        className={`relative flex-row items-center justify-between border-b-2 px-[21px] py-[23px] ${
          isExpanded ? "border-[#DFDFDF]" : "rounded-b-md border-[#00FF94]"
        }`}
        onPress={onToggle}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-[#00FF94]">
            <Text className="text-xs font-bold text-white">
              {teamSchedule.teamInitials}
            </Text>
          </View>
          <Text className="text-lg font-semibold">{teamSchedule.teamName}</Text>
        </View>
        <View className="relative justify-center self-stretch pl-[21px]">
          <View className="absolute bottom-[-23px] left-0 top-[-23px] border-l-[1px] border-[#DFDFDF]" />
          <DropdownIcon isExpanded={isExpanded} />
        </View>
      </Pressable>
      {isExpanded && (
        <View className="border-b-2 border-b-[#00FF94]">
          {teamSchedule.matches.map((match, idx) => renderMatch(match, idx))}
        </View>
      )}
    </View>
  );
}
