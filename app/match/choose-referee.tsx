import {
  assignReferee,
  ensureFirstGame,
  getMatchups,
} from "@/api/matchesThunk";
import {
  getRefereeHistory,
  getReferees,
  inviteReferee,
} from "@/api/refereesThunk";
import { getSession } from "@/api/sessions";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import InitialsAvatar from "@/components/match/InitialsAvatar";
import RefereeRosterList from "@/components/match/RefereeRosterList";
import { Match, RefereeEntry } from "@/components/typings/match";
import CustomButton from "@/components/ui/CustomButton";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

type Mode = "own" | "device";

const idOf = (value: { _id: string } | string | undefined | null) =>
  typeof value === "string" ? value : value?._id;

const fullName = (person?: {
  firstName?: string;
  lastName?: string;
  nickname?: string;
}) =>
  person
    ? `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
      person.nickname ||
      "Player"
    : "Player";

export default function ChooseReferee() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useAppDispatch();

  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { activeSession, sets } = useAppSelector((state) => state.sessions);
  const { matchups } = useAppSelector((state) => state.matches);
  const { roster, history, loadingRefereeAction } = useAppSelector(
    (state) => state.referees,
  );
  const { loadingMatchAction } = useAppSelector((state) => state.matches);

  const [mode, setMode] = useState<Mode>("own");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const accent = isDark ? "#00FF94" : "#00A85A";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const rowBg = isDark ? "#0D1F17" : "#EDFFF8";
  const rowBorder = isDark ? "#1a3d2b" : "#6BF8BD";

  const loadAll = useCallback(async () => {
    if (!sessionId) return;
    dispatch(getReferees(sessionId));
    // Game 1 isn't created by the server; make it now (with the teams, if
    // they're missing) so a referee can be assigned. It stays SCHEDULED.
    await dispatch(ensureFirstGame(sessionId))
      .unwrap()
      .catch((err) =>
        Toast.show({
          type: "error",
          text1: "Couldn't create Set 1",
          text2: err?.msg,
        }),
      );
  }, [dispatch, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    loadAll();
    if (activeSession?._id !== sessionId) dispatch(getSession(sessionId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  // Referees are assigned to the first game that hasn't finished.
  const currentGame: Match | null =
    matchups.find((game) => game.status !== "FINISHED") ?? null;

  const members: any[] = activeSession?.members ?? [];
  const nameOfMember = (id?: string) =>
    fullName(members.find((m) => m._id === id));

  const nameOf = (entry: RefereeEntry) =>
    entry.guestName ??
    (typeof entry.user === "object"
      ? fullName(entry.user)
      : nameOfMember(entry.user));

  // Players on the two teams in the current game can't referee it.
  const playingIds = useMemo(() => {
    if (!currentGame) return new Set<string>();
    const teamIds = [idOf(currentGame.teamOne), idOf(currentGame.teamTwo)];
    return new Set(
      sets
        .filter((set) => teamIds.includes(set._id))
        .flatMap((set) => set.players.map((p: any) => idOf(p) as string)),
    );
  }, [currentGame, sets]);

  const onRoster = new Set(
    roster
      .filter((entry) => entry.status !== "DECLINED")
      .map((entry) => idOf(entry.user as any)),
  );

  const teamCount = sets.length;
  // 3+ teams: build a referee pool of one player per team, so the whistle can
  // pass to a team that isn't playing as teams rotate. A player is only ever
  // assigned to sets their own team isn't in (the API checks that per game).
  const poolMode = teamCount >= 3;
  const teamOf = (userId?: string) =>
    sets.find((set) => set.players.some((p: any) => idOf(p) === userId));
  const coveredTeamIds = new Set(
    roster
      .filter((entry) => entry.status !== "DECLINED")
      .map((entry) => teamOf(idOf(entry.user as any))?._id)
      .filter(Boolean),
  );

  // Until there's a user-search endpoint, candidates are session members.
  // 2 teams: only people not playing the current game (i.e. nobody — a
  // spectator is needed). 3+ teams: one player from each team without one.
  const candidates = members.filter(
    (m) =>
      !onRoster.has(m._id) &&
      (poolMode
        ? !coveredTeamIds.has(teamOf(m._id)?._id)
        : !playingIds.has(m._id)) &&
      `${fullName(m)} ${m.nickname ?? ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );

  // Players can't referee a game their own team is in.
  const canAssign = (entry: RefereeEntry) =>
    !playingIds.has(idOf(entry.user as any) ?? "");

  // "refereed 4 sessions" for whoever is listed.
  const candidateKey = candidates.map((c) => c._id).join(",");
  useEffect(() => {
    candidates.forEach((c) => {
      if (history[c._id] === undefined) dispatch(getRefereeHistory(c._id));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateKey]);

  const selected = candidates.find((c) => c._id === selectedId);

  const handleInvite = () => {
    if (!sessionId || !selected) return;
    dispatch(inviteReferee({ sessionId, userId: selected._id }))
      .unwrap()
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Invite sent",
          text2: `Waiting for ${fullName(selected).split(" ")[0]} to accept`,
        });
        setSelectedId(null);
        setSearch("");
      })
      .catch((err) => {
        Toast.show({ type: "error", text1: "Invite failed", text2: err?.msg });
      });
  };

  const handleAssign = (entry: RefereeEntry) => {
    if (!currentGame) return;
    dispatch(assignReferee({ matchId: currentGame._id, refereeId: entry._id }))
      .unwrap()
      .then(() =>
        Toast.show({
          type: "success",
          text1: `${nameOf(entry)} is refereeing Set ${currentGame.sequence}`,
        }),
      )
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Couldn't assign",
          text2: err?.msg,
        });
        if (sessionId) dispatch(getMatchups(sessionId));
      });
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

  const renderModeOption = (
    key: Mode,
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    body: string,
  ) => {
    const active = mode === key;
    return (
      <TouchableOpacity
        onPress={() => setMode(key)}
        className="mx-[24px] flex-row items-start gap-[14px] rounded-[12px] p-[16px]"
        style={{
          borderWidth: active ? 2 : 1,
          borderColor: active ? accent : isDark ? "#333" : "#E5E7EB",
          backgroundColor: active ? rowBg : "transparent",
        }}
      >
        <View
          className="h-[48px] w-[48px] items-center justify-center rounded-[10px]"
          style={{ backgroundColor: isDark ? "#0D3B26" : "#D4FFF0" }}
        >
          <Ionicons name={icon} size={22} color={accent} />
        </View>
        <View className="flex-1 gap-[4px]">
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="text-[16px] font-[700]"
          >
            {title}
          </ThemedText>
          <Text style={{ color: mutedColor, fontSize: 13, lineHeight: 19 }}>
            {body}
          </Text>
        </View>
        <View
          className="h-[22px] w-[22px] items-center justify-center rounded-full border-2"
          style={{ borderColor: active ? accent : mutedColor }}
        >
          {active && (
            <View
              className="h-[11px] w-[11px] rounded-full"
              style={{ backgroundColor: accent }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaScreen>
      <ScrollView
        className="flex-1 py-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
        <View className="gap-[24px]">
          {/* Tip banner */}
          <View className="mx-[24px] gap-[4px] rounded-[12px] border-[1.5px] border-[#43B75D] bg-[#ECF8EF] p-[16px]">
            <Text className="text-[15px] font-[700] text-[#111]">
              {poolMode
                ? "Invite one player from each team"
                : "Only 2 teams — find a spectator to referee"}
            </Text>
            <Text className="text-[13px] text-[#6D717F]">
              {poolMode
                ? `${coveredTeamIds.size} of ${teamCount} teams have a referee. The whistle passes to a team that isn't playing.`
                : "Their name is saved with every set they officiate"}
            </Text>
          </View>

          {/* Header */}
          <View className="mx-[24px]">
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
                Choose a Referee
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

          {/* Who's been invited / accepted / assigned */}
          {roster.length > 0 && (
            <RefereeRosterList
              roster={roster}
              nameOf={nameOf}
              currentGame={currentGame}
              canAssign={canAssign}
              assigning={loadingMatchAction}
              onAssign={handleAssign}
              onInviteAnother={() => setMode("own")}
            />
          )}

          {/* How will they referee? */}
          <View className="gap-[12px]">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="mx-[24px] text-[17px] font-[700]"
            >
              How will they referee?
            </ThemedText>
            {renderModeOption(
              "own",
              "phone-portrait-outline",
              "On their own phone",
              "They have i-One. Find them and send an invite.",
            )}
            {renderModeOption(
              "device",
              "swap-horizontal",
              "On your phone",
              "Enter their name and hand them your phone in Referee mode.",
            )}
          </View>

          {/* Find spectator */}
          {mode === "own" && (
            <View className="gap-[12px]">
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="mx-[24px] text-[17px] font-[700]"
              >
                Find spectator
              </ThemedText>
              <View
                className="mx-[24px] flex-row items-center gap-[10px] rounded-[10px] border px-[14px]"
                style={{ borderColor: isDark ? "#333" : "#E5E7EB" }}
              >
                <Ionicons name="search" size={20} color={mutedColor} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search by name"
                  placeholderTextColor={mutedColor}
                  autoCapitalize="none"
                  style={{
                    flex: 1,
                    height: 52,
                    fontSize: 16,
                    color: theme.text,
                  }}
                />
              </View>

              {candidates.length === 0 ? (
                <Text
                  style={{
                    color: mutedColor,
                    fontSize: 13,
                    lineHeight: 19,
                    marginHorizontal: 24,
                  }}
                >
                  {search
                    ? "No one found."
                    : poolMode
                      ? "Every team has a player on the referee list."
                      : "Everyone in this session is playing this set. Searching other i-One users is coming soon — use “On your phone” for now."}
                </Text>
              ) : (
                candidates.map((person) => {
                  const isSelected = person._id === selectedId;
                  const refereed = history[person._id];
                  return (
                    <TouchableOpacity
                      key={person._id}
                      onPress={() => setSelectedId(person._id)}
                      className="mx-[24px] flex-row items-center justify-between px-[16px] py-[13px]"
                      style={{
                        backgroundColor: rowBg,
                        borderBottomWidth: 2,
                        borderBottomColor: rowBorder,
                        ...(isSelected && {
                          borderWidth: 2,
                          borderColor: accent,
                          borderRadius: 6,
                        }),
                      }}
                    >
                      <View className="flex-1 flex-row items-center gap-[14px]">
                        <InitialsAvatar name={fullName(person)} />
                        <View className="flex-1">
                          <ThemedText
                            lightColor={theme.text}
                            darkColor={theme.text}
                            className="text-[15px] font-[700]"
                          >
                            {fullName(person)}
                          </ThemedText>
                          <Text style={{ color: mutedColor, fontSize: 13 }}>
                            {[
                              poolMode && teamOf(person._id)?.name,
                              person.nickname && `@${person.nickname}`,
                              refereed
                                ? `refereed ${refereed} session${refereed === 1 ? "" : "s"}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark" size={22} color={accent} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* Actions */}
          <View className="mx-[24px] gap-[14px]">
            <View className="flex-row gap-[12px]">
              <View className="flex-1">
                <CustomButton
                  title="Cancel"
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
                {mode === "own" ? (
                  <CustomButton
                    primary
                    title={
                      selected
                        ? `Invite ${fullName(selected).split(" ")[0]}`
                        : "Invite"
                    }
                    onPress={handleInvite}
                    loading={loadingRefereeAction}
                    disabled={!selected || loadingRefereeAction}
                    style={{ borderRadius: 10, paddingVertical: 18 }}
                    titleStyle={{ color: "#000", fontWeight: "700" }}
                  />
                ) : (
                  <CustomButton
                    primary
                    title="Continue"
                    onPress={() =>
                      router.push({
                        pathname: "/match/referee-device",
                        params: { sessionId },
                      })
                    }
                    style={{ borderRadius: 10, paddingVertical: 18 }}
                    titleStyle={{ color: "#000", fontWeight: "700" }}
                  />
                )}
              </View>
            </View>

            {/* No referee: games still run, but they're UNOFFICIAL. */}
            <TouchableOpacity
              // No referee: go straight to the controls to kick off Set 1.
              onPress={() =>
                router.replace({
                  pathname: "/match/referee",
                  params: { sessionId },
                })
              }
              className="items-center"
            >
              <Text
                style={{
                  color: accent,
                  fontSize: 15,
                  fontWeight: "700",
                  textDecorationLine: "underline",
                }}
              >
                Play without referee
              </Text>
            </TouchableOpacity>
            <Text
              style={{ color: mutedColor, fontSize: 13, textAlign: "center" }}
            >
              Goals, assists and wins won&apos;t be recorded
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
