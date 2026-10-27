import { getMatchups } from "@/api/matchesThunk";
import { getReferees } from "@/api/refereesThunk";
import { getSession, getSessionSets } from "@/api/sessions";
import OpenIcon from "@/assets/svg/OpenIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import FullTimeView, { PlayerTally } from "@/components/match/FullTimeView";
import Scoreboard from "@/components/match/Scoreboard";
import SetPlayedRow from "@/components/match/SetPlayedRow";
import TeamQueueRow from "@/components/match/TeamQueueRow";
import { Match, TeamKey } from "@/components/typings/match";
import { Colors } from "@/constants/Colors";
import useMatchScore from "@/hooks/useMatchScore";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { formatTime } from "@/utils/formatTime";
import { reviewInfo } from "@/utils/matchReview";
import { canRunNoRefereeGame, teamPlayerIds } from "@/utils/teamPlayers";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// Games don't announce when they end or a new one is created on the stream,
// so the list is also refreshed on this interval while the screen is open.
const REFRESH_MS = 20000;

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

/** 06:32 */
const mmss = (ms: number) => {
  const total = Math.max(Math.floor(ms / 1000), 0);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

/** 3 → "3rd" */
const ordinal = (n: number) => {
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? "th"
      : (({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ??
        "th");
  return `${n}${suffix}`;
};

export default function Live() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useAppDispatch();

  const [showDetails, setShowDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // A finished set opened from "Sets played".
  const [openSetId, setOpenSetId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // params only carries the sessionId + static display data (for the initial render skeleton)
  const params = useLocalSearchParams<{
    sessionId?: string;
    session?: string;
  }>();

  // Support both a plain sessionId param and the legacy full-session JSON param
  const staticSession = params.session ? JSON.parse(params.session) : null;
  const sessionId: string = params.sessionId ?? staticSession?._id ?? "";

  const { user } = useAppSelector((state) => state.auth);
  const { activeSession, loadingActiveSession, sets } = useAppSelector(
    (state) => state.sessions,
  );
  const { matchups, loadingMatchups } = useAppSelector(
    (state) => state.matches,
  );
  const { roster } = useAppSelector((state) => state.referees);

  const handleBack = () => router.back();

  const loadGames = useCallback(() => {
    if (!sessionId) return Promise.resolve();
    return dispatch(getMatchups(sessionId));
  }, [dispatch, sessionId]);

  // Fetch fresh session data from server on mount
  // Don't clear activeSession on unmount: joinsession is still underneath
  // and uses the same session, so clearing it would blank its buttons.
  useEffect(() => {
    if (!sessionId) return;
    dispatch(getSession(sessionId));
    dispatch(getSessionSets({ sessionId }));
    // Spectators can't read the referee list (403); the pill falls back.
    dispatch(getReferees(sessionId));
  }, [sessionId, dispatch]);

  // Reload the games when the screen is in view, and every so often after.
  useFocusEffect(
    useCallback(() => {
      loadGames();
      const timer = setInterval(loadGames, REFRESH_MS);
      return () => clearInterval(timer);
    }, [loadGames]),
  );

  const onRefresh = useCallback(async () => {
    if (!sessionId) return;
    setRefreshing(true);
    await Promise.all([
      dispatch(getSession(sessionId)),
      dispatch(getReferees(sessionId)),
      loadGames(),
    ]);
    setRefreshing(false);
  }, [dispatch, sessionId, loadGames]);

  // Derive everything from the server response — no manual state flags
  const session = activeSession ?? staticSession;
  const minsPerSet = session?.minsPerSet ?? 10;
  const rotation: string = session?.rotationFormat ?? "winner_stays";

  // Live score: the stream pushes every goal; reload so scores stay exact.
  const handleScoreUpdate = useCallback(() => {
    loadGames();
  }, [loadGames]);

  const sessionScore = useMatchScore({
    sessionId,
    onScoreUpdate: handleScoreUpdate,
  });

  // ── Games ──
  const games = matchups.filter((m) => !m.session || m.session === sessionId);
  const currentGame: Match | null =
    games.find((m) => m.status === "LIVE") ??
    games.find((m) => m.status === "SCHEDULED") ??
    null;
  const finishedGames = games
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => a.sequence - b.sequence);
  const openSet = finishedGames.find((m) => m._id === openSetId) ?? null;

  // Referee-mode results the other team can still confirm or dispute.
  const playersOfTeam = (team: Match["teamOne"]) => teamPlayerIds(team, sets);
  const reviewOf = (game: Match) =>
    reviewInfo(game, roster, playersOfTeam, user?._id);
  const gameToReview = finishedGames.find((game) => reviewOf(game).canRespond);

  const openReview = (game: Match) =>
    router.push({
      pathname: "/match/result-review",
      params: { sessionId, matchId: game._id },
    });

  // Tick the clock of the live game.
  useEffect(() => {
    if (currentGame?.status !== "LIVE") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [currentGame?.status]);

  // ── Names ──
  const teamNameOf = (team: Match["teamOne"] | string | undefined) =>
    typeof team === "object"
      ? team.name
      : (sets.find((set) => set._id === team)?.name ?? "Team");

  const playerNames = useMemo(() => {
    const names: Record<string, string> = {};
    sets.forEach((set) =>
      set.players.forEach((p: any) => {
        if (typeof p === "object") names[p._id] = personName(p);
      }),
    );
    return names;
  }, [sets]);

  const refereeEntry = roster.find((e) => e._id === currentGame?.referee);
  const refereeName = refereeEntry
    ? (refereeEntry.guestName ??
      (typeof refereeEntry.user === "object"
        ? personName(refereeEntry.user)
        : (playerNames[refereeEntry.user ?? ""] ?? "Referee")))
    : null;
  const refereeTeam = refereeEntry
    ? sets.find((set) =>
        set.players.some(
          (p: any) => idOf(p) === idOf(refereeEntry.user as any),
        ),
      )?.name
    : undefined;

  // Am I refereeing the current game (own phone, or Referee mode on mine)?
  const iAmReferee = Boolean(
    refereeEntry &&
    refereeEntry.status === "ACCEPTED" &&
    ((refereeEntry.mode === "OWN_PHONE" &&
      idOf(refereeEntry.user as any) === user?._id) ||
      (refereeEntry.mode === "CAPTAIN_DEVICE" &&
        refereeEntry.deviceOwner === user?._id)),
  );

  // No referee: the captain runs the scoreboard when their team plays; when it
  // sits out, the two playing teams' players do (the API won't let the captain).
  const currentPlayingIds = currentGame
    ? [
        ...teamPlayerIds(currentGame.teamOne, sets),
        ...teamPlayerIds(currentGame.teamTwo, sets),
      ]
    : [];
  const canRunScoreboard = Boolean(
    currentGame &&
    !currentGame.referee &&
    canRunNoRefereeGame(
      currentPlayingIds,
      idOf(session?.captain as any),
      user?._id,
    ),
  );

  // ── Banner text ──
  const statusTitle = currentGame
    ? currentGame.status === "LIVE"
      ? `Set ${currentGame.sequence} in progress`
      : `Set ${currentGame.sequence} about to start`
    : games.length > 0
      ? "All sets played"
      : "Waiting for Set 1";
  const statusSubtitle = `${
    rotation === "round_robin" ? "Round robin" : "Winner stays on"
  } · ${minsPerSet} mins per set`;

  const clockLabel =
    currentGame?.status === "LIVE" && currentGame.startedAt
      ? mmss(now - new Date(currentGame.startedAt).getTime())
      : mmss(minsPerSet * 60000);

  // ── A finished set, read-only ──
  const openSetProps = (() => {
    if (!openSet) return null;
    const winner: TeamKey | null =
      openSet.penaltyWinner ??
      (openSet.winner
        ? idOf(openSet.teamOne) === openSet.winner
          ? "teamOne"
          : "teamTwo"
        : null);
    const tallies: Record<string, PlayerTally> = {};
    const add = (id: string | undefined, field: "goals" | "assists") => {
      if (!id) return;
      tallies[id] = tallies[id] ?? {
        name: playerNames[id] ?? "Player",
        goals: 0,
        assists: 0,
      };
      tallies[id][field] += 1;
    };
    openSet.goalScorers.forEach((g) => {
      add(idOf(g.player as any), "goals");
      add(idOf(g.assistedBy as any), "assists");
    });
    return {
      teamOne: {
        code: teamCode(teamNameOf(openSet.teamOne)),
        name: teamNameOf(openSet.teamOne),
        score: openSet.teamOneScore,
      },
      teamTwo: {
        code: teamCode(teamNameOf(openSet.teamTwo)),
        name: teamNameOf(openSet.teamTwo),
        score: openSet.teamTwoScore,
      },
      winner,
      tallies: Object.values(tallies),
      queueChanges: [],
    };
  })();

  // Helper formatters
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (timeDuration?: number) => {
    if (!timeDuration) return "TBD";
    const hours = Math.floor(timeDuration / 60);
    const minutes = timeDuration % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    return `${minutes} minutes`;
  };

  const formatWinningDecider = (decider?: string) => {
    const map: Record<string, string> = {
      penalties: "Penalty Shootout",
      both_off: "Both Teams Off",
    };
    return (decider && map[decider]) || decider || "TBD";
  };

  const getMatchDuration = (mins?: number) => {
    if (!mins) return "Golden Goal";
    return `${mins} mins per set`;
  };

  if (!sessionId) {
    return (
      <SafeAreaScreen>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#888" }}>No session data available</Text>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              marginTop: 16,
              backgroundColor: "#00FF94",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 5,
            }}
          >
            <Text>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaScreen>
    );
  }

  return (
    <SafeAreaScreen>
      <ScrollView
        className="mb-[40px] h-full flex-1 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF94"
            colors={["#00FF94"]}
          />
        }
      >
        <View className="flex flex-col gap-[31px]">
          <View className="mx-[24px] flex flex-col gap-[31px]">
            {/* Session status bar + live indicator */}
            <View className="w-full rounded-[10px] border-[1px] border-[#43B75D] bg-[#ECF8EF] p-[16px]">
              <View className="flex flex-col gap-[4px]">
                <View className="flex flex-row items-center justify-between">
                  <ThemedText
                    lightColor="#111"
                    darkColor="#111"
                    className="text-[16px] font-[700] leading-[24px]"
                  >
                    {statusTitle}
                  </ThemedText>

                  <View className="flex flex-row items-center gap-1">
                    <View
                      className={`w-2 h-2 rounded-full ${sessionScore.connected ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <Text className="text-[12px] text-[#6D717F]">
                      {sessionScore.connected ? "Live" : "Offline"}
                    </Text>
                  </View>
                </View>

                <Text className="text-[13px] text-[#6D717F]">
                  {statusSubtitle}
                </Text>
              </View>
            </View>

            {/* Header row */}
            <View>
              <View className="flex flex-row items-center justify-between">
                <TouchableOpacity onPress={handleBack}>
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
                  Session
                </ThemedText>

                <View>
                  <TouchableOpacity
                    onPress={() => setShowDetails(!showDetails)}
                    activeOpacity={0.6}
                  >
                    <OpenIcon stroke={isDark ? "#fff" : "#111"} />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mt-[5px] flex w-full flex-col items-center justify-center gap-[2px]">
                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[13px] font-[400]"
                >
                  {session?.location?.name || "Location TBD"},{" "}
                  {session?.location?.address || ""}
                </ThemedText>
                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[13px] font-[400]"
                >
                  {formatDate(session?.startTime)} •{" "}
                  {formatTime(session?.startTime)}
                </ThemedText>
              </View>

              {/* Loading skeleton while fetching fresh data */}
              {((loadingActiveSession && !activeSession) ||
                (loadingMatchups && games.length === 0)) && (
                <View style={{ alignItems: "center", marginTop: 20 }}>
                  <ActivityIndicator color="#00FF94" size="small" />
                </View>
              )}

              {currentGame ? (
                <>
                  {/* Live scoreboard */}
                  <View className="mt-[32px]">
                    <Scoreboard
                      teamOne={{
                        code: teamCode(teamNameOf(currentGame.teamOne)),
                        name: teamNameOf(currentGame.teamOne),
                        score: currentGame.teamOneScore,
                      }}
                      teamTwo={{
                        code: teamCode(teamNameOf(currentGame.teamTwo)),
                        name: teamNameOf(currentGame.teamTwo),
                        score: currentGame.teamTwoScore,
                      }}
                      clock={clockLabel}
                    />
                  </View>

                  {/* Current referee */}
                  <View
                    style={{ backgroundColor: isDark ? "#0D1F17" : "#EDFFF8" }}
                    className="mx-auto mt-[24px] flex flex-row items-center gap-[8px] rounded-full px-[18px] py-[10px]"
                  >
                    <MaterialCommunityIcons
                      name="whistle-outline"
                      size={18}
                      color={theme.text}
                    />
                    <ThemedText
                      lightColor={theme.text}
                      darkColor={theme.text}
                      className="text-[14px]"
                    >
                      {currentGame.referee ? (
                        <>
                          Referee ·{" "}
                          <ThemedText
                            lightColor={theme.text}
                            darkColor={theme.text}
                            className="font-[600]"
                          >
                            {refereeName ?? "Assigned"}
                          </ThemedText>
                          {refereeTeam ? ` (${refereeTeam})` : ""}
                        </>
                      ) : (
                        "No referee · this set is unofficial"
                      )}
                    </ThemedText>
                  </View>

                  {/* You're the referee: straight to the whistle */}
                  {iAmReferee && (
                    <TouchableOpacity
                      onPress={() =>
                        router.push(
                          currentGame.status === "SCHEDULED"
                            ? {
                                pathname: "/match/take-whistle",
                                params: { sessionId, matchId: currentGame._id },
                              }
                            : {
                                pathname: "/match/referee",
                                params: { sessionId },
                              },
                        )
                      }
                      className="mt-[16px] flex-row items-center justify-center gap-[8px] rounded-[10px] bg-primary py-[14px]"
                    >
                      <MaterialCommunityIcons
                        name="whistle-outline"
                        size={18}
                        color="#000"
                      />
                      <Text className="text-[14px] font-[700]">
                        {currentGame.status === "SCHEDULED"
                          ? `You're the referee for Set ${currentGame.sequence} · Take the whistle`
                          : "You're officiating · Open controls"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {canRunScoreboard && (
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/match/referee",
                          params: { sessionId },
                        })
                      }
                      className="mt-[16px] flex-row items-center justify-center gap-[8px] rounded-[10px] bg-primary py-[14px]"
                    >
                      <Ionicons
                        name="football-outline"
                        size={18}
                        color="#000"
                      />
                      <Text className="text-[14px] font-[700]">
                        Run the scoreboard · Set {currentGame.sequence}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                !loadingMatchups && (
                  <ThemedText
                    lightColor="#6D717F"
                    darkColor="#9BA1A6"
                    className="mt-[32px] text-center text-[14px]"
                  >
                    {games.length > 0
                      ? "That's all the sets for this session."
                      : "Set 1 hasn't been created yet."}
                  </ThemedText>
                )
              )}
            </View>
          </View>

          {/* A Referee-mode result waiting for this player's check */}
          {gameToReview && (
            <TouchableOpacity
              onPress={() => openReview(gameToReview)}
              className="mx-[24px] flex-row items-center gap-[12px] rounded-[12px] border-[1.5px] border-[#E0B341] bg-[#FFF7E0] p-[16px]"
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#B8860B"
              />
              <View className="flex-1">
                <Text className="text-[15px] font-[700] text-[#111]">
                  Review Set {gameToReview.sequence}&apos;s result
                </Text>
                <Text className="text-[13px] text-[#8A6508]">
                  Recorded in Referee mode — confirm it or dispute it
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B8860B" />
            </TouchableOpacity>
          )}

          {/* Team queue: teams waiting, front first */}
          {!!currentGame?.waiting?.length && (
            <View className="gap-[12px]">
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="mx-[31px] text-[17px] font-[700]"
              >
                Team Queue
              </ThemedText>
              {currentGame.waiting.map((teamId, index) => {
                const name = teamNameOf(teamId);
                return (
                  <TeamQueueRow
                    key={teamId}
                    teamCode={teamCode(name)}
                    name={name}
                    subtitle={
                      index === 0
                        ? rotation === "round_robin"
                          ? "Plays next"
                          : "Plays the winner next"
                        : "Waiting"
                    }
                    position={index === 0 ? "Next up" : ordinal(index + 2)}
                    highlight={index === 0}
                  />
                );
              })}
            </View>
          )}

          {/* Sets played */}
          {finishedGames.length > 0 && (
            <View className="gap-[12px]">
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="mx-[31px] text-[17px] font-[700]"
              >
                Sets played
              </ThemedText>
              {finishedGames.map((game) => (
                <SetPlayedRow
                  key={game._id}
                  setNumber={game.sequence}
                  teamOne={teamNameOf(game.teamOne)}
                  teamTwo={teamNameOf(game.teamTwo)}
                  teamOneScore={game.teamOneScore}
                  teamTwoScore={game.teamTwoScore}
                  badge={
                    game.resultStatus === "DISPUTED"
                      ? { label: "Disputed", tone: "danger" }
                      : reviewOf(game).pending
                        ? { label: "To review", tone: "warning" }
                        : undefined
                  }
                  // Results under review open the review screen.
                  onPress={() =>
                    game.resultStatus === "DISPUTED" || reviewOf(game).pending
                      ? openReview(game)
                      : setOpenSetId(game._id)
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* A finished set's result, read-only */}
      <Modal
        visible={!!openSetProps}
        animationType="slide"
        onRequestClose={() => setOpenSetId(null)}
      >
        <SafeAreaScreen>
          <ScrollView
            contentContainerStyle={{ paddingVertical: 24, paddingBottom: 60 }}
          >
            <View className="mx-[24px] mb-[24px] flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setOpenSetId(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#111"}
                />
              </TouchableOpacity>
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[20px] font-[600]"
              >
                Set {openSet?.sequence} · Full Time
              </ThemedText>
              <View style={{ width: 24 }} />
            </View>
            {openSetProps && (
              <FullTimeView
                {...openSetProps}
                clock={mmss(minsPerSet * 60000)}
              />
            )}
          </ScrollView>
        </SafeAreaScreen>
      </Modal>

      {/* Session details dropdown */}
      {showDetails && (
        <>
          <Pressable
            onPress={() => setShowDetails(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.3)",
              zIndex: 200,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 250,
              left: 20,
              right: 20,
              zIndex: 300,
            }}
            className="rounded-[10px] bg-[#F2F2F2] px-[31px] py-[40px] shadow-lg"
          >
            {[
              { label: "Duration", value: getDuration(session?.timeDuration) },
              {
                label: "Duration per match",
                value: getMatchDuration(session?.minsPerSet),
              },
              { label: "Match type", value: session?.matchType || "Friendly" },
              {
                label: "Players per team",
                value: session?.playersPerTeam ?? "TBD",
              },
              { label: "Number of sets", value: session?.setNumber ?? "TBD" },
              {
                label: "Winning decider",
                value: formatWinningDecider(session?.winningDecider),
              },
            ].map((row, i) => (
              <View key={i} className="mb-[17px] flex flex-row justify-between">
                <Text className="text-[14px] text-[#2A2A2A]">{row.label}:</Text>
                <Text className="text-[14px] font-[600] text-black capitalize">
                  {String(row.value)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </SafeAreaScreen>
  );
}
