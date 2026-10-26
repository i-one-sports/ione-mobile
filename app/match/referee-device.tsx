import { assignReferee } from "@/api/matchesThunk";
import { startRefereeMode } from "@/api/refereesThunk";
import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

export default function RefereeDevice() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useAppDispatch();

  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { activeSession } = useAppSelector((state) => state.sessions);
  const { matchups } = useAppSelector((state) => state.matches);
  const { loadingRefereeAction } = useAppSelector((state) => state.referees);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const accent = isDark ? "#00FF94" : "#00A85A";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const firstName = name.trim().split(" ")[0] || "the referee";

  // The game the referee takes over: the first one that hasn't finished.
  const currentGame = matchups.find((game) => game.status !== "FINISHED");

  const handleStart = async () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Enter the referee's full name";
    if (phone.replace(/\D/g, "").length < 10)
      next.phone = "Enter a valid Nigerian phone number";
    setErrors(next);
    if (!sessionId || Object.keys(next).length > 0) return;

    try {
      const entry = await dispatch(
        startRefereeMode({
          sessionId,
          guestName: name.trim(),
          guestPhone: phone.trim(),
        }),
      ).unwrap();

      // Referee mode is accepted straight away, so put them on the current set.
      if (currentGame) {
        await dispatch(
          assignReferee({ matchId: currentGame._id, refereeId: entry._id }),
        )
          .unwrap()
          .catch((err) =>
            Toast.show({
              type: "error",
              text1: `Couldn't assign ${firstName} to Set ${currentGame.sequence}`,
              text2: err?.msg,
            }),
          );
      }

      Toast.show({
        type: "success",
        text1: "Referee mode is on",
        text2: `Hand your phone to ${firstName}`,
      });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Couldn't start Referee mode",
        text2: err?.msg,
      });
    }
  };

  const sessionLine = [
    activeSession?.location?.name,
    activeSession?.startTime
      ? new Date(activeSession.startTime).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <SafeAreaScreen>
      <ScrollView
        className="flex-1 py-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}
      >
        <View className="mx-[24px] gap-[24px]">
          {/* Header */}
          <View>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={isDark ? "#fff" : "#111"}
                />
              </TouchableOpacity>
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[20px] font-[600]"
              >
                Referee on Your Phone
              </ThemedText>
              <View style={{ width: 22 }} />
            </View>
            {!!sessionLine && (
              <Text
                style={{
                  color: mutedColor,
                  fontSize: 13,
                  textAlign: "center",
                  marginTop: 6,
                  lineHeight: 19,
                }}
              >
                {sessionLine}
              </Text>
            )}
          </View>

          <View className="items-center gap-[14px]">
            <View
              className="h-[96px] w-[96px] items-center justify-center rounded-full"
              style={{ backgroundColor: isDark ? "#0D3B26" : "#D4FFF0" }}
            >
              <Ionicons name="swap-horizontal" size={40} color={accent} />
            </View>
            <Text
              style={{
                color: mutedColor,
                fontSize: 15,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Tell us who&apos;s refereeing, then hand them your phone.
            </Text>
          </View>

          <View className="gap-[16px]">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[17px] font-[700]"
            >
              Referee details
            </ThemedText>
            <InputField
              label="Full name"
              placeholder="e.g. Tola Adebayo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              errorMessage={errors.name}
            />
            <InputField
              label="Phone number"
              placeholder="+234 803 412 7788"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              errorMessage={errors.phone}
            />
            <Text style={{ color: mutedColor, fontSize: 13, lineHeight: 19 }}>
              If this number has an i-One account, the sessions are added to
              their referee history.
            </Text>
          </View>

          <View
            className="gap-[6px] rounded-[12px] p-[16px]"
            style={{ backgroundColor: isDark ? "#0D1F17" : "#EDFFF8" }}
          >
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="mb-[4px] text-[15px] font-[700]"
            >
              In Referee mode
            </ThemedText>
            {[
              "Only the set clock, score and goal scorer screens open",
              `Results are saved under ${firstName}'s name`,
              "It ends when the session ends",
            ].map((line) => (
              <Text
                key={line}
                style={{ color: mutedColor, fontSize: 13, lineHeight: 19 }}
              >
                · {line}
              </Text>
            ))}
          </View>

          <View className="flex-row gap-[12px]">
            <View className="flex-1">
              <CustomButton
                title="Back"
                onPress={() => router.back()}
                style={{
                  borderRadius: 10,
                  paddingVertical: 18,
                  borderWidth: 1.5,
                  borderColor: accent,
                  backgroundColor: "transparent",
                }}
                titleStyle={{ color: accent }}
              />
            </View>
            <View className="flex-1">
              <CustomButton
                primary
                title="Start Referee Mode"
                onPress={handleStart}
                loading={loadingRefereeAction}
                disabled={loadingRefereeAction}
                style={{ borderRadius: 10, paddingVertical: 18 }}
                titleStyle={{ color: "#000", fontWeight: "700" }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
