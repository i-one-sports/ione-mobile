import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFormik } from "formik";
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
import * as Yup from "yup";

import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

type PickerField = "duration" | "players" | "rounds";

type TournamentFormValues = {
  tournamentName: string;
  timeDuration: string;
  playersPerTeam: string;
  setNumber: string;
  startDate: string;
  endDate: string;
};

export default function TournamentFormScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [showPicker, setShowPicker] = useState({
    duration: false,
    players: false,
    rounds: false,
  });

  const options = {
    duration: Array.from({ length: 10 }, (_, i) => ({
      value: (i + 1).toString(),
    })),
    players: Array.from({ length: 8 }, (_, i) => ({
      value: (i + 2).toString(),
    })),
    rounds: Array.from({ length: 5 }, (_, i) => ({
      value: (i + 1).toString(),
    })),
  };

  const formik = useFormik({
    initialValues: {
      tournamentName: "",
      timeDuration: "1",
      playersPerTeam: "2",
      setNumber: "3",
      startDate: "",
      endDate: "",
    },
    validationSchema: Yup.object({
      tournamentName: Yup.string().required("Tournament name is required"),
      timeDuration: Yup.string().required("Total minutes is required"),
      playersPerTeam: Yup.string().required("Players per team is required"),
      setNumber: Yup.string().required("Number of teams is required"),
      startDate: Yup.string().required("Start date is required"),
      endDate: Yup.string().required("End date is required"),
    }),
    onSubmit: (values: TournamentFormValues) => {
      console.log("Tournament form values:", values);
      router.push("/screens/tournamentsetup");
    },
  });

  const handleOptionSelect = (field: PickerField, value: string) => {
    const fieldMap = {
      duration: "timeDuration",
      players: "playersPerTeam",
      rounds: "setNumber",
    };

    formik.setFieldValue(fieldMap[field], value);
    setShowPicker((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  const togglePicker = (field: PickerField) => {
    setShowPicker((prev) => ({
      duration: false,
      players: false,
      rounds: false,
      [field]: !prev[field],
    }));
  };

  const CustomRightIcon: React.FC<{ value: string }> = ({ value }) => (
    <View className="absolute right-2 flex-row items-center gap-2">
      <View className="rounded-md border border-[#00000080] px-[10px] py-[7px]">
        <Text className="text-[11px] font-medium text-black">{value}</Text>
      </View>
      <Ionicons name="chevron-down" size={16} color="gray" />
    </View>
  );

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

            <Pressable onPress={() => formik.handleSubmit()}>
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
              onPress={() => formik.handleSubmit()}
            >
              <Text className="text-[14px] font-[500] text-black">Next</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-[45px]">
            <InputField
              required
              label="Tournament Name"
              autoCapitalize="none"
              placeholder="Tournament Name"
              value={formik.values.tournamentName}
              onChangeText={formik.handleChange("tournamentName")}
              onBlur={formik.handleBlur("tournamentName")}
              errorMessage={
                formik.touched.tournamentName && formik.errors.tournamentName
                  ? formik.errors.tournamentName
                  : ""
              }
            />

            <View className="relative">
              <InputField
                selectPicker
                required
                label="Total Minutes per Match"
                autoCapitalize="none"
                placeholder=" Total Minutes per Match"
                value=""
                pickerPressed={() => togglePicker("duration")}
                rightIcon={
                  <CustomRightIcon value={formik.values.timeDuration} />
                }
                errorMessage={
                  formik.touched.timeDuration && formik.errors.timeDuration
                    ? formik.errors.timeDuration
                    : ""
                }
              />

              {showPicker.duration && (
                <View className="absolute right-[30px] top-[50%] z-10 mt-7 max-h-40 w-[40px] rounded-lg border border-gray-300 bg-white shadow-lg">
                  <ScrollView className="max-h-40">
                    {options.duration.map((option, index) => (
                      <TouchableOpacity
                        key={option.value}
                        className={`px-2 py-2 ${
                          index !== options.duration.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        } ${formik.values.timeDuration === option.value ? "bg-blue-50" : ""}`}
                        onPress={() =>
                          handleOptionSelect("duration", option.value)
                        }
                      >
                        <Text
                          className={`text-center ${
                            formik.values.timeDuration === option.value
                              ? "font-medium text-blue-600"
                              : "text-gray-700"
                          }`}
                        >
                          {option.value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View className="relative">
              <InputField
                selectPicker
                required
                label="Number Of Players per Team"
                autoCapitalize="none"
                placeholder="Number Of Players per Team"
                value=""
                pickerPressed={() => togglePicker("players")}
                rightIcon={
                  <CustomRightIcon value={formik.values.playersPerTeam} />
                }
                errorMessage={
                  formik.touched.playersPerTeam && formik.errors.playersPerTeam
                    ? formik.errors.playersPerTeam
                    : ""
                }
              />

              {showPicker.players && (
                <View className="absolute right-[30px] top-[50%] z-10 mt-7 max-h-40 w-[40px] rounded-lg border border-gray-300 bg-white shadow-lg">
                  <ScrollView className="max-h-40">
                    {options.players.map((option, index) => (
                      <TouchableOpacity
                        key={option.value}
                        className={`px-2 py-2 ${
                          index !== options.players.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        } ${formik.values.playersPerTeam === option.value ? "bg-blue-50" : ""}`}
                        onPress={() =>
                          handleOptionSelect("players", option.value)
                        }
                      >
                        <Text
                          className={`text-center ${
                            formik.values.playersPerTeam === option.value
                              ? "font-medium text-blue-600"
                              : "text-gray-700"
                          }`}
                        >
                          {option.value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View className="relative">
              <InputField
                selectPicker
                required
                label="Number Of Teams"
                autoCapitalize="none"
                placeholder="Number Of Teams"
                value=""
                pickerPressed={() => togglePicker("rounds")}
                rightIcon={<CustomRightIcon value={formik.values.setNumber} />}
                errorMessage={
                  formik.touched.setNumber && formik.errors.setNumber
                    ? formik.errors.setNumber
                    : ""
                }
              />

              {showPicker.rounds && (
                <View className="absolute right-[30px] top-[50%] z-10 mt-7 max-h-40 w-[40px] rounded-lg border border-gray-300 bg-white shadow-lg">
                  <ScrollView className="max-h-40">
                    {options.rounds.map((option, index) => (
                      <TouchableOpacity
                        key={option.value}
                        className={`px-2 py-2 ${
                          index !== options.rounds.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        } ${formik.values.setNumber === option.value ? "bg-blue-50" : ""}`}
                        onPress={() =>
                          handleOptionSelect("rounds", option.value)
                        }
                      >
                        <Text
                          className={`text-center ${
                            formik.values.setNumber === option.value
                              ? "font-medium text-blue-600"
                              : "text-gray-700"
                          }`}
                        >
                          {option.value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <InputField
                  required
                  label="Start Date"
                  placeholder="YYYY-MM-DD"
                  value={formik.values.startDate}
                  onChangeText={formik.handleChange("startDate")}
                  onBlur={formik.handleBlur("startDate")}
                  errorMessage={
                    formik.touched.startDate && formik.errors.startDate
                      ? formik.errors.startDate
                      : ""
                  }
                />
              </View>

              <View className="flex-1">
                <InputField
                  required
                  label="End Date"
                  placeholder="YYYY-MM-DD"
                  value={formik.values.endDate}
                  onChangeText={formik.handleChange("endDate")}
                  onBlur={formik.handleBlur("endDate")}
                  errorMessage={
                    formik.touched.endDate && formik.errors.endDate
                      ? formik.errors.endDate
                      : ""
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
