import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";

export type TeamKey = "teamOne" | "teamTwo";

export interface GoalPlayer {
  id: string;
  /** Shirt number, when known (the API doesn't have one). */
  number?: number;
  name: string;
}

export interface GoalTeam {
  name: string;
  players: GoalPlayer[];
}

export interface RecordedGoal {
  team: TeamKey;
  scorerId: string;
  assistId: string | null;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  /** e.g. "Set 2 · Team A vs Team B · 06:32" */
  subtitle: string;
  teams: Record<TeamKey, GoalTeam>;
  onSubmit: (goal: RecordedGoal) => void;
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function RecordGoalSheet({
  isVisible,
  onClose,
  subtitle,
  teams,
  onSubmit,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  const [team, setTeam] = useState<TeamKey>("teamOne");
  const [scorerId, setScorerId] = useState<string | null>(null);
  const [assistId, setAssistId] = useState<string | null>(null);

  // Close and start fresh next time.
  const close = () => {
    setTeam("teamOne");
    setScorerId(null);
    setAssistId(null);
    onClose();
  };

  const selectTeam = (key: TeamKey) => {
    setTeam(key);
    setScorerId(null);
    setAssistId(null);
  };

  const selectScorer = (id: string) => {
    setScorerId(id);
    // A player can't assist their own goal.
    if (assistId === id) setAssistId(null);
  };

  const handleUpdate = () => {
    if (!scorerId) return;
    onSubmit({ team, scorerId, assistId });
    close();
  };

  const players = teams[team].players;
  const assistOptions = players.filter((p) => p.id !== scorerId);

  const textColor = isDark ? "#fff" : "#111";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const accent = isDark ? "#00FF94" : "#00A85A";
  const rowBg = isDark ? "#0D1F17" : "#EDFFF8";
  const rowBorder = isDark ? "#1a3d2b" : "#6BF8BD";

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        {/* Backdrop: tap outside the sheet to close */}
        <Pressable
          onPress={close}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        />

        <View
          style={{
            height: "80%",
            backgroundColor: isDark ? "#111" : "#fff",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 48,
              height: 5,
              borderRadius: 3,
              marginTop: 10,
              backgroundColor: isDark ? "#333" : "#D1D5DB",
            }}
          />
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 40 + insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText
              lightColor={textColor}
              darkColor={textColor}
              className="mt-[12px] text-center text-[22px] font-[700]"
            >
              Record Goal
            </ThemedText>
            <Text
              style={{
                color: mutedColor,
                fontSize: 13,
                textAlign: "center",
                marginTop: 6,
              }}
            >
              {subtitle}
            </Text>

            {/* Team toggle */}
            <View className="mt-[24px] flex-row gap-[10px]">
              {(Object.keys(teams) as TeamKey[]).map((key) => {
                const active = key === team;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => selectTeam(key)}
                    className="rounded-[6px] px-[16px] py-[8px]"
                    style={{
                      backgroundColor: active
                        ? "#00FF94"
                        : isDark
                          ? "#222"
                          : "#E5E7EB",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: active ? "#000" : textColor,
                      }}
                    >
                      {teams[key].name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Scorer */}
            <ThemedText
              lightColor={textColor}
              darkColor={textColor}
              className="mb-[12px] mt-[24px] text-[15px] font-[700]"
            >
              Who scored?
            </ThemedText>
            <View className="gap-[10px]">
              {players.map((player) => {
                const selected = player.id === scorerId;
                return (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => selectScorer(player.id)}
                    className="flex-row items-center justify-between px-[16px] py-[12px]"
                    style={{
                      backgroundColor: rowBg,
                      borderBottomWidth: 2,
                      borderBottomColor: rowBorder,
                      ...(selected && {
                        borderWidth: 2,
                        borderColor: accent,
                        borderRadius: 6,
                      }),
                    }}
                  >
                    <View className="flex-row items-center gap-[15px]">
                      {player.number != null && (
                        <Text
                          style={{
                            fontSize: 13,
                            color: mutedColor,
                            minWidth: 16,
                          }}
                        >
                          {player.number}
                        </Text>
                      )}
                      <View
                        className="h-[40px] w-[40px] items-center justify-center rounded-full"
                        style={{ backgroundColor: isDark ? "#1f4d37" : "#000" }}
                      >
                        <Text
                          style={{
                            color: isDark ? "#00FF94" : "#fff",
                            fontSize: 13,
                            fontWeight: "700",
                          }}
                        >
                          {initialsOf(player.name)}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 15, color: textColor }}>
                        {player.name}
                      </Text>
                    </View>
                    {selected && (
                      <Ionicons name="checkmark" size={22} color={accent} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Assist */}
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: textColor,
                marginTop: 24,
                marginBottom: 12,
              }}
            >
              Assist{" "}
              <Text style={{ fontWeight: "400", color: mutedColor }}>
                (optional)
              </Text>
            </Text>
            <View className="flex-row flex-wrap gap-[10px]">
              {[
                ...assistOptions.map((p) => ({
                  id: p.id as string | null,
                  label: p.name.split(" ")[0],
                })),
                { id: null, label: "None" },
              ].map((option) => {
                const selected = option.id === assistId;
                return (
                  <TouchableOpacity
                    key={option.id ?? "none"}
                    onPress={() => setAssistId(option.id)}
                    className="rounded-full px-[18px] py-[8px]"
                    style={{
                      borderWidth: 1.5,
                      borderColor: selected
                        ? accent
                        : isDark
                          ? "#333"
                          : "#E5E7EB",
                      backgroundColor: selected ? rowBg : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: selected ? accent : textColor,
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Actions */}
            <View className="mt-[28px] flex-row gap-[12px]">
              <View className="flex-1">
                <CustomButton
                  title="Cancel"
                  onPress={close}
                  style={{
                    borderRadius: 10,
                    paddingVertical: 16,
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
                  title="Update"
                  onPress={handleUpdate}
                  disabled={!scorerId}
                  style={{ borderRadius: 10, paddingVertical: 16 }}
                  titleStyle={{ color: "#000", fontWeight: "700" }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
