import { rescheduleSession } from "@/api/sessions";
import BackIcon from "@/assets/svg/BackIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import InputField from "@/components/InputField";
import Loader from "@/components/loader";
import SectionCard from "@/components/ui/SectionCard";
import TimePickerField from "@/components/TimePickerField";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import CustomButton from "@/components/ui/CustomButton";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

const toTimeOfDay = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
};

const buildStartTime = (baseIso: string | undefined, time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = baseIso ? new Date(baseIso) : new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "Date TBD";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateString?: string) => {
  if (!dateString) return "Time TBD";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function RescheduleSession() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useAppDispatch();
  const { loadingAction } = useAppSelector((state) => state.sessions);

  const params = useLocalSearchParams<{
    sessionId?: string;
    session?: string;
  }>();

  const staticSession = params.session ? JSON.parse(params.session) : null;
  const sessionId: string = params.sessionId ?? staticSession?._id ?? "";

  const { activeSession } = useAppSelector((state) => state.sessions);
  const session = activeSession ?? staticSession;

  const [startTimeOfDay, setStartTimeOfDay] = useState(() =>
    toTimeOfDay(session?.startTime),
  );
  const [timeDuration, setTimeDuration] = useState(() =>
    session?.timeDuration ? String(session.timeDuration) : "",
  );
  const [errors, setErrors] = useState<{
    startTime?: string;
    timeDuration?: string;
  }>({});

  const currentSchedule = useMemo(
    () => ({
      date: formatDate(session?.startTime),
      time: formatTime(session?.startTime),
      duration: session?.timeDuration ? `${session.timeDuration} mins` : "TBD",
    }),
    [session?.startTime, session?.timeDuration],
  );

  const validate = () => {
    const next: typeof errors = {};
    if (!startTimeOfDay) next.startTime = "Start time is required";
    if (!timeDuration) next.timeDuration = "Total minutes is required";
    else if (Number(timeDuration) <= 0 || Number.isNaN(Number(timeDuration)))
      next.timeDuration = "Enter a valid duration in minutes";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  console.log(currentSchedule, "cureenrttttt");

  const handleSubmit = () => {
    if (!sessionId || !validate()) return;

    dispatch(
      rescheduleSession({
        sessionId,
        startTime: buildStartTime(session?.startTime, startTimeOfDay),
        timeDuration: Number(timeDuration),
      }),
    )
      .unwrap()
      .then((response) => {
        Toast.show({
          type: "success",
          text1: "Session Rescheduled",
          text2: response.message,
        });
        router.back();
      })
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            err?.msg?.message || err?.msg || "Failed to reschedule session",
        });
      });
  };

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
            <TouchableOpacity onPress={() => router.back()}>
              <BackIcon />
            </TouchableOpacity>

            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[20px] font-[600]"
            >
              Reschedule Session
            </ThemedText>

            <View style={{ width: 24 }} />
          </View>

          {/* Current schedule */}
          <View className="mt-[19px] flex w-full flex-col gap-[4px] rounded-[10px] border-[1px] border-[#43B75D] bg-[#ECF8EF] p-[16px]">
            <ThemedText
              lightColor="#6C757D"
              darkColor="#9BA1A6"
              className="text-[14px] font-[600] leading-[24px]"
            >
              Current Schedule
            </ThemedText>
            <Text className="text-[11px] text-[#6D717F]">
              {currentSchedule.date} • {currentSchedule.time} •{" "}
              {currentSchedule.duration}
            </Text>
          </View>

          <View className="mt-[16px]" />

          <SectionCard title="New Schedule">
            <TimePickerField
              label="Start Time"
              value={startTimeOfDay}
              onChange={setStartTimeOfDay}
              errorMessage={errors.startTime}
            />

            <InputField
              required
              label="Total Minutes"
              keyboardType="numeric"
              placeholder="e.g. 120"
              value={timeDuration}
              onChangeText={(text) =>
                setTimeDuration(text.replace(/[^0-9]/g, ""))
              }
              errorMessage={errors.timeDuration}
            />
          </SectionCard>

          <CustomButton
            primary
            onPress={handleSubmit}
            disabled={loadingAction}
            title={loadingAction ? "Rescheduling..." : "Reschedule Session"}
          />
        </ScrollView>

        <Loader visible={loadingAction} />
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
