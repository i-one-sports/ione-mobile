import { View } from "react-native";
import { Skeleton } from "moti/skeleton";
import PolygonSkeleton from "./ui/PolygonSkeleton";
import { useColorScheme } from "nativewind";
import React from "react";

export default function MatchCardSkeleton() {
  const { colorScheme } = useColorScheme();

  const mode = colorScheme === "dark" ? "dark" : "light";

  return (
    <View className="dark:bg-gray-800 bg-[#EDFFF8] rounded-[5px] py-[10px] px-[25px] gap-[12px]">
      <View className="flex-row justify-between items-center">
        <Skeleton colorMode={mode} width={40} height={12} radius={4} />
        <Skeleton colorMode={mode} width={60} height={12} radius={4} />
        <Skeleton colorMode={mode} width={20} height={12} radius={4} />
      </View>

      <View className="flex-row justify-center items-center gap-6">
        <View className="items-center gap-2">
          <PolygonSkeleton size={48} />
          <Skeleton colorMode={mode} width={60} height={12} radius={4} />
        </View>

        <View className="flex-row gap-2">
          <Skeleton colorMode={mode} width={10} height={10} radius={4} />
          <Skeleton colorMode={mode} width={10} height={10} radius={4} />
          <Skeleton colorMode={mode} width={10} height={10} radius={4} />
        </View>

        <View className="items-center gap-2">
          <PolygonSkeleton size={48} />
          <Skeleton colorMode={mode} width={60} height={12} radius={4} />
        </View>
      </View>
    </View>
  );
}
