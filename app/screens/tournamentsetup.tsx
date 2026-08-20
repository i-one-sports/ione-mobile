import { Entypo, Ionicons } from "@expo/vector-icons";
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
import CustomDatePicker from "@/components/modals/CustomDatePicker";
import Loader from "@/components/loader";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import SectionCard from "@/components/ui/SectionCard";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

type SetupValues = {
  registrationDeadline: string;
  startDate: string;
  durationDays: string;
  pitches: string[];
  teamPrizes: string[];
  playerPrizes: string[];
};

/* ─── Date + time field (produces an ISO string) ─── */
function DateTimeField({
  label,
  value,
  errorMessage,
  onSelect,
  isDark,
}: {
  label: string;
  value: string;
  errorMessage?: string;
  onSelect: (iso: string) => void;
  isDark: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [dateVisible, setDateVisible] = useState(false);
  const [timeVisible, setTimeVisible] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");

  const parsed = value ? new Date(value) : null;
  const display = parsed
    ? `${parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • ${parsed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    : "";

  const openTimePicker = (d: Date) => {
    setPendingDate(d);
    setHour(String(d.getHours()).padStart(2, "0"));
    setMinute(String(d.getMinutes()).padStart(2, "0"));
    setDateVisible(false);
    setTimeVisible(true);
  };

  const saveTime = () => {
    const base = pendingDate ?? new Date();
    const d = new Date(base);
    d.setHours(Number(hour), Number(minute), 0, 0);
    onSelect(d.toISOString());
    setTimeVisible(false);
  };

  return (
    <>
      <InputField
        required
        label={label}
        selectPicker
        placeholder="Select date & time"
        value={display}
        pickerPressed={() => setDateVisible(true)}
        rightIcon={<Entypo name="chevron-down" size={14} color="#777" />}
        errorMessage={errorMessage}
      />

      <CustomDatePicker
        date={parsed ?? new Date()}
        isVisible={dateVisible}
        onClose={() => setDateVisible(false)}
        onChange={openTimePicker}
      />

      <Modal
        visible={timeVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTimeVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingBottom: insets.bottom,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#fff",
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "70%",
            }}
          >
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <ThemedText
                  lightColor="#6C757D"
                  darkColor="#9BA1A6"
                  style={{ marginBottom: 8 }}
                >
                  Hour
                </ThemedText>
                <ScrollView style={{ maxHeight: 200 }}>
                  {HOURS.map((h) => (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setHour(h)}
                      style={{
                        padding: 12,
                        backgroundColor: hour === h ? "#eee" : "transparent",
                        borderRadius: 8,
                      }}
                    >
                      <ThemedText lightColor="#6C757D" darkColor="#9BA1A6">
                        {h}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText
                  lightColor="#6C757D"
                  darkColor="#9BA1A6"
                  style={{ marginBottom: 8 }}
                >
                  Minute
                </ThemedText>
                <ScrollView style={{ maxHeight: 200 }}>
                  {MINUTES.map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setMinute(m)}
                      style={{
                        padding: 12,
                        backgroundColor: minute === m ? "#eee" : "transparent",
                        borderRadius: 8,
                      }}
                    >
                      <ThemedText lightColor="#6C757D" darkColor="#9BA1A6">
                        {m}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity
                onPress={saveTime}
                style={{
                  backgroundColor: "#00FF94",
                  padding: 14,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#000",
                  }}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ─── Add/remove list field ─── */
function ListField({
  label,
  placeholder,
  items,
  onAdd,
  onRemove,
  isDark,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  isDark: boolean;
}) {
  const [text, setText] = useState("");
  const muted = isDark ? "#9BA1A6" : "#6C757D";

  const add = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <InputField
            label={label}
            placeholder={placeholder}
            value={text}
            onChangeText={setText}
            onSubmitEditing={add}
          />
        </View>
        <TouchableOpacity
          onPress={add}
          style={{
            backgroundColor: "#00FF94",
            borderRadius: 8,
            paddingHorizontal: 18,
            paddingVertical: 15,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#000" }}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {items.map((item, i) => (
          <View
            key={`${item}-${i}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#1E2A26" : "#E8FBF2",
              borderRadius: 8,
              paddingLeft: 10,
              paddingRight: 6,
              paddingVertical: 6,
              gap: 6,
            }}
          >
            <Text
              style={{ fontSize: 12, color: isDark ? "#F5FFF2" : "#0E5617" }}
            >
              {item}
            </Text>
            <TouchableOpacity onPress={() => onRemove(i)} hitSlop={8}>
              <Ionicons name="close" size={14} color={muted} />
            </TouchableOpacity>
          </View>
        ))}
        {items.length === 0 && (
          <Text style={{ fontSize: 12, color: muted }}>None added yet</Text>
        )}
      </View>
    </View>
  );
}

