import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Colors } from "@/constants/Colors";
import Scoreboard, { ScoreboardTeam } from "./Scoreboard";
import { TeamKey } from "./RecordGoalSheet";

interface Props {
  teamOne: ScoreboardTeam;
  teamTwo: ScoreboardTeam;
  clock: string;
  onChangeScore: (team: TeamKey, delta: number) => void;
  onRecordGoal: () => void;
  onCancel: () => void;
  onEndSet: () => void;
  /** The game hasn't kicked off yet: controls are locked until onKickOff. */
  scheduled?: boolean;
  setNumber?: number;
  onKickOff?: () => void;
  /** Kick off / End Set is in flight. Score taps queue instead of waiting. */
  busy?: boolean;
  /** Taps saved on the phone and not confirmed by the server yet. */
  pendingTaps?: {
    id: string;
    label: string;
    state: "sending" | "queued" | "offline";
  }[];
  /** False with no referee: the API rejects goal scorers, only the score counts. */
  canRecordScorers?: boolean;
  /** The set clock is local to this phone (the API has no clock). */
  clockPaused?: boolean;
  onToggleClock?: () => void;
  onAddMinute?: () => void;
  onResetClock?: () => void;
}

// The referee's controls while a set is being played.
export default function LiveSetView({
  teamOne,
  teamTwo,
  clock,
  onChangeScore,
  onRecordGoal,
  onCancel,
  onEndSet,
  scheduled = false,
  setNumber,
  onKickOff,
  busy = false,
  pendingTaps = [],
  canRecordScorers = true,
  clockPaused = false,
  onToggleClock,
  onAddMinute,
  onResetClock,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];

  const cardBg = isDark ? "#0D1F17" : "#EDFFF8";
  const accentText = isDark ? "#00FF94" : "#00A85A";
  const stepperBg = isDark ? "#00FF94" : "#111";
  const stepperIcon = isDark ? "#000" : "#fff";
  const outlineButtonStyle = {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: accentText,
    backgroundColor: isDark ? "#000" : "#fff",
  };

  const teams = { teamOne, teamTwo };

  return (
    <View className="flex flex-col gap-[31px]">
      <View className="mx-[24px] gap-[32px]">
        <View
          style={{ backgroundColor: cardBg }}
          className="mx-auto flex flex-row items-center gap-[8px] rounded-full px-[18px] py-[10px]"
        >
          <MaterialCommunityIcons
            name="whistle-outline"
            size={18}
            color={theme.text}
          />
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="text-[14px] font-semibold"
          >
            {"You're officiating"}
          </ThemedText>
        </View>

        <Scoreboard teamOne={teamOne} teamTwo={teamTwo} clock={clock} />
      </View>

      {/* Set clock — handlers are placeholders until the match API is wired in */}
      <View
        className="mx-[31px] gap-[14px] rounded-[12px] p-[16px]"
        style={{ backgroundColor: cardBg }}
      >
        <ThemedText
          lightColor="#6D717F"
          darkColor="#9BA1A6"
          className="text-[14px] font-[500]"
        >
          Set clock
        </ThemedText>
        <View className="flex-row gap-[10px]">
          {[
            { label: clockPaused ? "Resume" : "Pause", onPress: onToggleClock },
            { label: "+1 min", onPress: onAddMinute },
            { label: "Reset", onPress: onResetClock },
          ].map(({ label, onPress }) => (
            <View key={label} className="flex-1">
              <CustomButton
                title={label}
                onPress={onPress}
                disabled={scheduled}
                style={outlineButtonStyle}
                titleStyle={{ color: accentText, fontSize: 15 }}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Score */}
      <View
        className="mx-[31px] gap-[14px] rounded-[12px] p-[16px]"
        style={{ backgroundColor: cardBg }}
      >
        <ThemedText
          lightColor="#6D717F"
          darkColor="#9BA1A6"
          className="text-[14px] font-[500]"
        >
          Score
        </ThemedText>
        <View className="flex-row justify-around">
          {(["teamOne", "teamTwo"] as const).map((key) => (
            <View key={key} className="items-center gap-[12px]">
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[15px] font-[500]"
              >
                {teams[key].name}
              </ThemedText>
              <View className="flex-row items-center gap-[10px]">
                <TouchableOpacity
                  onPress={() => onChangeScore(key, -1)}
                  disabled={scheduled}
                  className="h-[34px] w-[34px] items-center justify-center rounded-[6px]"
                  style={{
                    backgroundColor: stepperBg,
                    opacity: scheduled ? 0.4 : 1,
                  }}
                >
                  <Ionicons name="remove" size={20} color={stepperIcon} />
                </TouchableOpacity>
                <View
                  className="h-[40px] w-[44px] items-center justify-center rounded-[6px] border"
                  style={{
                    backgroundColor: isDark ? "#000" : "#fff",
                    borderColor: isDark ? "#1a3d2b" : "#E5E7EB",
                  }}
                >
                  <ThemedText
                    lightColor={theme.text}
                    darkColor={theme.text}
                    className="text-[18px] font-[700]"
                  >
                    {teams[key].score}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() => onChangeScore(key, 1)}
                  disabled={scheduled}
                  className="h-[34px] w-[34px] items-center justify-center rounded-[6px]"
                  style={{
                    backgroundColor: stepperBg,
                    opacity: scheduled ? 0.4 : 1,
                  }}
                >
                  <Ionicons name="add" size={20} color={stepperIcon} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Taps on their way to the server, so nobody taps twice. */}
      {pendingTaps.length > 0 && (
        <View className="mx-[31px] gap-[8px]">
          {pendingTaps.map((tap) => (
            <View
              key={tap.id}
              className="flex-row items-center justify-between rounded-[8px] px-[14px] py-[10px]"
              style={{ backgroundColor: cardBg }}
            >
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="flex-1 text-[14px]"
              >
                {tap.label}
              </ThemedText>
              <View className="flex-row items-center gap-[6px]">
                {tap.state === "sending" && (
                  <ActivityIndicator size="small" color={accentText} />
                )}
                {tap.state === "offline" && (
                  <Ionicons
                    name="cloud-offline-outline"
                    size={16}
                    color="#FFB800"
                  />
                )}
                <Text
                  style={{
                    fontSize: 12,
                    color: tap.state === "offline" ? "#FFB800" : "#6D717F",
                  }}
                >
                  {tap.state === "sending"
                    ? "sending…"
                    : tap.state === "offline"
                      ? "waiting for signal"
                      : "queued"}
                </Text>
              </View>
            </View>
          ))}
          <Text style={{ fontSize: 12, color: "#6D717F", textAlign: "center" }}>
            Saved on this phone — they&apos;ll send even if the app closes.
          </Text>
        </View>
      )}

      {/* Before kick-off: one button. The game is SCHEDULED until started. */}
      {scheduled ? (
        <View className="mx-[31px] gap-[12px]">
          <CustomButton
            primary
            title={setNumber ? `Kick off Set ${setNumber}` : "Kick off"}
            onPress={onKickOff}
            loading={busy}
            disabled={busy}
            style={{ borderRadius: 10, paddingVertical: 18 }}
            titleStyle={{ color: "#000", fontWeight: "700" }}
          />
          <ThemedText
            lightColor="#6D717F"
            darkColor="#9BA1A6"
            className="text-center text-[13px] leading-[19px]"
          >
            The clock and score open once you kick off.
          </ThemedText>
        </View>
      ) : (
        <View className="mx-[31px] gap-[12px]">
          {canRecordScorers ? (
            <CustomButton
              title="Record Goal Scorer"
              onPress={onRecordGoal}
              style={{
                backgroundColor: cardBg,
                borderWidth: 0,
                borderRadius: 10,
                paddingVertical: 18,
              }}
              titleStyle={{
                color: isDark ? "#00FF94" : "#00804A",
                fontWeight: "700",
              }}
            />
          ) : (
            <ThemedText
              lightColor="#6D717F"
              darkColor="#9BA1A6"
              className="text-center text-[13px] leading-[19px]"
            >
              No referee for this set — only the score is kept, and it
              won&apos;t count toward stats.
            </ThemedText>
          )}

          <View className="flex-row gap-[12px]">
            <View className="flex-1">
              <CustomButton
                title="Cancel"
                onPress={onCancel}
                style={{
                  borderRadius: 10,
                  paddingVertical: 18,
                  borderWidth: 1.5,
                  borderColor: accentText,
                  backgroundColor: "transparent",
                }}
                titleStyle={{ color: accentText }}
              />
            </View>
            <View className="flex-1">
              <CustomButton
                primary
                title="End Set"
                onPress={onEndSet}
                loading={busy}
                // The end goes only once every queued goal has landed.
                disabled={busy || pendingTaps.length > 0}
                style={{ borderRadius: 10, paddingVertical: 18 }}
                titleStyle={{ color: "#000", fontWeight: "700" }}
              />
            </View>
          </View>

          <ThemedText
            lightColor="#6D717F"
            darkColor="#9BA1A6"
            className="text-center text-[13px] leading-[19px]"
          >
            Ending the set saves the result and brings on the next team in the
            queue.
          </ThemedText>
        </View>
      )}
    </View>
  );
}
