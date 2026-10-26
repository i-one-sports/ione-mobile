import {
  confirmMatchResult,
  disputeMatchResult,
  getMatch,
} from "@/api/matchesThunk";
import { getReferees } from "@/api/refereesThunk";
import { getSession, getSessionSets } from "@/api/sessions";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import Scoreboard from "@/components/match/Scoreboard";
import { Match, TeamKey } from "@/components/typings/match";
import CustomButton from "@/components/ui/CustomButton";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { reviewInfo } from "@/utils/matchReview";
import { teamPlayerIds } from "@/utils/teamPlayers";
import { formatShort } from "@/utils/vote";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

const idOf = (value: { _id: string } | string | undefined | null) =>
  typeof value === "string" ? value : value?._id;

const personName = (p?: {
  firstName?: string;
  lastName?: string;
  nickname?: string;
}) =>
  p
    ? `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() ||
      p.nickname ||
      "Player"
    : "Player";

/** "Team A" → "TA", "Team 1" → "T1" */
const teamCode = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Confirm or dispute a result recorded in Referee mode on a captain's phone.
// It already counts; a dispute takes everyone's stats from it back out.
export default function ResultReview() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useAppDispatch();

  const { sessionId, matchId } = useLocalSearchParams<{
    sessionId?: string;
    matchId?: string;
  }>();
  const { user } = useAppSelector((state) => state.auth);
  const { activeSession, sets } = useAppSelector((state) => state.sessions);
  const { currentMatch, loadingMatch, loadingMatchAction } = useAppSelector(
    (state) => state.matches,
  );
  const { roster } = useAppSelector((state) => state.referees);
  const [refreshing, setRefreshing] = useState(false);

  const accent = isDark ? "#00FF94" : "#00A85A";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const rowStyle = {
    backgroundColor: isDark ? "#0D1F17" : "#EDFFF8",
    borderBottomWidth: 2,
    borderBottomColor: isDark ? "#1a3d2b" : "#6BF8BD",
  };

  const loadAll = useCallback(async () => {
    if (!matchId) return;
    await Promise.all([
      dispatch(getMatch(matchId)),
      ...(sessionId
        ? [
            dispatch(getSession(sessionId)),
            dispatch(getSessionSets({ sessionId })),
            dispatch(getReferees(sessionId)),
          ]
        : []),
    ]);
  }, [dispatch, matchId, sessionId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const match = currentMatch?._id === matchId ? currentMatch : null;
  const members: any[] = useMemo(
    () =>
      activeSession?._id === sessionId ? (activeSession?.members ?? []) : [],
    [activeSession, sessionId],
  );

  const playerNames = useMemo(() => {
    const names: Record<string, string> = {};
    sets.forEach((set) =>
      set.players.forEach((p: any) => {
        if (typeof p === "object") names[p._id] = personName(p);
      }),
    );
    [match?.teamOne, match?.teamTwo].forEach((team) => {
      if (team && typeof team === "object")
        team.players.forEach((p) => (names[p._id] = personName(p)));
    });
    members.forEach((m) => (names[m._id] = names[m._id] ?? personName(m)));
    return names;
  }, [sets, match, members]);

  const teamName = (team: Match["teamOne"] | undefined) =>
    typeof team === "object"
      ? team.name
      : (sets.find((set) => set._id === team)?.name ?? "Team");
  const playersOf = (team: Match["teamOne"]) => teamPlayerIds(team, sets);

  const { pending, canRespond, refereeEntry, deviceOwner } = reviewInfo(
    match,
    roster,
    playersOf,
    user?._id,
  );

  const handleConfirm = () => {
    if (!match) return;
    dispatch(confirmMatchResult(match._id))
      .unwrap()
      .then(() =>
        Toast.show({
          type: "success",
          text1: "Result confirmed",
          text2: `Set ${match.sequence} counts for everyone's stats`,
        }),
      )
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Couldn't confirm",
          text2: err?.msg,
        });
        dispatch(getMatch(match._id));
      });
  };

  const handleDispute = () => {
    if (!match) return;
    Alert.alert(
      "Dispute this result?",
      "Everyone's goals, assists and wins from this set are taken out until it's reviewed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Dispute",
          style: "destructive",
          onPress: () =>
            dispatch(disputeMatchResult(match._id))
              .unwrap()
              .then(() =>
                Toast.show({
                  type: "info",
                  text1: "Result disputed",
                  text2: "Stats from this set are on hold",
                }),
              )
              .catch((err) => {
                Toast.show({
                  type: "error",
                  text1: "Couldn't dispute",
                  text2: err?.msg,
                });
                dispatch(getMatch(match._id));
              }),
        },
      ],
    );
  };

  const leave = () =>
    router.canGoBack() ? router.back() : router.replace("/(tabs)");

  const renderBody = () => {
    if (!match) {
      return loadingMatch ? (
        <ActivityIndicator
          color="#00FF94"
          size="large"
          style={{ marginTop: 80 }}
        />
      ) : (
        <Text style={{ color: mutedColor, textAlign: "center", marginTop: 60 }}>
          This set couldn&apos;t be found.
        </Text>
      );
    }

    const winner: TeamKey | null =
      match.penaltyWinner ??
      (match.winner
        ? idOf(match.teamOne) === match.winner
          ? "teamOne"
          : "teamTwo"
        : null);
    const teamOneName = teamName(match.teamOne);
    const teamTwoName = teamName(match.teamTwo);
    const recordedGoals = match.goalScorers.length;
    const unnamedGoals =
      match.teamOneScore + match.teamTwoScore - recordedGoals;
    const msLeft = match.reviewUntil
      ? new Date(match.reviewUntil).getTime() - Date.now()
      : 0;
    const ownerName = deviceOwner
      ? (playerNames[deviceOwner] ?? "the captain").split(" ")[0]
      : null;

    const status = match.resultStatus;
    const heading =
      status === "CONFIRMED"
        ? "Result confirmed"
        : status === "DISPUTED"
          ? "Result disputed"
          : pending
            ? `Check Set ${match.sequence}'s result`
            : "Nothing to review";
    const body =
      status === "CONFIRMED"
        ? "It counts for everyone's stats."
        : status === "DISPUTED"
          ? "Goals, assists and wins from this set are on hold until it's reviewed."
          : pending
            ? canRespond
              ? "It already counts. If it's wrong, dispute it and everyone's stats from this set are taken out."
              : "Players on the other team can confirm or dispute it."
            : "Only results recorded in Referee mode need checking.";

    return (
      <View className="mx-[24px] gap-[24px]">
        <View className="items-center gap-[12px]">
          <View
            className="h-[110px] w-[110px] items-center justify-center rounded-full"
            style={{
              backgroundColor:
                status === "DISPUTED"
                  ? isDark
                    ? "#2B0000"
                    : "#FFE5E5"
                  : isDark
                    ? "#0D3B26"
                    : "#D4FFF0",
            }}
          >
            <Ionicons
              name={
                status === "DISPUTED"
                  ? "alert-circle-outline"
                  : status === "CONFIRMED"
                    ? "checkmark-circle-outline"
                    : "shield-checkmark-outline"
              }
              size={48}
              color={status === "DISPUTED" ? "#FF4444" : accent}
            />
          </View>
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="mt-[8px] text-center text-[24px] font-[800]"
          >
            {heading}
          </ThemedText>
          <Text
            style={{
              color: mutedColor,
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            {body}
          </Text>
        </View>

        {/* The result */}
        <View
          className="gap-[16px] rounded-[16px] p-[20px]"
          style={{ backgroundColor: isDark ? "#111" : "#fff" }}
        >
          <Scoreboard
            teamOne={{
              code: teamCode(teamOneName),
              name: teamOneName,
              score: match.teamOneScore,
            }}
            teamTwo={{
              code: teamCode(teamTwoName),
              name: teamTwoName,
              score: match.teamTwoScore,
            }}
            clock="Full time"
            winner={winner}
          />
          {!!refereeEntry && (
            <View
              className="flex-row items-center justify-center gap-[6px] border-t pt-[14px]"
              style={{ borderColor: isDark ? "#222" : "#E5E7EB" }}
            >
              <MaterialCommunityIcons
                name="whistle-outline"
                size={16}
                color={mutedColor}
              />
              <Text style={{ color: mutedColor, fontSize: 13 }}>
                {refereeEntry.guestName ?? "Referee"}
                {ownerName ? ` · on ${ownerName}'s phone` : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Goals */}
        {(recordedGoals > 0 || unnamedGoals > 0) && (
          <View className="gap-[10px]">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[17px] font-[700]"
            >
              Goals
            </ThemedText>
            {match.goalScorers.map((goal, i) => {
              const scorer =
                typeof goal.player === "object"
                  ? personName(goal.player)
                  : (playerNames[idOf(goal.player as any) ?? ""] ?? "Player");
              const assistId = idOf(goal.assistedBy as any);
              return (
                <View
                  key={goal.eventId ?? i}
                  style={rowStyle}
                  className="flex-row items-center gap-[12px] px-[16px] py-[13px]"
                >
                  <MaterialCommunityIcons
                    name="soccer"
                    size={18}
                    color={accent}
                  />
                  <View className="flex-1">
                    <ThemedText
                      lightColor={theme.text}
                      darkColor={theme.text}
                      className="text-[15px] font-[600]"
                    >
                      {scorer}
                    </ThemedText>
                    <Text style={{ color: mutedColor, fontSize: 12 }}>
                      {goal.team === "teamOne" ? teamOneName : teamTwoName}
                      {assistId
                        ? ` · assist ${playerNames[assistId] ?? "teammate"}`
                        : ""}
                    </Text>
                  </View>
                </View>
              );
            })}
            {unnamedGoals > 0 && (
              <Text style={{ color: mutedColor, fontSize: 13 }}>
                + {unnamedGoals} goal{unnamedGoals === 1 ? "" : "s"} recorded
                without a scorer
              </Text>
            )}
          </View>
        )}

        {pending && msLeft > 0 && (
          <View
            className="flex-row items-center justify-center gap-[6px] rounded-[10px] p-[12px]"
            style={{ backgroundColor: isDark ? "#0D1F17" : "#EDFFF8" }}
          >
            <Ionicons name="time-outline" size={16} color={mutedColor} />
            <Text style={{ color: mutedColor, fontSize: 13 }}>
              {formatShort(msLeft)} left — if no one responds, it&apos;s
              confirmed
            </Text>
          </View>
        )}

        {canRespond ? (
          <View className="flex-row gap-[12px]">
            <View className="flex-1">
              <CustomButton
                title="Dispute"
                onPress={handleDispute}
                disabled={loadingMatchAction}
                style={{
                  borderRadius: 10,
                  paddingVertical: 18,
                  borderWidth: 1.5,
                  borderColor: "#FF4444",
                  backgroundColor: "transparent",
                }}
                titleStyle={{ color: "#FF4444" }}
              />
            </View>
            <View className="flex-1">
              <CustomButton
                primary
                title="Confirm"
                onPress={handleConfirm}
                loading={loadingMatchAction}
                disabled={loadingMatchAction}
                style={{ borderRadius: 10, paddingVertical: 18 }}
                titleStyle={{ color: "#000", fontWeight: "700" }}
              />
            </View>
          </View>
        ) : (
          <CustomButton
            primary
            title="Done"
            onPress={leave}
            style={{ borderRadius: 10, paddingVertical: 18 }}
            titleStyle={{ color: "#000", fontWeight: "700" }}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaScreen>
      <ScrollView
        className="flex-1 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF94"
            colors={["#00FF94"]}
          />
        }
      >
        <View className="mx-[24px] mb-[24px] flex-row items-center justify-between">
          <TouchableOpacity onPress={leave}>
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
            Review Result
          </ThemedText>
          <View style={{ width: 22 }} />
        </View>

        {renderBody()}
      </ScrollView>
    </SafeAreaScreen>
  );
}
