import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAppDispatch } from "@/redux/store";
import { createSession } from "@/api/sessions";
import Toast from "react-native-toast-message";
import Loader from "@/components/loader";
import SectionCard from "@/components/ui/SectionCard";

export default function NewSession() {
  const params = useLocalSearchParams();
  const sessionId = params.locationId as string;
  const dispatch = useAppDispatch();
  console.log("All params:", params);
  console.log(sessionId);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [loading, setLoading] = useState(false);

  const [showPicker, setShowPicker] = useState({
    duration: false,
    players: false,
    rounds: false,
  });

  // Options for each select input
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

  // Formik setup
  const formik = useFormik({
    initialValues: {
      location: "",
      tournamentName: "",
      timeDuration: "",
      playersPerTeam: "",
      setNumber: "",
      minsPerSet: "10",
    },
    validationSchema: Yup.object({
      location: Yup.string().required("Location is required"),
      tournamentName: Yup.string().required("Tournament name is required"),
      timeDuration: Yup.string().required("Total minutes is required"),
      playersPerTeam: Yup.string().required("Players per team is required"),
      setNumber: Yup.string().required("Number of teams is required"),
      minsPerSet: Yup.string().required("Minutes per set is required"),
    }),
    onSubmit: async (values) => {
      const payload = {
        sessionId,
        data: {
          setNumber: Number(values.setNumber),
          playersPerTeam: Number(values.playersPerTeam),
          timeDuration: Number(values.timeDuration),
          minsPerSet: Number(values.minsPerSet),
          startTime: new Date().toISOString(),
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

  type PickerField = "duration" | "players" | "rounds";

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

            <Pressable onPress={() => formik.handleSubmit()} disabled={loading}>
              <Text
                className={`text-[16px] font-[500] ${loading ? "text-gray-400" : "text-[#0C4D2E]"}`}
              >
                {loading ? "Creating..." : "Next"}
              </Text>
            </Pressable>
          </View>

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
            <View>
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

              <InputField
                required
                label="Number Of Players per Team"
                autoCapitalize="none"
                placeholder="Number of Players per Team"
                value={formik.values.playersPerTeam}
                onChangeText={formik.handleChange("players")}
                onBlur={formik.handleBlur("players")}
                errorMessage={
                  formik.touched.playersPerTeam && formik.errors.playersPerTeam
                    ? formik.errors.playersPerTeam
                    : ""
                }
              />

              <InputField
                required
                label="Number Of Teams"
                autoCapitalize="none"
                placeholder="Number Of per Teams"
                value={formik.values.setNumber}
                onChangeText={formik.handleChange("rounds")}
                onBlur={formik.handleBlur("rounds")}
                errorMessage={
                  formik.touched.setNumber && formik.errors.setNumber
                    ? formik.errors.setNumber
                    : ""
                }
              />

              {/* Rounds Select Input */}
              {/* <View className=" relative"> */}
              {/*   <InputField */}
              {/*     selectPicker */}
              {/*     required */}
              {/*     label="Number Of Teams" */}
              {/*     autoCapitalize="none" */}
              {/*     placeholder="Number Of Teams" */}
              {/*     value="" */}
              {/*     pickerPressed={() => togglePicker("rounds")} */}
              {/*     rightIcon={<CustomRightIcon value={formik.values.setNumber} />} */}
              {/*     errorMessage={ */}
              {/*       formik.touched.setNumber && formik.errors.setNumber */}
              {/*         ? formik.errors.setNumber */}
              {/*         : "" */}
              {/*     } */}
              {/*   /> */}
              {/**/}
              {/*   {showPicker.rounds && ( */}
              {/*     <View className="absolute right-[30px] top-[50%] z-10 mt-7 max-h-40 w-[40px] rounded-lg border border-gray-300 bg-white shadow-lg"> */}
              {/*       <ScrollView className="max-h-40"> */}
              {/*         {options.rounds.map((option, index) => ( */}
              {/*           <TouchableOpacity */}
              {/*             key={option.value} */}
              {/*             className={`px-2 py-2 ${ */}
              {/*               index !== options.rounds.length - 1 */}
              {/*                 ? "border-b border-gray-200" */}
              {/*                 : "" */}
              {/*             } ${formik.values.setNumber === option.value ? "bg-blue-50" : ""}`} */}
              {/*             onPress={() => handleOptionSelect("rounds", option.value)} */}
              {/*           > */}
              {/*             <Text */}
              {/*               className={`text-center ${ */}
              {/*                 formik.values.setNumber === option.value */}
              {/*                   ? "font-medium text-blue-600" */}
              {/*                   : "text-gray-700" */}
              {/*               }`} */}
              {/*             > */}
              {/*               {option.value} */}
              {/*             </Text> */}
              {/*           </TouchableOpacity> */}
              {/*         ))} */}
              {/*       </ScrollView> */}
              {/*     </View> */}
              {/*   )} */}
              {/* </View> */}
              {/**/}
              {/* Minutes Per Set */}
              {/* <InputField */}
              {/*   required */}
              {/*   label="Minutes Per Set" */}
              {/*   placeholder="10" */}
              {/*   keyboardType="numeric" */}
              {/*   value={formik.values.minsPerSet} */}
              {/*   onChangeText={formik.handleChange('minsPerSet')} */}
              {/*   onBlur={formik.handleBlur('minsPerSet')} */}
              {/*   errorMessage={formik.touched.minsPerSet && formik.errors.minsPerSet ? formik.errors.minsPerSet : ''} */}
              {/* /> */}
            </View>
          </SectionCard>
        </ScrollView>
        <Loader visible={loading} />
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
