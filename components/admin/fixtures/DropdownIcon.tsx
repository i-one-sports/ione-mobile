import CloseIcon from "@/assets/svg/CloseIcon";
import OpenIcon from "@/assets/svg/OpenIcon";
import React from "react";
import { Text, View } from "react-native";

interface Props {
  isExpanded: boolean;
}

export function DropdownIcon({ isExpanded }: Props) {
  return (
    <View className="p-1">
      <Text className="text-base text-gray-500">
        {isExpanded ? <CloseIcon /> : <OpenIcon />}
      </Text>
    </View>
  );
}
