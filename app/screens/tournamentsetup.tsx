import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

const pitchCountOptions = ["1", "2", "3", "4", "5"];

function Chip({ label }: { label: string }) {
  return (
    <View className="rounded-[5px] bg-white px-[12px] py-[10px]">
      <Text className="text-[11px] text-[#5B5B5B]">{label} x</Text>
    </View>
  );
}

export default function TournamentSetupScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [showPitchCount, setShowPitchCount] = useState(false);
  const [pitchCount, setPitchCount] = useState("3");
  const [pitchName, setPitchName] = useState("");
  const [teamPrize, setTeamPrize] = useState("");
  const [playerPrize, setPlayerPrize] = useState("");

  const CustomRightIcon: React.FC<{ value: string }> = ({ value }) => (
    <View className="absolute right-2 flex-row items-center gap-2">
      <View className="rounded-md border border-[#00000080] px-[10px] py-[7px]">
        <Text className="text-[11px] font-medium text-black">{value}</Text>
      </View>
      <Ionicons name="chevron-down" size={16} color="gray" />
    </View>
  );

  const handleNext = () => {
    console.log("Tournament setup values:", {
      pitchCount,
      pitchName,
      teamPrize,
      playerPrize,
    });
    router.push("/screens/tournamentrules");
  };

  return (
    <SafeAreaScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="mb-[40px]  h-full flex-1 py-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 64,
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

            <Pressable onPress={handleNext}>
              <Text className="text-[16px] font-[500] text-[#0C4D2E]">
                Next
              </Text>
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
              className="rounded-[5px] bg-[#67F095] px-[33px] py-[15px]"
              onPress={handleNext}
            >
              <Text className="text-[14px] font-[500] text-black">Next</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-[45px] gap-[26px]">
            <View className="relative">
              <InputField
                selectPicker
                required
                label="Pitch Count"
                placeholder="Pitch Count"
                value=""
                pickerPressed={() => setShowPitchCount((current) => !current)}
                rightIcon={<CustomRightIcon value={pitchCount} />}
              />

              {showPitchCount && (
                <View className="absolute right-[30px] top-[50%] z-10 mt-7 w-[40px] rounded-lg border border-gray-300 bg-white shadow-lg">
                  {pitchCountOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      className={`px-2 py-2 ${
                        pitchCount === option ? "bg-blue-50" : ""
                      }`}
                      onPress={() => {
                        setPitchCount(option);
                        setShowPitchCount(false);
                      }}
                    >
                      <Text
                        className={`text-center ${
                          pitchCount === option
                            ? "font-medium text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View className="gap-[5px]">
              <InputField
                required
                label="Pitch Name"
                placeholder="Pitch Name"
                value={pitchName}
                onChangeText={setPitchName}
              />
              <View className="flex-row  gap-[10px]">
                <Chip label="Royal Turf, Ikate" />
                <Chip label="Top Boys Turf, Igando" />
              </View>
            </View>

            <View className="gap-[5px]">
              <InputField
                required
                label="Team Winning Prize"
                placeholder="Team Winning Prize"
                value={teamPrize}
                onChangeText={setTeamPrize}
              />
              <View className="flex-row flex-wrap gap-[10px]">
                <Chip label="500,000" />
                <Chip label="Team Bus" />
              </View>
            </View>

            <View className="gap-[5px]">
              <InputField
                required
                label="Player Winning Prize"
                placeholder="Player Winning Prize"
                value={playerPrize}
                onChangeText={setPlayerPrize}
              />
              <View className="flex-row flex-wrap gap-[10px]">
                <Chip label="Award" />
                <Chip label="100,000" />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
