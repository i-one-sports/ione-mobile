import React from "react";
import { Pressable, Text, View } from "react-native";
import { SessionSet } from "@/components/typings/apiResponse";

interface TeamBoxesProps {
  sets: SessionSet[];
  selectedSet: string | null;
  onSelectSet: (setId: string | null) => void;
}

export default function TeamBoxes({
  sets,
  selectedSet,
  onSelectSet,
}: TeamBoxesProps) {
  return (
    <View className="flex flex-row items-start px-8 gap-5">
      {sets.map((set) => {
        const isActive = selectedSet === set._id;

        return (
          <Pressable
            key={set._id}
            onPress={() => onSelectSet(isActive ? null : set._id)}
            className={`w-full flex-1 p-3 rounded-md items-center justify-center ${
              isActive ? "bg-[#00FF94]" : "bg-[#E4E4E4]"
            }`}
          >
            <Text className="text-[12px] font-[600]">{set.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
