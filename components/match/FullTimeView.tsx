import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import InitialsAvatar from "./InitialsAvatar";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import Polygon from "@/components/Polygon";
import { Colors } from "@/constants/Colors";
import Scoreboard, { ScoreboardTeam } from "./Scoreboard";

/** The outgoing referee picks who takes the whistle for the next set. */
export interface HandOver {
  nextSetNumber: number;
  /** Accepted people on the referee list who aren't playing the next set. */
  options: { id: string; name: string; team?: string }[];
  onPick: (refereeId: string) => void;
  assigning: boolean;
  /** Set once someone has been picked. */
  assignedName?: string | null;
}

/** A team in the next game, captioned e.g. "Stays on" / "Comes on". */
export interface NextTeam {
  code: string;
  name: string;
  caption: string;
}

export interface PlayerTally {
  name: string;
  goals: number;
  assists: number;
}

export interface QueueChange {
  /** "team" shows the team's polygon, "whistle" shows a whistle icon. */
  kind: "team" | "whistle";
  teamCode?: string;
  text: string;
}

interface Props {
  teamOne: ScoreboardTeam;
  teamTwo: ScoreboardTeam;
  clock: string;
  winner: "teamOne" | "teamTwo" | null;
  /** Goals and assists for this set, one entry per player. */
  tallies: PlayerTally[];
  nextSetNumber?: number;
  /**
   * null when there's no next game (the session's time is up); leave it out
   * to hide the section (a past set opened from "Sets played").
   */
  upNext?: {
    teamOne: NextTeam;
    teamTwo: NextTeam;
    /** The same two teams play again. */
    rematch?: boolean;
  } | null;
  queueChanges: QueueChange[];
  /** Leave both out for a read-only result (e.g. from "Sets played"). */
  onViewResult?: () => void;
  onStartNextSet?: () => void;
  handOver?: HandOver | null;
}

