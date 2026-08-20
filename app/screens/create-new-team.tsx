import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  Pressable,
  Platform,
  KeyboardAvoidingView,
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
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { createTeam } from "@/api/tournamentThunk";
import Toast from "react-native-toast-message";
import Loader from "@/components/loader";
import SectionCard from "@/components/ui/SectionCard";

export default function CreateNewTeam() {
  const { tournamentId } = useLocalSearchParams<{ tournamentId?: string }>();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [playerIdInput, setPlayerIdInput] = useState("");

  const captainId = user?._id ?? user?.id ?? "";
  const captainName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || captainId;

  const addPlayer = () => {
    const id = playerIdInput.trim();
    if (!id) return;
    if (formik.values.playerIds.includes(id)) {
      setPlayerIdInput("");
      return;
    }
    formik.setFieldValue("playerIds", [...formik.values.playerIds, id]);
    setPlayerIdInput("");
  };

  const removePlayer = (id: string) => {
    formik.setFieldValue(
      "playerIds",
      formik.values.playerIds.filter((p) => p !== id),
    );
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      teamName: "",
      logo: "",
      playerIds: [] as string[],
    },
    validationSchema: Yup.object({
      teamName: Yup.string().required("Team name is required"),
      logo: Yup.string().url("Enter a valid URL"),
    }),
    onSubmit: async (values) => {
      if (!tournamentId) return;
      const payload = {
        teamName: values.teamName,
        logo: values.logo,
        captainId,
        playerIds: values.playerIds,
      };
      console.log(payload);
      setLoading(true);
      dispatch(createTeam({ tournamentId, payload }))
        .unwrap()
        .then((response) => {
          setLoading(false);
          console.log("responseee", response);
          Toast.show({
            type: "success",
            props: {
              title: "Success",
              message:
                (response as { message?: string }).message ||
                "Team created successfully",
            },
          });
          router.replace({
            pathname: "/tournamentdetail",
            params: { tournamentId },
          });
        })
        .catch((err) => {
          setLoading(false);
          const message =
            err?.msg?.message || err?.msg || "Failed to create team";
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
              Create Team
            </ThemedText>

            <Pressable onPress={() => formik.handleSubmit()} disabled={loading}>
              <Text
                className={`text-[16px] font-[500] ${loading ? "text-gray-400" : "text-[#0C4D2E]"}`}
              >
                {loading ? "Creating..." : "Create"}
              </Text>
            </Pressable>
          </View>

          <View className="mt-[19px] mb-[32px] flex w-full flex-col items-center gap-2 rounded-[4px] bg-[#03EA8926] px-[17px] py-[21px] text-center ">
            <ThemedText
              darkColor={theme.text}
              className="text-[14px] text-center text-[#0C4D2E]"
            >
              You are officially the captain of this team!
            </ThemedText>
          </View>

          <SectionCard title="Team Details">
            <View>
              <InputField
                required
                label="Team Name"
                placeholder="e.g. Team Alpha"
                value={formik.values.teamName}
                onChangeText={formik.handleChange("teamName")}
                onBlur={formik.handleBlur("teamName")}
                errorMessage={
                  formik.touched.teamName && formik.errors.teamName
                    ? formik.errors.teamName
                    : ""
                }
              />

              <InputField
                label="Logo URL"
                autoCapitalize="none"
                keyboardType="url"
                placeholder="https://..."
                value={formik.values.logo}
                onChangeText={formik.handleChange("logo")}
                onBlur={formik.handleBlur("logo")}
                errorMessage={
                  formik.touched.logo && formik.errors.logo
                    ? formik.errors.logo
                    : ""
                }
              />

              <InputField
                label="Captain"
                editable={false}
                value={captainName}
              />

              <View className="flex-row gap-3 items-end">
                <View className="flex-1">
                  <InputField
                    label="Player ID"
                    autoCapitalize="none"
                    placeholder="e.g. 507f..."
                    value={playerIdInput}
                    onChangeText={setPlayerIdInput}
                  />
                </View>
                <TouchableOpacity
                  onPress={addPlayer}
                  className="bg-[#0C4D2E] rounded-lg px-4 py-3.5 mb-[16px]"
                >
                  <Text className="text-white text-sm font-semibold">Add</Text>
                </TouchableOpacity>
              </View>

              {formik.values.playerIds.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {formik.values.playerIds.map((id) => (
                    <View
                      key={id}
                      className="flex-row items-center bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1.5"
                    >
                      <Text className="text-xs text-gray-800 dark:text-gray-100">
                        {id}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removePlayer(id)}
                        hitSlop={10}
                        style={{ marginLeft: 4 }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color="#FF4D4F"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </SectionCard>
        </ScrollView>
        <Loader visible={loading} />
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
