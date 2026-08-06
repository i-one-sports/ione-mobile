import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
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
import TimePickerField from "@/components/TimePickerField";

export default function NewSession() {
  const params = useLocalSearchParams();
  const sessionId = params.locationId as string;
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [loading, setLoading] = useState(false);

  const [startTimeOfDay, setStartTimeOfDay] = useState("");
  const [showDeciderModal, setShowDeciderModal] = useState(false);

  const winningDeciderOptions = [
    { label: "Penalty Shootout", value: "PENALTY" },
    { label: "Highest Goals", value: "highestGoals" },
    { label: "Golden Goal", value: "goldenGoal" },
  ];

  const getWinningDeciderLabel = (value: string) =>
    winningDeciderOptions.find((o) => o.value === value)?.label ?? value;

  const buildStartTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d.toISOString();
  };

  const handleTimeChange = (time: string) => {
    setStartTimeOfDay(time);
    formik.setFieldValue("startTime", buildStartTime(time));
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      //   tournamentName: "",
      startTime: "",
      timeDuration: "",
      playersPerTeam: "",
      setNumber: "",
      winningDecider: "",
      minsPerSet: "",
    },
    validationSchema: Yup.object({
      //   tournamentName: Yup.string().required("Tournament name is required"),
      startTime: Yup.string().required("Start date and time is required"),
      timeDuration: Yup.string().required("Total minutes is required"),
      playersPerTeam: Yup.string().required("Players per team is required"),
      setNumber: Yup.string().required("Number of teams is required"),
      winningDecider: Yup.string().required("Winning decider is required"),
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
          startTime: values.startTime,
          winningDecider: values.winningDecider,
        },
      };
      console.log(payload);
      setLoading(true);
      dispatch(createSession(payload))
        .unwrap()
        .then((response) => {
          setLoading(false);
          console.log("responseee", response);
          Toast.show({
            type: "success",
            props: {
              title: "Success",
              message: response.message || "Session created successfully",
            },
          });

          router.replace({
            pathname: "/joinsession",
            params: {
              sessionId: response._id,
            },
          });
        })
        .catch((err) => {
          setLoading(false);
          const message =
            err?.msg?.message || err?.msg || "Failed to create session";
          Toast.show({
            type: "error",
            props: {
              title: "Error",
              message,
            },
          });
        });
    },
  });

  const SelectModal: React.FC<{
    visible: boolean;
    options: { label: string; value: string }[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    onClose: () => void;
  }> = ({ visible, options, selectedValue, onSelect, onClose }) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === selectedValue;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 20,
                  borderBottomWidth: i < options.length - 1 ? 1 : 0,
                  borderBottomColor:
                    colorScheme === "dark" ? "#2a2a2a" : "#f2f2f2",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isSelected ? "600" : "400",
                    color: colorScheme === "dark" ? "#fff" : "#111",
                  }}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color="#00C853" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
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
              className="text-[14px] text-center text-[#0C4D2E]"
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

          <SectionCard title="Session Details">
            <View>
              {/* <InputField
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
              /> */}

              {/* Start Time & Total Minutes */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TimePickerField
                    label="Start Time"
                    value={startTimeOfDay}
                    onChange={handleTimeChange}
                  />
                </View>
                <View className="flex-1">
                  <InputField
                    required
                    label="Total Minutes"
                    keyboardType="numeric"
                    placeholder="e.g. 120"
                    value={formik.values.timeDuration}
                    onChangeText={formik.handleChange("timeDuration")}
                    onBlur={formik.handleBlur("timeDuration")}
                    errorMessage={
                      formik.touched.timeDuration && formik.errors.timeDuration
                        ? formik.errors.timeDuration
                        : ""
                    }
                  />
                </View>
              </View>

              {/* Players per Team & Number of Teams */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <InputField
                    required
                    label="Players / Team"
                    keyboardType="numeric"
                    placeholder="e.g. 5"
                    value={formik.values.playersPerTeam}
                    onChangeText={formik.handleChange("playersPerTeam")}
                    onBlur={formik.handleBlur("playersPerTeam")}
                    errorMessage={
                      formik.touched.playersPerTeam &&
                      formik.errors.playersPerTeam
                        ? formik.errors.playersPerTeam
                        : ""
                    }
                  />
                </View>
                <View className="flex-1">
                  <InputField
                    required
                    label="Number of Teams"
                    keyboardType="numeric"
                    placeholder="e.g. 3"
                    value={formik.values.setNumber}
                    onChangeText={formik.handleChange("setNumber")}
                    onBlur={formik.handleBlur("setNumber")}
                    errorMessage={
                      formik.touched.setNumber && formik.errors.setNumber
                        ? formik.errors.setNumber
                        : ""
                    }
                  />
                </View>
              </View>

              {/* Minutes Per Set */}
              <InputField
                required
                label="Minutes Per Set"
                keyboardType="numeric"
                placeholder="e.g. 30"
                value={formik.values.minsPerSet}
                onChangeText={formik.handleChange("minsPerSet")}
                onBlur={formik.handleBlur("minsPerSet")}
                errorMessage={
                  formik.touched.minsPerSet && formik.errors.minsPerSet
                    ? formik.errors.minsPerSet
                    : ""
                }
              />

              {/* Winning Decider */}
              <InputField
                required
                label="Winning Decider"
                selectPicker
                placeholder="Select decider"
                value={
                  formik.values.winningDecider
                    ? getWinningDeciderLabel(formik.values.winningDecider)
                    : ""
                }
                pickerPressed={() => setShowDeciderModal(true)}
                rightIcon={
                  <Ionicons name="chevron-down" size={16} color="gray" />
                }
                errorMessage={
                  formik.touched.winningDecider && formik.errors.winningDecider
                    ? formik.errors.winningDecider
                    : ""
                }
              />
            </View>
          </SectionCard>
        </ScrollView>
        <SelectModal
          visible={showDeciderModal}
          options={winningDeciderOptions}
          selectedValue={formik.values.winningDecider}
          onSelect={(value) => {
            formik.setFieldValue("winningDecider", value);
            setShowDeciderModal(false);
          }}
          onClose={() => setShowDeciderModal(false)}
        />
        <Loader visible={loading} />
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