// What the referee sees after ending a set: result, who's next, queue moves.
export default function FullTimeView({
  teamOne,
  teamTwo,
  clock,
  winner,
  tallies,
  nextSetNumber,
  upNext,
  queueChanges,
  onViewResult,
  onStartNextSet,
  handOver,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];

  const accent = isDark ? "#00FF94" : "#00A85A";
  const chipBg = isDark ? "#0D3B26" : "#D4FFF0";
  const rowStyle = {
    marginHorizontal: 31,
    backgroundColor: isDark ? "#0D1F17" : "#EDFFF8",
    borderBottomWidth: 2,
    borderBottomColor: isDark ? "#1a3d2b" : "#6BF8BD",
  };

  // One chip per goal-scorer and one per assister, like "⚽ Chidi 2".
  const chips = tallies.flatMap((t) => {
    const first = t.name.split(" ")[0];
    return [
      ...(t.goals > 0
        ? [
            {
              key: `${t.name}-g`,
              icon: "soccer" as const,
              label: `${first} ${t.goals}`,
            },
          ]
        : []),
      ...(t.assists > 0
        ? [
            {
              key: `${t.name}-a`,
              icon: "shoe-sneaker" as const,
              label: `${first} ${t.assists}`,
            },
          ]
        : []),
    ];
  });

  const renderNextTeam = (
    team: { code: string; name: string },
    caption: string,
  ) => (
    <View className="flex-1 items-center gap-[8px]">
      <Polygon teamCode={team.code} size={52} />
      <ThemedText
        lightColor={theme.text}
        darkColor={theme.text}
        className="text-[15px]"
      >
        {team.name}
      </ThemedText>
      <Text style={{ fontSize: 13, fontWeight: "700", color: accent }}>
        {caption}
      </Text>
    </View>
  );

  return (
    <View className="flex flex-col gap-[28px]">
      <View className="mx-[24px] gap-[20px]">
        <Scoreboard
          teamOne={teamOne}
          teamTwo={teamTwo}
          clock={clock}
          winner={winner}
        />

        {chips.length > 0 && (
          <View className="flex-row flex-wrap justify-center gap-[10px]">
            {chips.map((chip) => (
              <View
                key={chip.key}
                className="flex-row items-center gap-[6px] rounded-full px-[14px] py-[6px]"
                style={{ backgroundColor: chipBg }}
              >
                <MaterialCommunityIcons
                  name={chip.icon}
                  size={16}
                  color={accent}
                />
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: accent }}
                >
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Up next */}
      {upNext === undefined ? null : upNext ? (
        <View className="gap-[12px]">
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="mx-[31px] text-[17px] font-[700]"
          >
            Up Next · Set {nextSetNumber}
            {upNext.rematch ? " · Rematch" : ""}
          </ThemedText>
          <View
            style={rowStyle}
            className="flex-row items-center px-[16px] py-[20px]"
          >
            {renderNextTeam(upNext.teamOne, upNext.teamOne.caption)}
            <Text style={{ fontSize: 14, color: "#6D717F" }}>vs</Text>
            {renderNextTeam(upNext.teamTwo, upNext.teamTwo.caption)}
          </View>
        </View>
      ) : (
        <ThemedText
          lightColor="#6D717F"
          darkColor="#9BA1A6"
          className="mx-[31px] text-center text-[14px]"
        >
          {"That was the last set — the session's time is up."}
        </ThemedText>
      )}

      {/* Queue changes */}
      {queueChanges.length > 0 && (
        <View className="gap-[12px]">
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="mx-[31px] text-[17px] font-[700]"
          >
            Queue changes
          </ThemedText>
          {queueChanges.map((change) => (
            <View
              key={change.text}
              style={rowStyle}
              className="flex-row items-center gap-[14px] px-[16px] py-[16px]"
            >
              {change.kind === "team" && change.teamCode ? (
                <Polygon teamCode={change.teamCode} size={36} />
              ) : (
                <MaterialCommunityIcons
                  name="whistle-outline"
                  size={24}
                  color={theme.text}
                />
              )}
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="flex-1 text-[15px]"
              >
                {change.text}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Hand the whistle: the referee's team plays next, so someone else takes over */}
      {handOver && (
        <View className="gap-[12px]">
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="mx-[31px] text-[17px] font-[700]"
          >
            Hand the whistle
          </ThemedText>
          {handOver.assignedName ? (
            <View
              style={rowStyle}
              className="flex-row items-center gap-[14px] px-[16px] py-[16px]"
            >
              <Ionicons name="checkmark-circle" size={22} color={accent} />
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="flex-1 text-[15px]"
              >
                {handOver.assignedName} referees Set {handOver.nextSetNumber}
              </ThemedText>
            </View>
          ) : handOver.options.length === 0 ? (
            <Text
              style={{
                marginHorizontal: 31,
                fontSize: 13,
                lineHeight: 19,
                color: isDark ? "#9BA1A6" : "#6D717F",
              }}
            >
              No one on the referee list is free for Set{" "}
              {handOver.nextSetNumber}. Your captain can invite someone, or the
              set can be played without a referee.
            </Text>
          ) : (
            <>
              <Text
                style={{
                  marginHorizontal: 31,
                  fontSize: 13,
                  color: isDark ? "#9BA1A6" : "#6D717F",
                }}
              >
                Your team plays next — pick who referees Set{" "}
                {handOver.nextSetNumber}
              </Text>
              {handOver.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  disabled={handOver.assigning}
                  onPress={() => handOver.onPick(option.id)}
                  style={rowStyle}
                  className="flex-row items-center gap-[14px] px-[16px] py-[13px]"
                >
                  <InitialsAvatar name={option.name} />
                  <View className="flex-1">
                    <ThemedText
                      lightColor={theme.text}
                      darkColor={theme.text}
                      className="text-[15px] font-[600]"
                    >
                      {option.name}
                    </ThemedText>
                    {!!option.team && (
                      <Text style={{ fontSize: 12, color: "#6D717F" }}>
                        {option.team}
                      </Text>
                    )}
                  </View>
                  {handOver.assigning ? (
                    <ActivityIndicator size="small" color={accent} />
                  ) : (
                    <MaterialCommunityIcons
                      name="whistle-outline"
                      size={20}
                      color={accent}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      )}

      {(onViewResult || onStartNextSet) && (
        <View className="mx-[31px] flex-row gap-[12px]">
          {onViewResult && (
            <View className="flex-1">
              <CustomButton
                title="View Result"
                onPress={onViewResult}
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
          )}
          {onStartNextSet && (
            <View className="flex-1">
              <CustomButton
                primary
                title={`Start Set ${nextSetNumber}`}
                onPress={onStartNextSet}
                style={{ borderRadius: 10, paddingVertical: 18 }}
                titleStyle={{ color: "#000", fontWeight: "700" }}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
