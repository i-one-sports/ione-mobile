import React, { useEffect, useMemo, useRef, useState } from "react";
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
  ActivityIndicator,
  Alert,
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
import {
  createSession,
  getSessionsByLocation,
  startSession,
} from "@/api/sessions";
import Toast from "react-native-toast-message";
import Loader from "@/components/loader";
import SectionCard from "@/components/ui/SectionCard";
import TimePickerField from "@/components/TimePickerField";
import CustomButton from "@/components/ui/CustomButton";

import SessionPitchPicker from "@/components/SessionPitchPicker";
import type { SessionPitch } from "@/api/pitchSearch";
import type {
  SessionByDateResponse,
  WinningDecider,
} from "@/components/typings/apiResponse";
import DayStrip, { type DayStatus } from "@/components/booking/DayStrip";
import DurationChips from "@/components/booking/DurationChips";
import StartTimeGrid from "@/components/booking/StartTimeGrid";
import DayFullNotice, {
  type Suggestion,
} from "@/components/booking/DayFullNotice";
import SlotSummaryCard from "@/components/booking/SlotSummaryCard";
import SlotTakenSheet from "@/components/booking/SlotTakenSheet";
import SeeTheDayModal from "@/components/booking/SeeTheDayModal";
import { formatKoboAsNaira } from "@/utils/currency";
import {
  formatClock,
  formatDayShort,
  formatDuration,
  formatRange,
  freeGaps,
  freeStarts,
  isValidDayKey,
  locationDayKey,
  longestGap,
  startDate,
  startTimeOptions,
  todayKey,
  toMinutes,
  upcomingDays,
} from "@/utils/pitchSlots";

