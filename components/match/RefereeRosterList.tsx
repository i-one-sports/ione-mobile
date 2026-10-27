import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { RefereeEntry } from "@/components/typings/match";
import InitialsAvatar from "./InitialsAvatar";

interface Props {
  roster: RefereeEntry[];
  /** Display name for a roster entry (user, member lookup or guest name). */
  nameOf: (entry: RefereeEntry) => string;
  /** The game referees get assigned to (first unfinished game), if any. */
  currentGame: { sequence: number; referee: string | null } | null;
  /** False when this person's team plays the current game. */
  canAssign?: (entry: RefereeEntry) => boolean;
  assigning: boolean;
  onAssign: (entry: RefereeEntry) => void;
  onInviteAnother: () => void;
}

// The captain's view of the session's referee list: who's been invited, who
// accepted, and who's refereeing the current set.
export default function RefereeRosterList({
  roster,
  nameOf,
  currentGame,
  canAssign = () => true,
  assigning,
  onAssign,
  onInviteAnother,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];

  const accent = isDark ? "#00FF94" : "#00A85A";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const rowStyle = {
    backgroundColor: isDark ? "#0D1F17" : "#EDFFF8",
    borderBottomWidth: 2,
    borderBottomColor: isDark ? "#1a3d2b" : "#6BF8BD",
  };

  return (
    <View className="gap-[12px]">
      <ThemedText
        lightColor={theme.text}
        darkColor={theme.text}
        className="mx-[24px] text-[17px] font-[700]"
      >
        Referees
      </ThemedText>

      {roster.map((entry) => {
        const name = nameOf(entry);
        const first = name.split(" ")[0];
        const onCaptainPhone = entry.mode === "CAPTAIN_DEVICE";
        const isAssigned = currentGame?.referee === entry._id;

        const subtitle =
          entry.status === "INVITED"
            ? `Waiting for ${first} to accept…`
            : entry.status === "DECLINED"
              ? `${first} declined`
              : isAssigned
                ? `Refereeing Set ${currentGame?.sequence}`
                : onCaptainPhone
                  ? "Referee mode · on your phone"
                  : "Accepted · on their own phone";

        return (
          <View
            key={entry._id}
            style={rowStyle}
            className="mx-[24px] flex-row items-center justify-between gap-[12px] px-[16px] py-[13px]"
          >
            <View className="flex-1 flex-row items-center gap-[14px]">
              <InitialsAvatar name={name} />
              <View className="flex-1">
                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[15px] font-[600]"
                >
                  {name}
                </ThemedText>
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 2,
                    color: entry.status === "DECLINED" ? "#FF4444" : mutedColor,
                  }}
                >
                  {subtitle}
                </Text>
              </View>
            </View>

            {entry.status === "INVITED" && (
              <Ionicons name="hourglass-outline" size={20} color={mutedColor} />
            )}

            {entry.status === "DECLINED" && (
              <TouchableOpacity onPress={onInviteAnother}>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: accent }}
                >
                  Invite another
                </Text>
              </TouchableOpacity>
            )}

            {entry.status === "ACCEPTED" &&
              currentGame &&
              (isAssigned ? (
                <Ionicons name="checkmark-circle" size={22} color={accent} />
              ) : !canAssign(entry) ? (
                <Text style={{ fontSize: 12, color: mutedColor }}>
                  Playing Set {currentGame.sequence}
                </Text>
              ) : (
                <TouchableOpacity
                  disabled={assigning}
                  onPress={() => onAssign(entry)}
                  className="rounded-full px-[12px] py-[6px]"
                  style={{ backgroundColor: isDark ? "#0D3B26" : "#D4FFF0" }}
                >
                  {assigning ? (
                    <ActivityIndicator size="small" color={accent} />
                  ) : (
                    <Text
                      style={{ fontSize: 12, fontWeight: "700", color: accent }}
                    >
                      Assign to Set {currentGame.sequence}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        );
      })}
    </View>
  );
}
