import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useFormik } from "formik";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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
import Loader from "@/components/loader";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import SectionCard from "@/components/ui/SectionCard";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

type TournamentFormValues = {
  name: string;
  type: string;
  description: string;
  prizeMoney: string;
  registrationFee: string;
  minutesPerMatch: string;
  playersPerTeam: string;
  maxTeams: string;
};

const tournamentTypes = [
  { label: "Knockout", value: "knockout" },
  { label: "League", value: "league" },
];

const getTypeLabel = (value: string) =>
  tournamentTypes.find((t) => t.value === value)?.label ?? value;

export default function TournamentFormScreen() {
  const { locationId } = useLocalSearchParams<{ locationId?: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      type: "knockout",
      description: "",
      prizeMoney: "",
      registrationFee: "",
      minutesPerMatch: "",
      playersPerTeam: "",
      maxTeams: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Tournament name is required"),
      type: Yup.string()
        .oneOf(["knockout", "league"])
        .required("Type is required"),
      prizeMoney: Yup.string().required("Prize money is required"),
      registrationFee: Yup.string().required("Registration fee is required"),
      minutesPerMatch: Yup.string().required("Minutes per match is required"),
      playersPerTeam: Yup.string().required("Players per team is required"),
      maxTeams: Yup.string().required("Max teams is required"),
    }),
    onSubmit: (values: TournamentFormValues) => {
      setLoading(true);
      // Pass values (as strings) forward; numeric conversion happens at submit.
      router.push({
        pathname: "/screens/tournamentsetup",
        params: {
          locationId: locationId ?? "",
          data: JSON.stringify(values),
        },
      });
      setTimeout(() => setLoading(false), 300);
    },
  });

  const SelectModal: React.FC<{
    visible: boolean;
    options: { label: string; value: string }[];
    selectedValue: string;
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
                    textTransform: "capitalize",
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

            <Pressable onPress={() => formik.handleSubmit()} disabled={loading}>
              <Text
                className={`text-[16px] font-[500] ${loading ? "text-gray-400" : "text-[#0C4D2E]"}`}
              >
                {loading ? "..." : "Next"}
              </Text>
            </Pressable>
          </View>

          <View className="mt-[19px] mb-[32px] flex w-full flex-col items-center gap-2 rounded-[4px] bg-[#03EA8926] px-[17px] py-[21px] text-center">
            <ThemedText
              darkColor={theme.text}
              className="text-[14px] text-center text-[#0C4D2E]"
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

          <SectionCard title="Tournament Basics">
            <InputField
              required
              label="Tournament Name"
              placeholder="e.g. Victoria Island Cup"
              value={formik.values.name}
              onChangeText={formik.handleChange("name")}
              onBlur={formik.handleBlur("name")}
              errorMessage={
                formik.touched.name && formik.errors.name
                  ? formik.errors.name
                  : ""
              }
            />

            <InputField
              required
              label="Tournament Type"
              selectPicker
              placeholder="Select tournament type"
              value={getTypeLabel(formik.values.type)}
              pickerPressed={() => setShowTypeModal(true)}
              rightIcon={
                <Ionicons name="chevron-down" size={16} color="gray" />
              }
              errorMessage={
                formik.touched.type && formik.errors.type
                  ? formik.errors.type
                  : ""
              }
            />

            <InputField
              label="Description"
              placeholder="e.g. Annual VI knockout tournament"
              multiline
              value={formik.values.description}
              onChangeText={formik.handleChange("description")}
              onBlur={formik.handleBlur("description")}
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <InputField
                  required
                  label="Prize Money"
                  keyboardType="numeric"
                  placeholder="e.g. 50000000"
                  value={formik.values.prizeMoney}
                  onChangeText={formik.handleChange("prizeMoney")}
                  onBlur={formik.handleBlur("prizeMoney")}
                  errorMessage={
                    formik.touched.prizeMoney && formik.errors.prizeMoney
                      ? formik.errors.prizeMoney
                      : ""
                  }
                />
              </View>
              <View className="flex-1">
                <InputField
                  required
                  label="Registration Fee"
                  keyboardType="numeric"
                  placeholder="e.g. 200000"
                  value={formik.values.registrationFee}
                  onChangeText={formik.handleChange("registrationFee")}
                  onBlur={formik.handleBlur("registrationFee")}
                  errorMessage={
                    formik.touched.registrationFee &&
                    formik.errors.registrationFee
                      ? formik.errors.registrationFee
                      : ""
                  }
                />
              </View>
            </View>

            <InputField
              required
              label="Minutes Per Match"
              keyboardType="numeric"
              placeholder="e.g. 10"
              value={formik.values.minutesPerMatch}
              onChangeText={formik.handleChange("minutesPerMatch")}
              onBlur={formik.handleBlur("minutesPerMatch")}
              errorMessage={
                formik.touched.minutesPerMatch && formik.errors.minutesPerMatch
                  ? formik.errors.minutesPerMatch
                  : ""
              }
            />

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
                  label="Max Teams"
                  keyboardType="numeric"
                  placeholder="e.g. 8"
                  value={formik.values.maxTeams}
                  onChangeText={formik.handleChange("maxTeams")}
                  onBlur={formik.handleBlur("maxTeams")}
                  errorMessage={
                    formik.touched.maxTeams && formik.errors.maxTeams
                      ? formik.errors.maxTeams
                      : ""
                  }
                />
              </View>
            </View>
          </SectionCard>

          <View className="mt-[30px] items-center">
            <TouchableOpacity
              className="rounded-[5px] bg-[#67F095] px-[33px] py-[15px]"
              onPress={() => formik.handleSubmit()}
              disabled={loading}
            >
              <Text className="text-[14px] font-[500] text-black">Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <SelectModal
          visible={showTypeModal}
          options={tournamentTypes}
          selectedValue={formik.values.type}
          onSelect={(value) => {
            formik.setFieldValue("type", value);
            setShowTypeModal(false);
          }}
          onClose={() => setShowTypeModal(false)}
        />
        <Loader visible={loading} />
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
