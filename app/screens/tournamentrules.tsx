import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

const defaultRules = Array.from(
  { length: 7 },
  () => "3 Points For Wins, 1 Point For Draws",
);

export default function TournamentRulesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [rules, setRules] = useState(defaultRules);

  const removeRule = (index: number) => {
    setRules((currentRules) =>
      currentRules.filter((_, ruleIndex) => ruleIndex !== index),
    );
  };

  const handleCreateTournament = () => {
    console.log("Tournament rules:", rules);
  };

  return (
    <SafeAreaScreen>
      <ScrollView
        className="mb-[40px] h-full flex-1 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: 32,
          flexGrow: 1,
        }}
      >
        <View className="flex flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[16px] font-[500] text-black"
            >
              Back
            </ThemedText>
          </Pressable>

          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="text-[20px] font-[600] text-black"
          >
            New Tournament
          </ThemedText>

          <Pressable onPress={handleCreateTournament}>
            <Text className="text-[16px] font-[500] text-[#0C4D2E]">Next</Text>
          </Pressable>
        </View>

        <View className="mt-[19px] flex w-full flex-col items-center gap-2 rounded-[4px] bg-[#03EA8926] px-[17px] py-[21px] text-center">
          <ThemedText
            darkColor={theme.text}
            className="text-[14px] text-[#0C4D2E]"
          >
            You Are Officially The Captain Of This Ball Session!
          </ThemedText>
          <ThemedText
            darkColor={theme.text}
            className="text-[11px] text-[#0C4D2E]"
          >
            You Have [Timer] Before Your Session Is Cancelled
          </ThemedText>
          <ThemedText
            darkColor={theme.text}
            className="text-[11px] text-[#0C4D2E]"
          >
            Team Names Will Be Assigned Randomly
          </ThemedText>
        </View>

        <View className="mt-[45px] items-center">
          <TouchableOpacity
            className="rounded-[5px] bg-[#67F095] px-[28px] py-[15px]"
            onPress={handleCreateTournament}
          >
            <Text className="text-[14px] font-[500] text-black">
              Create Tournament
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-[35px]">
          <ThemedText
            darkColor={theme.text}
            className="mb-[10px] text-[16px] font-[500] text-black"
          >
            Rules:
          </ThemedText>

          <View className="gap-[10px]">
            {rules.map((rule, index) => (
              <View
                key={`${rule}-${index}`}
                className="flex-row items-start gap-[16px]"
              >
                <View className="flex-1">
                  <View className="min-h-[48px] border-[1px] border-gray-400 justify-center rounded-[5px]  px-[24px]">
                    <Text className="text-[14px] text-[#B8B8B8]">{rule}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="h-[48px] justify-center"
                  onPress={() => removeRule(index)}
                >
                  <Text className="text-[16px] text-[#B8B8B8]">x</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