export default function TournamentSetupScreen() {
  const params = useLocalSearchParams<{ locationId?: string; data?: string }>();
  const locationId = params.locationId ?? "";
  const prevData = React.useMemo(() => {
    try {
      return params.data ? JSON.parse(params.data) : {};
    } catch {
      return {};
    }
  }, [params.data]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const [loading, setLoading] = useState(false);

  const formik = useFormik<SetupValues>({
    initialValues: {
      registrationDeadline: prevData.registrationDeadline ?? "",
      startDate: prevData.startDate ?? "",
      durationDays: prevData.durationDays ?? "",
      pitches: prevData.pitches ?? [],
      teamPrizes: prevData.teamPrizes ?? [],
      playerPrizes: prevData.playerPrizes ?? [],
    },
    validationSchema: Yup.object({
      registrationDeadline: Yup.string().required(
        "Registration deadline is required",
      ),
      startDate: Yup.string().required("Start date is required"),
      durationDays: Yup.string().required("Duration is required"),
    }),
    onSubmit: (values) => {
      setLoading(true);
      router.push({
        pathname: "/screens/tournamentrules",
        params: {
          locationId,
          data: JSON.stringify({ ...prevData, ...values }),
        },
      });
      setTimeout(() => setLoading(false), 300);
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

          <SectionCard title="Schedule">
            <DateTimeField
              label="Registration Deadline"
              value={formik.values.registrationDeadline}
              isDark={isDark}
              onSelect={(iso) =>
                formik.setFieldValue("registrationDeadline", iso)
              }
              errorMessage={
                formik.touched.registrationDeadline &&
                formik.errors.registrationDeadline
                  ? formik.errors.registrationDeadline
                  : ""
              }
            />
            <DateTimeField
              label="Start Date & Time"
              value={formik.values.startDate}
              isDark={isDark}
              onSelect={(iso) => formik.setFieldValue("startDate", iso)}
              errorMessage={
                formik.touched.startDate && formik.errors.startDate
                  ? formik.errors.startDate
                  : ""
              }
            />
            <InputField
              required
              label="Duration (days)"
              keyboardType="numeric"
              placeholder="e.g. 2"
              value={formik.values.durationDays}
              onChangeText={formik.handleChange("durationDays")}
              onBlur={formik.handleBlur("durationDays")}
              errorMessage={
                formik.touched.durationDays && formik.errors.durationDays
                  ? formik.errors.durationDays
                  : ""
              }
            />
          </SectionCard>

          <SectionCard title="Pitches & Prizes">
            <ListField
              label="Pitches"
              placeholder="e.g. Royal Turf, Ikate"
              items={formik.values.pitches}
              isDark={isDark}
              onAdd={(v) =>
                formik.setFieldValue("pitches", [...formik.values.pitches, v])
              }
              onRemove={(i) =>
                formik.setFieldValue(
                  "pitches",
                  formik.values.pitches.filter((_, idx) => idx !== i),
                )
              }
            />
            <ListField
              label="Team Prizes"
              placeholder="e.g. 500,000"
              items={formik.values.teamPrizes}
              isDark={isDark}
              onAdd={(v) =>
                formik.setFieldValue("teamPrizes", [
                  ...formik.values.teamPrizes,
                  v,
                ])
              }
              onRemove={(i) =>
                formik.setFieldValue(
                  "teamPrizes",
                  formik.values.teamPrizes.filter((_, idx) => idx !== i),
                )
              }
            />
            <ListField
              label="Player Prizes"
              placeholder="e.g. Award"
              items={formik.values.playerPrizes}
              isDark={isDark}
              onAdd={(v) =>
                formik.setFieldValue("playerPrizes", [
                  ...formik.values.playerPrizes,
                  v,
                ])
              }
              onRemove={(i) =>
                formik.setFieldValue(
                  "playerPrizes",
                  formik.values.playerPrizes.filter((_, idx) => idx !== i),
                )
              }
            />
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
        <Loader visible={loading} />
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