type Slot = { day: string; start: number; duration: number };

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export default function NewSession() {
  const params = useLocalSearchParams();
  // Older links used locationId to carry an already-started session ID.
  const legacySessionId =
    (params.sessionId as string) || (params.locationId as string);
  const [selectedPitch, setSelectedPitch] = useState<SessionPitch | null>(
    typeof params.pitchId === "string"
      ? {
          id: params.pitchId,
          name: str(params.pitchName) ?? "Selected pitch",
          address: str(params.pitchAddress) ?? "",
          openingHour: str(params.pitchOpening),
          closingHour: str(params.pitchClosing),
          hourlyPricing: params.pitchHourly === "1",
          pricePerHour: Number(params.pitchPrice) || undefined,
        }
      : null,
  );
  const startedSession = useRef<string | null>(legacySessionId || null);
  const submitting = useRef(false);
  const [pitchError, setPitchError] = useState("");
  const [pitchLocked, setPitchLocked] = useState(!!legacySessionId);
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const accent = isDark ? "#00FF94" : "#00A85A";
  const [loading, setLoading] = useState(false);
  const [showDeciderModal, setShowDeciderModal] = useState(false);

  // ── Slot: day, length and start time ──────────────────────────────────
  const days = useMemo(() => upcomingDays(), []);
  const [step, setStep] = useState<"slot" | "details">("slot");
  const [day, setDay] = useState(
    isValidDayKey(params.date) ? (params.date as string) : todayKey(),
  );
  const wholeHours = !!selectedPitch?.hourlyPricing;
  const [duration, setDuration] = useState(120);
  const [start, setStart] = useState<number | null>(null);
  // Sessions without a known pitch (old links) pick a time by hand.
  const [manualTime, setManualTime] = useState("");
  const [seeDay, setSeeDay] = useState(false);
  const [taken, setTaken] = useState<{
    start: number;
    alternatives: number[];
  } | null>(null);

  const pitchId = selectedPitch?.id;
  const opening = selectedPitch?.openingHour;
  const closing = selectedPitch?.closingHour;

  // Hourly pitches only take whole hours.
  useEffect(() => {
    if (wholeHours && duration % 60) setDuration(Math.ceil(duration / 60) * 60);
  }, [wholeHours, duration]);

  // Load the next 14 days at this pitch, for the day dots and suggestions.
  const loadDays = () => {
    if (!pitchId) return;
    days.forEach((d) =>
      dispatch(getSessionsByLocation({ locationId: pitchId, date: d })),
    );
  };
  useEffect(loadDays, [dispatch, pitchId, days]);

  const byDay = useAppSelector((state) => state.sessions.locationSessionsByDay);
  const loadingDays = useAppSelector(
    (state) => state.sessions.loadingLocationDays,
  );
  const sessionsOn = (d: string): SessionByDateResponse[] | undefined =>
    pitchId ? byDay[locationDayKey(pitchId, d)] : undefined;

  const daySessions = sessionsOn(day);
  const dayLoading = pitchId
    ? !!loadingDays[locationDayKey(pitchId, day)]
    : false;
  const options = daySessions
    ? startTimeOptions(daySessions, day, opening, closing, duration)
    : [];
  const hasFree = options.some((o) => o.free);

  const dayStatus: Record<string, DayStatus> = {};
  for (const d of days) {
    const s = sessionsOn(d);
    if (s)
      dayStatus[d] = freeStarts(s, d, opening, closing, duration).length
        ? "free"
        : "full";
  }

  // B05 · nothing of this length fits: a shorter game, or another day.
  const suggestions: Suggestion[] = [];
  const gaps = daySessions ? freeGaps(daySessions, day, opening, closing) : [];
  const longest = longestGap(gaps);
  if (daySessions && !hasFree) {
    const unit = wholeHours ? 60 : 30;
    const shorter = longest
      ? Math.floor((longest.end - longest.start) / unit) * unit
      : 0;
    if (shorter >= unit && shorter < duration) {
      const starts = freeStarts(daySessions, day, opening, closing, shorter);
      if (starts.length)
        suggestions.push({
          key: "shorter",
          title: `${formatDuration(shorter)} on ${formatDayShort(day)}`,
          subtitle:
            starts.length === 1
              ? formatRange(starts[0], starts[0] + shorter)
              : starts.slice(0, 3).map(formatClock).join(", "),
          onPress: () => setDuration(shorter),
        });
    }
    // Nearest days first: the day after, the day before, two after...
    const i = days.indexOf(day);
    for (let k = 1; k < days.length && suggestions.length < 3; k++) {
      for (const d of [days[i + k], days[i - k]]) {
        const s = d ? sessionsOn(d) : undefined;
        if (!d || !s || suggestions.length >= 3) continue;
        const starts = freeStarts(s, d, opening, closing, duration);
        if (starts.length)
          suggestions.push({
            key: d,
            title: `${formatDuration(duration)} on ${formatDayShort(d)}`,
            subtitle: starts.slice(0, 3).map(formatClock).join(", "),
            onPress: () => setDay(d),
          });
      }
    }
  }

  const pickStart = (minute: number) => {
    setStart(minute);
    setStep("details");
  };

  // ── Details form ───────────────────────────────────────────────────────

  // The only values the API accepts; anything else returns 400.
  const winningDeciderOptions: { label: string; value: WinningDecider }[] = [
    { label: "Penalty Shootout", value: "penalties" },
    { label: "Both Teams Off", value: "both_off" },
  ];

  const getWinningDeciderLabel = (value: string) =>
    winningDeciderOptions.find((o) => o.value === value)?.label ?? value;

  type Values = {
    playersPerTeam: string;
    setNumber: string;
    winningDecider: string;
    minsPerSet: string;
  };

  // Starts (once) and configures the session for `slot`. A 409 means the
  // slot went while the captain was filling the form: offer the next free
  // times that day instead of an error.
  const submitWith = async (values: Values, slot: Slot) => {
    if (submitting.current) return;
    if (!startedSession.current && !selectedPitch) {
      setPitchError("Choose a pitch before creating your session.");
      setStep("slot");
      return;
    }
    // Hourly pitches only take whole-hour bookings (60, 120, 180, ...).
    if (selectedPitch?.hourlyPricing && slot.duration % 60 !== 0) {
      Toast.show({
        type: "error",
        props: {
          title: "Whole hours only",
          message: "This pitch is booked by the hour. Pick 1, 2, 3... hours.",
        },
      });
      setStep("slot");
      return;
    }
    submitting.current = true;
    setLoading(true);
    try {
      if (!startedSession.current && selectedPitch) {
        const started = await dispatch(
          startSession({ locationId: selectedPitch.id }),
        ).unwrap();
        if (!started?._id)
          throw new Error("The server did not return a session ID.");
        // Reuse this ID if completing the session fails and the user retries.
        startedSession.current = started._id;
        setPitchLocked(true);
      }
      const response = await dispatch(
        createSession({
          sessionId: startedSession.current!,
          data: {
            setNumber: Number(values.setNumber),
            playersPerTeam: Number(values.playersPerTeam),
            timeDuration: slot.duration,
            minsPerSet: Number(values.minsPerSet),
            startTime: startDate(slot.day, slot.start).toISOString(),
            winningDecider: values.winningDecider as WinningDecider,
          },
        }),
      ).unwrap();
      router.replace({
        pathname: "/joinsession",
        params: { sessionId: response._id || startedSession.current! },
      });
    } catch (err: any) {
      // Monthly pitch: the captain plays too, so they need a pass covering
      // the start time (402 PASS_REQUIRED). The session stays started but not
      // set up; after buying, "Create" again reuses the same session.
      if (err?.details?.code === "PASS_REQUIRED" && pitchId) {
        const pitchName = selectedPitch?.name ?? "This pitch";
        // details.pass.price is null when the pitch isn't selling passes.
        const onSale = Boolean(
          (err.details.pass as { price?: unknown } | undefined)?.price,
        );
        Alert.alert(
          "You need a monthly pass",
          onSale
            ? `${pitchName} is a monthly pitch, and you play in your own session. Buy a 30-day pass that covers this session, then create it again.`
            : `${pitchName} is a monthly pitch, and you play in your own session, but passes aren't on sale here right now.`,
          onSale
            ? [
                { text: "Not now", style: "cancel" },
                {
                  text: "Buy pass",
                  onPress: () =>
                    router.push({
                      pathname: "/payment-screens/monthly-pass",
                      params: {
                        locationId: pitchId,
                        locationName: selectedPitch?.name ?? "",
                        // M04 checks a pass bought now would cover this.
                        coverBy: startDate(slot.day, slot.start).toISOString(),
                      },
                    }),
                },
              ]
            : [{ text: "OK" }],
        );
      } else if (err?.status === 409 && pitchId) {
        let fresh: SessionByDateResponse[] = sessionsOn(slot.day) ?? [];
        try {
          fresh = await dispatch(
            getSessionsByLocation({ locationId: pitchId, date: slot.day }),
          ).unwrap();
        } catch {
          // Fall back to what was loaded before.
        }
        const free = freeStarts(
          fresh,
          slot.day,
          opening,
          closing,
          slot.duration,
        );
        setTaken({
          start: slot.start,
          alternatives: [
            ...free.filter((m) => m > slot.start),
            ...free.filter((m) => m < slot.start).reverse(),
          ].slice(0, 3),
        });
      } else {
        Toast.show({
          type: "error",
          props: {
            title: "Error",
            message:
              err?.msg?.message ||
              err?.msg ||
              err?.message ||
              "Failed to create session",
          },
        });
      }
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const formik = useFormik<Values>({
    initialValues: {
      playersPerTeam: "",
      setNumber: "",
      winningDecider: "",
      minsPerSet: "",
    },
    validationSchema: Yup.object({
      playersPerTeam: Yup.string().required("Players per team is required"),
      setNumber: Yup.string().required("Number of teams is required"),
      winningDecider: Yup.string()
        .oneOf(["penalties", "both_off"], "Choose how a draw is settled")
        .required("Winning decider is required"),
      minsPerSet: Yup.string().required("Minutes per set is required"),
    }),
    onSubmit: async (values) => {
      if (start == null) {
        setStep("slot");
        return;
      }
      await submitWith(values, { day, start, duration });
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

  const pitchMeta = [
    selectedPitch?.openingHour && selectedPitch?.closingHour
      ? `Open ${formatClock(toMinutes(selectedPitch.openingHour)!)} – ${formatClock(
          toMinutes(selectedPitch.closingHour)!,
        )}`
      : null,
    selectedPitch?.hourlyPricing && selectedPitch.pricePerHour
      ? `${formatKoboAsNaira(selectedPitch.pricePerHour)}/hr`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const pitchSection = (
    <SectionCard title="Session Pitch">
      {pitchLocked || step === "details" ? (
        <View>
          <ThemedText>
            {selectedPitch?.name || "Pitch linked to this session"}
          </ThemedText>
          {!!selectedPitch?.address && (
            <ThemedText className="mt-1 text-xs">
              {selectedPitch.address}
            </ThemedText>
          )}
        </View>
      ) : (
        <SessionPitchPicker
          value={selectedPitch}
          onChange={(pitch) => {
            setSelectedPitch(pitch);
            setPitchError("");
            setStart(null);
          }}
        />
      )}
      {!!pitchMeta && (
        <Text style={{ color: mutedColor, fontSize: 12, marginTop: 6 }}>
          {pitchMeta}
        </Text>
      )}
      {!!pitchError && (
        <Text accessibilityRole="alert" className="text-xs text-red-600">
          {pitchError}
        </Text>
      )}
    </SectionCard>
  );

  // B01 / B05 · pick day, length and start time.
  const slotStep = (
    <View style={{ gap: 24 }}>
      <DayStrip
        days={days}
        selected={day}
        onSelect={(d) => {
          setDay(d);
          setStart(null);
        }}
        status={pitchId ? dayStatus : undefined}
      />
      <DurationChips
        value={duration}
        onChange={(m) => {
          setDuration(m);
          setStart(null);
        }}
        wholeHours={wholeHours}
      />

      {!pitchId ? (
        // No pitch to check bookings against (older links): pick by hand.
        <View style={{ gap: 12 }}>
          {!pitchLocked ? (
            <Text style={{ color: mutedColor, fontSize: 13 }}>
              Choose a pitch above to see its free times.
            </Text>
          ) : (
            <>
              <TimePickerField
                label="Start Time"
                value={manualTime}
                onChange={setManualTime}
              />
              <CustomButton
                primary
                title="Continue"
                disabled={!manualTime}
                onPress={() => {
                  const m = toMinutes(manualTime);
                  if (m != null) pickStart(m);
                }}
                style={{ borderRadius: 10, paddingVertical: 16 }}
                titleStyle={{ color: "#000", fontWeight: "700" }}
              />
            </>
          )}
        </View>
      ) : !daySessions ? (
        dayLoading ? (
          <ActivityIndicator color={accent} style={{ paddingVertical: 24 }} />
        ) : (
          <View style={{ alignItems: "center", gap: 10, paddingVertical: 16 }}>
            <Text style={{ color: mutedColor, fontSize: 13 }}>
              {"Couldn't load this pitch's bookings."}
            </Text>
            <TouchableOpacity onPress={loadDays} hitSlop={8}>
              <Text style={{ color: accent, fontWeight: "700" }}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        )
      ) : hasFree ? (
        <>
          <StartTimeGrid
            day={day}
            duration={duration}
            options={options}
            selected={start}
            onPick={pickStart}
          />
          <TouchableOpacity
            onPress={() => setSeeDay(true)}
            accessibilityRole="button"
            style={{
              paddingVertical: 16,
              borderRadius: 10,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: accent,
            }}
          >
            <Text style={{ color: accent, fontSize: 16, fontWeight: "600" }}>
              See the day
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <DayFullNotice
          day={day}
          duration={duration}
          longest={longest}
          suggestions={suggestions}
        />
      )}
    </View>
  );

  // B03 · the chosen slot, then the session details.
  const detailsStep = start != null && (
    <View style={{ gap: 20 }}>
      <SlotSummaryCard
        day={day}
        start={start}
        duration={duration}
        pricePerHour={
          selectedPitch?.hourlyPricing ? selectedPitch.pricePerHour : undefined
        }
        onChange={() => setStep("slot")}
      />

      <View>
        <Text
          style={{
            color: theme.text,
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Session details
        </Text>
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
                formik.touched.playersPerTeam && formik.errors.playersPerTeam
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

        <View className="flex-row gap-3">
          <View className="flex-1">
            <InputField
              required
              label="Minutes Per Set"
              keyboardType="numeric"
              placeholder="e.g. 10"
              value={formik.values.minsPerSet}
              onChangeText={formik.handleChange("minsPerSet")}
              onBlur={formik.handleBlur("minsPerSet")}
              errorMessage={
                formik.touched.minsPerSet && formik.errors.minsPerSet
                  ? formik.errors.minsPerSet
                  : ""
              }
            />
          </View>
          <View className="flex-1">
            <InputField
              required
              label="Draw Decided By"
              selectPicker
              placeholder="Select"
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
        </View>

        <Text style={{ color: mutedColor, fontSize: 12, lineHeight: 17 }}>
          {"The time isn't booked until you create the session. If someone " +
            "else books it first, we'll show you the next free times."}
        </Text>
      </View>

      <CustomButton
        primary
        title={loading ? "Creating..." : "Create session"}
        disabled={loading}
        onPress={() => formik.handleSubmit()}
        style={{ borderRadius: 10, paddingVertical: 18 }}
        titleStyle={{ color: "#000", fontWeight: "700" }}
      />
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 40,
            paddingHorizontal: 24,
            flexGrow: 1,
          }}
        >
          <View className="mb-[20px] flex flex-row items-center justify-between">
            <Pressable
              onPress={() =>
                step === "details" ? setStep("slot") : router.back()
              }
              hitSlop={10}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>

            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[20px] font-[600] text-black"
            >
              New Session
            </ThemedText>

            <View style={{ width: 24 }} />
          </View>

          {step === "slot" && (
            <View className="mb-[20px] flex w-full flex-col items-center gap-2 rounded-[4px] bg-[#03EA8926] px-[17px] py-[16px] text-center ">
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
                Team Names Will Be Assigned Randomly
              </ThemedText>
            </View>
          )}

          {pitchSection}

          {step === "slot" ? slotStep : detailsStep}
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

        {!!pitchId && (
          <SeeTheDayModal
            visible={seeDay}
            locationId={pitchId}
            pitchName={selectedPitch?.name ?? "Pitch"}
            day={day}
            duration={duration}
            sessions={daySessions ?? []}
            openingHour={opening}
            closingHour={closing}
            pricePerHour={
              selectedPitch?.hourlyPricing
                ? selectedPitch.pricePerHour
                : undefined
            }
            step={wholeHours ? 60 : 30}
            initialStart={start}
            onBook={(m) => {
              setSeeDay(false);
              pickStart(m);
            }}
            onClose={() => setSeeDay(false)}
          />
        )}

        <SlotTakenSheet
          visible={!!taken}
          day={day}
          takenStart={taken?.start ?? 0}
          duration={duration}
          alternatives={taken?.alternatives ?? []}
          onBook={(m) => {
            setTaken(null);
            setStart(m);
            submitWith(formik.values, { day, start: m, duration });
          }}
          onOtherDays={() => {
            setTaken(null);
            setStart(null);
            setStep("slot");
          }}
          onClose={() => setTaken(null)}
        />

        <Loader visible={loading} />
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
