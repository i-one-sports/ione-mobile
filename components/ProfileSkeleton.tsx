import React from "react";
import { View } from "react-native";
import { Skeleton } from "moti/skeleton";
import { useColorScheme } from "nativewind";

export default function ProfileSkeleton() {
  const { colorScheme } = useColorScheme();
  const mode = colorScheme === "dark" ? "dark" : "light";

  return (
    <View className="gap-4 mt-10">
      {/* Card 1 */}
      <View className="bg-white dark:bg-[#111111] p-4 rounded-md">
        <View className="flex-row gap-4 items-center pb-4 border-b border-gray-100 dark:border-zinc-900">
          <Skeleton colorMode={mode} width={80} height={80} radius={999} />

          <View className="gap-2">
            <Skeleton colorMode={mode} width={140} height={18} radius={4} />
            <Skeleton colorMode={mode} width={100} height={14} radius={4} />
          </View>
        </View>

        {[1, 2, 3].map((item) => (
          <View
            key={item}
            className="flex-row justify-between items-center py-4 border-b border-gray-100 dark:border-zinc-900"
          >
            <Skeleton colorMode={mode} width={90} height={14} radius={4} />
            <Skeleton colorMode={mode} width={120} height={14} radius={4} />
          </View>
        ))}
      </View>

      {/* Card 2 */}
      <View className="bg-white dark:bg-[#111111] p-4 rounded-md">
        {[1, 2, 3, 4, 5].map((item, index) => (
          <View
            key={item}
            className={`flex-row justify-between items-center py-4 ${
              index !== 4 ? "border-b border-gray-100 dark:border-zinc-900" : ""
            }`}
          >
            <Skeleton colorMode={mode} width={110} height={14} radius={4} />
            <Skeleton colorMode={mode} width={130} height={14} radius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}
