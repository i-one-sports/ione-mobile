import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import SectionCard from "@/components/ui/SectionCard";
import { useAppDispatch } from "@/redux/store";
import { createSession } from "@/api/sessions";
import Toast from "react-native-toast-message";
import { router, useLocalSearchParams } from "expo-router";

export default function Friendly() {
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const sessionId = params.locationId as string;
  const dispatch = useAppDispatch();
  console.log("All params:", params);
  console.log(sessionId);
  const theme = Colors[colorScheme ?? "light"];
  const [selectedOptions, setSelectedOptions] = useState({
    duration: "1",
  });

  const [showPicker, setShowPicker] = useState({
    duration: false,
  });
  // Options for duration
  const options = {
    duration: Array.from({ length: 10 }, (_, i) => ({
      value: (i + 1).toString(),
    })),
  };

  // Right icon component
  const CustomRightIcon: React.FC<{ value: string }> = ({ value }) => (
    <View className="absolute right-2 flex-row items-center gap-2">
      <View className="rounded-md border border-[#00000080] px-[10px] py-[7px]">
        <Text className="text-[11px] font-medium text-black">{value}</Text>
      </View>
      <Ionicons name="chevron-down" size={16} color="gray" />
    </View>
  );

  type PickerField = "duration";

  const handleOptionSelect = (field: PickerField, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
    setShowPicker((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  const togglePicker = (field: PickerField) => {
    setShowPicker((prev) => {
      const newState: Record<PickerField, boolean> = { duration: false };
      newState[field] = !prev[field];
      return newState;
    });
  };

  const formik = useFormik({
    initialValues: {
      location: "",
      tournamentName: "",
      timeDuration: "",
      startTime: "",
      endTime: "",
    },
    validationSchema: Yup.object({
      location: Yup.string().required("Location is required"),
      tournamentName: Yup.string().required("Tournament name is required"),
      timeDuration: Yup.string().required("Total minutes is required"),
      startTime: Yup.string().required("Start time is required"),
      endTime: Yup.string().required("Start time is required"),
    }),
    onSubmit: async (values) => {
      const payload = {
        sessionId,
        data: {
          timeDuration: Number(values.timeDuration),
          startTime: new Date().toISOString(),
          endTime: String(values.endTime),
          winningDecider: "highestGoals",
        },
      };
      console.log(payload);
      setLoading(true);
      dispatch(createSession(payload))
        .unwrap()
        .then((response) => {
          setLoading(false);
          console.log(response);

          Toast.show({
            type: "success",

            text1: "Success",
            text2: "Session created successfully",
          });

          setTimeout(() => {
            router.back();
          }, 500);
        })
        .catch((err) => {
          setLoading(false);
          console.log("error is", err);
          const message =
            err?.msg?.message || err?.msg || "Failed to create session";

          Toast.show({
            type: "error",
            props: {
              title: "Error",
              message: message,
            },
          });
        });
    },
  });

  return (
    <SafeAreaScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          className="mb-[40px] h-full flex-1 py-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            paddingHorizontal: 32,
            flexGrow: 1,
          }}
        >
          {/* Header */}
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
              New Session
            </ThemedText>

            <Text className="text-[16px] font-[500] text-[#0C4D2E]">Next</Text>
          </View>

          {/* Captain Info */}
          <View className="mt-[19px] mb-[32px] flex w-full flex-col items-center gap-2 rounded-[4px] bg-[#03EA8926] px-[17px] py-[21px] text-center ">
            <ThemedText
              darkColor={theme.text}
              className="text-[14px] text-[#0C4D2E]"
            >
              You are officially the captain of this ball session!
            </ThemedText>
            <ThemedText
              darkColor={theme.text}
              className="text-[11px] text-[#0C4D2E]"
            >
              You have [timer] before your Session is cancelled
            </ThemedText>
            <ThemedText
              darkColor={theme.text}
              className="text-[11px] text-[#0C4D2E]"
            >
              Team Names Will Be Assigned Randomly
            </ThemedText>
          </View>

          <SectionCard title="">
            <View className="flex flex-col gap-4">
              <InputField
                required
                label="Location"
                autoCapitalize="none"
                placeholder="Location"
                value={formik.values.location}
                onChangeText={formik.handleChange("location")}
                onBlur={formik.handleBlur("location")}
                errorMessage={
                  formik.touched.location && formik.errors.location
                    ? formik.errors.location
                    : ""
                }
              />

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

              <View className=" flex flex-row justify-between">
                <View className="w-[48%]">
                  <InputField
                    required
                    label="Start Time"
                    autoCapitalize="none"
                    placeholder="4:00 PM"
                    value={formik.values.startTime}
                    onChangeText={formik.handleChange("startTime")}
                    onBlur={formik.handleBlur("startTime")}
                    errorMessage={
                      formik.touched.startTime && formik.errors.startTime
                        ? formik.errors.startTime
                        : ""
                    }
                  />
                </View>

                <View className="w-[48%]">
                  <InputField
                    required
                    label="End Time"
                    autoCapitalize="none"
                    placeholder="4:00 PM"
                    value={formik.values.endTime}
                    onChangeText={formik.handleChange("endTime")}
                    onBlur={formik.handleBlur("endTime")}
                    errorMessage={
                      formik.touched.endTime && formik.errors.endTime
                        ? formik.errors.endTime
                        : ""
                    }
                  />
                </View>
              </View>
              <InputField
                required
                label="Total Minutes per Match"
                autoCapitalize="none"
                placeholder="Total Minutes per Match"
                value={formik.values.timeDuration}
                onChangeText={formik.handleChange("timeDuration")}
                onBlur={formik.handleBlur("timeDuration")}
                errorMessage={
                  formik.touched.timeDuration && formik.errors.timeDuration
                    ? formik.errors.timeDuration
                    : ""
                }
              />

              {/* <View className=" relative"> */}
              {/*   <InputField */}
              {/*     selectPicker */}
              {/*     required */}
              {/*     label="Total Minutes per Match" */}
              {/*     autoCapitalize="none" */}
              {/*     placeholder=" Total Minutes per Match" */}
              {/*     value="" */}
              {/*     pickerPressed={() => togglePicker('duration')} */}
              {/*     rightIcon={<CustomRightIcon value={selectedOptions.duration} />} */}
              {/*   /> */}
              {/**/}
              {/*   {showPicker.duration && ( */}
              {/*     <View className="absolute right-[30px] top-[50%] z-10 mt-7 max-h-40 w-[40px] rounded-lg border border-gray-300 bg-white shadow-lg"> */}
              {/*       <ScrollView className="max-h-40"> */}
              {/*         {options.duration.map((option, index) => ( */}
              {/*           <TouchableOpacity */}
              {/*             key={option.value} */}
              {/*             className={`px-2 py-2 ${ */}
              {/*               index !== options.duration.length - 1 ? 'border-b border-gray-200' : '' */}
              {/*             } ${selectedOptions.duration === option.value ? 'bg-blue-50' : ''}`} */}
              {/*             onPress={() => handleOptionSelect('duration', option.value)}> */}
              {/*             <Text */}
              {/*               className={`text-center ${ */}
              {/*                 selectedOptions.duration === option.value */}
              {/*                   ? 'font-medium text-blue-600' */}
              {/*                   : 'text-gray-700' */}
              {/*               }`}> */}
              {/*               {option.value} */}
              {/*             </Text> */}
              {/*           </TouchableOpacity> */}
              {/*         ))} */}
              {/*       </ScrollView> */}
              {/*     </View> */}
              {/*   )} */}
              {/* </View> */}
              {/**/}
              {/* Start Time & End Time Row */}
            </View>
          </SectionCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
