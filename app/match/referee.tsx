import {
  assignReferee,
  endMatch,
  ensureFirstGame,
  getMatch,
  getMatchups,
  startMatch,
} from "@/api/matchesThunk";
import { flushRecordingQueue, queueTap } from "@/api/recordingQueueThunk";
import { getReferees } from "@/api/refereesThunk";
import { getSession, getSessionSets } from "@/api/sessions";
import OpenIcon from "@/assets/svg/OpenIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import FullTimeView, {
  HandOver,
  PlayerTally,
  QueueChange,
} from "@/components/match/FullTimeView";
import LiveSetView from "@/components/match/LiveSetView";
import RecordGoalSheet, {
  GoalTeam,
  RecordedGoal,
} from "@/components/match/RecordGoalSheet";
import Scoreboard from "@/components/match/Scoreboard";
import { Match, TeamKey } from "@/components/typings/match";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setDropped } from "@/redux/reducers/recordingQueue";
import { formatTime } from "@/utils/formatTime";
import { canRunNoRefereeGame, teamPlayerIds } from "@/utils/teamPlayers";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
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

/** 06:32 */
const mmss = (ms: number) => {
  const total = Math.max(Math.floor(ms / 1000), 0);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export default function Referee() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useAppDispatch();

  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const { activeSession, loadingActiveSession, sets } = useAppSelector(
    (state) => state.sessions,
  );
  const {
    matchups,
    currentMatch,
    lastEnd,
    loadingMatchups,
    loadingMatchAction,
  } = useAppSelector((state) => state.matches);
  const { roster } = useAppSelector((state) => state.referees);
  const {
    queue,
    sendingId,
    stalled,
    dropped: droppedMessage,
  } = useAppSelector((state) => state.recordingQueue);

  const [showDetails, setShowDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showGoalSheet, setShowGoalSheet] = useState(false);
  // After End Set: show the result until the referee starts the next set.
  const [showFullTime, setShowFullTime] = useState(false);
  // Who the outgoing referee handed the whistle to for the next set.
  const [handedTo, setHandedTo] = useState<string | null>(null);

  // Set clock — local to this phone; the API has no clock.
  const [now, setNow] = useState(Date.now());
  const [clock, setClock] = useState({
    offsetMs: 0,
    pausedAt: null as number | null,
    extraMs: 0,
  });

  const session = activeSession?._id === sessionId ? activeSession : null;
  const minsPerSet = session?.minsPerSet ?? 10;

  // ── Loading ──
  const loadAll = useCallback(async () => {
    if (!sessionId) return;
    dispatch(getSessionSets({ sessionId }));
    dispatch(getReferees(sessionId));
    const games = await dispatch(getMatchups(sessionId))
      .unwrap()
      .catch(() => [] as Match[]);
    // Record the first game that hasn't finished.
    const game = games.find((g) => g.status !== "FINISHED");
    if (game) dispatch(getMatch(game._id));
  }, [dispatch, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (activeSession?._id !== sessionId) dispatch(getSession(sessionId));
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (showFullTime) {
      if (sessionId) await dispatch(getReferees(sessionId));
    } else {
      await loadAll();
    }
    setRefreshing(false);
  }, [dispatch, loadAll, sessionId, showFullTime]);

  const match =
    currentMatch && matchups.some((m) => m._id === currentMatch._id)
      ? currentMatch
      : null;

  // ── Names ──
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
    return names;
  }, [sets, match]);

  const teamNameOf = (team: Match["teamOne"] | undefined) =>
    typeof team === "object"
      ? team.name
      : (sets.find((set) => set._id === team)?.name ?? "Team");

  const refereeNameOf = (refereeId: string | null | undefined) => {
    const entry = roster.find((e) => e._id === refereeId);
    if (!entry) return null;
    if (entry.guestName) return entry.guestName;
    return typeof entry.user === "object"
      ? personName(entry.user)
      : (playerNames[entry.user ?? ""] ?? "The referee");
  };

  // ── Who may record this game ──
  // With a referee: only them (on their phone, or the captain's in Referee
  // mode). Without one: anyone on either playing team, but no goal scorers.
  const myRosterIds = roster
    .filter(
      (e) =>
        e.status === "ACCEPTED" &&
        ((e.mode === "OWN_PHONE" && idOf(e.user as any) === user?._id) ||
          (e.mode === "CAPTAIN_DEVICE" && e.deviceOwner === user?._id)),
    )
    .map((e) => e._id);
  const playersOf = (team: Match["teamOne"] | undefined) =>
    teamPlayerIds(team, sets);
  const playingIds = [
    ...playersOf(match?.teamOne),
    ...playersOf(match?.teamTwo),
  ];
  const hasReferee = Boolean(match?.referee);
  const captainId = idOf(session?.captain as any);
  const captainPlaying = !!captainId && playingIds.includes(captainId);
  // Referee: only them. No referee: the captain when their team plays;
  // otherwise the playing teams' players (see canRunNoRefereeGame).
  const canRecord = match
    ? hasReferee
      ? myRosterIds.includes(match.referee as string)
      : canRunNoRefereeGame(playingIds, captainId, user?._id)
    : false;
  const refereeEntry = roster.find((e) => e._id === match?.referee);
  const inRefereeMode =
    refereeEntry?.mode === "CAPTAIN_DEVICE" &&
    refereeEntry.deviceOwner === user?._id;
  const setNumber = match?.sequence ?? 1;

  // ── Set clock ──
  const startedAtMs = match?.startedAt
    ? new Date(match.startedAt).getTime()
    : now;
  useEffect(() => {
    if (match?.status !== "LIVE" || clock.pausedAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [match?.status, clock.pausedAt]);
  const elapsedMs = (clock.pausedAt ?? now) - startedAtMs - clock.offsetMs;
  const limitMs = minsPerSet * 60000 + clock.extraMs;
  const clockLabel =
    match?.status === "LIVE"
      ? `${mmss(elapsedMs)} / ${mmss(limitMs)}`
      : mmss(limitMs);

  const toggleClock = () =>
    setClock((c) =>
      c.pausedAt
        ? {
            ...c,
            offsetMs: c.offsetMs + (Date.now() - c.pausedAt),
            pausedAt: null,
          }
        : { ...c, pausedAt: Date.now() },
    );
  const addMinute = () =>
    setClock((c) => ({ ...c, extraMs: c.extraMs + 60000 }));
  const resetClock = () => {
    setNow(Date.now());
    setClock({
      offsetMs: Date.now() - startedAtMs,
      pausedAt: null,
      extraMs: 0,
    });
  };

  // ── Recording ──
  // 409: the score moved on (another tap, or a retry) — show the latest.
  const handleRecordError = (err: any) => {
    if (err?.status === 409) {
      Toast.show({
        type: "info",
        text1: "Score updated",
        text2: "Showing the latest score",
      });
      if (match) dispatch(getMatch(match._id));
      return;
    }
    Toast.show({ type: "error", text1: "Not saved", text2: err?.msg });
  };

  const handleKickOff = () => {
    if (!match) return;
    dispatch(startMatch(match._id))
      .unwrap()
      .then(() => {
        setNow(Date.now());
        setClock({ offsetMs: 0, pausedAt: null, extraMs: 0 });
      })
      .catch(handleRecordError);
  };

  // Goals and undos are saved on the phone first, then sent in order
  // (see api/recordingQueueThunk). The score updates as each one lands.
  // + is a goal without a scorer; − undoes that team's most recent goal.
  const changeScore = (team: TeamKey, delta: number) => {
    if (!match) return;
    const name = teamNameOf(match[team]);
    dispatch(
      queueTap({
        matchId: match._id,
        kind: delta > 0 ? "PLUS" : "UNDO",
        team,
        label: delta > 0 ? `Goal · ${name}` : `Undo last goal · ${name}`,
      }),
    );
  };

  const handleGoalRecorded = (goal: RecordedGoal) => {
    if (!match) return;
    const scorer = (playerNames[goal.scorerId] ?? "Player").split(" ")[0];
    dispatch(
      queueTap({
        matchId: match._id,
        kind: "GOAL",
        team: goal.team,
        playerId: goal.scorerId,
        assistedBy: goal.assistId ?? undefined,
        label: `Goal · ${scorer} (${teamNameOf(match[goal.team])})`,
      }),
    );
  };

  const pendingTaps = match
    ? queue
        .filter((tap) => tap.matchId === match._id)
        .map((tap) => ({
          id: tap.eventId,
          label: tap.label,
          state:
            tap.eventId === sendingId
              ? ("sending" as const)
              : stalled
                ? ("offline" as const)
                : ("queued" as const),
        }))
    : [];

  // Send anything left from before (e.g. the app was closed mid-set).
  useEffect(() => {
    dispatch(flushRecordingQueue());
  }, [dispatch]);

  // Taps the server refused (409 / 4xx) are dropped; say so once.
  useEffect(() => {
    if (!droppedMessage) return;
    Toast.show({
      type: "info",
      text1: "Check the score",
      text2: droppedMessage,
    });
    dispatch(setDropped(null));
  }, [droppedMessage, dispatch]);

  const sendEnd = (penaltyWinner?: TeamKey) => {
    if (!match) return;
    dispatch(
      endMatch({
        matchId: match._id,
        expectedScoreVersion: match.scoreVersion,
        penaltyWinner,
      }),
    )
      .unwrap()
      .then(() => setShowFullTime(true))
      .catch(handleRecordError);
  };

  const handleEndSet = () => {
    if (!match) return;
    const draw = match.teamOneScore === match.teamTwoScore;
    // Only a winner-stays session decided on penalties needs a shootout winner;
    // with both_off (or round robin) a draw just ends as a draw.
    const penalties =
      session?.winningDecider === "penalties" &&
      (session?.rotationFormat ?? "winner_stays") === "winner_stays";
    // A level winner-stays game decided on penalties needs the shootout winner.
    if (draw && penalties) {
      Alert.alert("Level score", "Who won the penalty shootout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: teamNameOf(match.teamOne),
          onPress: () => sendEnd("teamOne"),
        },
        {
          text: teamNameOf(match.teamTwo),
          onPress: () => sendEnd("teamTwo"),
        },
      ]);
      return;
    }
    Alert.alert(`End Set ${setNumber}?`, "This saves the result.", [
      { text: "Cancel", style: "cancel" },
      { text: "End Set", onPress: () => sendEnd() },
    ]);
  };

  const [creatingGame, setCreatingGame] = useState(false);
  const handleCreateFirstGame = async () => {
    if (!sessionId) return;
    setCreatingGame(true);
    try {
      const games = await dispatch(ensureFirstGame(sessionId)).unwrap();
      const game = games.find((g) => g.status !== "FINISHED");
      if (game) await dispatch(getMatch(game._id));
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Couldn't create Set 1",
        text2: err?.msg,
      });
    } finally {
      setCreatingGame(false);
    }
  };

  const handleStartNextSet = () => {
    if (!lastEnd?.next) return;
    setShowFullTime(false);
    setHandedTo(null);
    dispatch(getMatch(lastEnd.next._id));
  };

  // ── Data for the views ──
  const scoreboardTeams = match && {
    teamOne: {
      code: teamCode(teamNameOf(match.teamOne)),
      name: teamNameOf(match.teamOne),
      score: match.teamOneScore,
    },
    teamTwo: {
      code: teamCode(teamNameOf(match.teamTwo)),
      name: teamNameOf(match.teamTwo),
      score: match.teamTwoScore,
    },
  };

  const goalTeams: Record<TeamKey, GoalTeam> | null =
    match &&
    typeof match.teamOne === "object" &&
    typeof match.teamTwo === "object"
      ? {
          teamOne: {
            name: match.teamOne.name,
            players: match.teamOne.players.map((p) => ({
              id: p._id,
              name: personName(p),
            })),
          },
          teamTwo: {
            name: match.teamTwo.name,
            players: match.teamTwo.players.map((p) => ({
              id: p._id,
              name: personName(p),
            })),
          },
        }
      : null;

  const ended = showFullTime ? lastEnd : null;
  // The next game as it is now (e.g. after a hand-over assigned a referee).
  const nextGame = ended?.next
    ? (matchups.find((m) => m._id === ended.next?._id) ?? ended.next)
    : null;

  const nextPlayingIds = nextGame
    ? [...playersOf(nextGame.teamOne), ...playersOf(nextGame.teamTwo)]
    : [];

  // Can this phone record the next game? Its referee, or (no referee) a player.
  const canStartNext = nextGame
    ? nextGame.referee
      ? myRosterIds.includes(nextGame.referee)
      : canRunNoRefereeGame(nextPlayingIds, captainId, user?._id)
    : false;

  // Hand the whistle: the server drops a referee whose team comes on, so the
  // outgoing referee (or the captain) picks someone free from the list.
  const wasReferee = myRosterIds.includes(ended?.match.referee ?? "");
  const isCaptain = captainId === user?._id;
  const handOver: HandOver | null =
    nextGame &&
    (!nextGame.referee || handedTo) &&
    (wasReferee || isCaptain) &&
    roster.some((e) => e.status === "ACCEPTED")
      ? {
          nextSetNumber: nextGame.sequence,
          assignedName: handedTo,
          assigning: loadingMatchAction,
          options: roster
            .filter(
              (e) =>
                e.status === "ACCEPTED" &&
                !nextPlayingIds.includes(idOf(e.user as any) ?? ""),
            )
            .map((e) => {
              const userId = idOf(e.user as any);
              return {
                id: e._id,
                name: refereeNameOf(e._id) ?? "Referee",
                team: userId
                  ? sets.find((set) =>
                      set.players.some((p: any) => idOf(p) === userId),
                    )?.name
                  : "On your phone",
              };
            }),
          onPick: (refereeId) => {
            dispatch(assignReferee({ matchId: nextGame._id, refereeId }))
              .unwrap()
              .then(() => setHandedTo(refereeNameOf(refereeId) ?? "Referee"))
              .catch((err) =>
                Toast.show({
                  type: "error",
                  text1: "Couldn't hand over",
                  text2: err?.msg,
                }),
              );
          },
        }
      : null;

  const fullTimeProps = (() => {
    if (!ended) return null;
    const finished = ended.match;
    const next = nextGame;
    const winnerKey: TeamKey | null =
      finished.penaltyWinner ??
      (finished.winner
        ? idOf(finished.teamOne) === finished.winner
          ? "teamOne"
          : "teamTwo"
        : null);

    const tallyMap: Record<string, PlayerTally> = {};
    const add = (id: string | undefined, field: "goals" | "assists") => {
      if (!id) return;
      tallyMap[id] = tallyMap[id] ?? {
        name: playerNames[id] ?? "Player",
        goals: 0,
        assists: 0,
      };
      tallyMap[id][field] += 1;
    };
    finished.goalScorers.forEach((g) => {
      add(idOf(g.player as any), "goals");
      add(idOf(g.assistedBy as any), "assists");
    });

    // Work out who stays and who leaves from the two games themselves, not
    // from rotation rules: a team in both games stays on, a team only in the
    // next one comes on, and a team only in the finished one goes to the back.
    // Holds for wins, penalties, both_off (2, 3 or 4+ teams) and round robin.
    const finishedIds = [idOf(finished.teamOne), idOf(finished.teamTwo)];
    const nextIds = next ? [idOf(next.teamOne), idOf(next.teamTwo)] : [];
    // Same two teams again (always the case with 2 teams).
    const rematch =
      nextIds.length === 2 && nextIds.every((id) => finishedIds.includes(id));
    const nextTeam = (team: Match["teamOne"]) => ({
      code: teamCode(teamNameOf(team)),
      name: teamNameOf(team),
      caption: rematch
        ? "Plays again"
        : finishedIds.includes(idOf(team))
          ? "Stays on"
          : "Comes on",
    });

    const queueChanges: QueueChange[] = [];
    if (next) {
      [finished.teamOne, finished.teamTwo]
        .filter((team) => !nextIds.includes(idOf(team)))
        .forEach((team) =>
          queueChanges.push({
            kind: "team",
            teamCode: teamCode(teamNameOf(team)),
            text: `${teamNameOf(team)} moves to the back of the queue`,
          }),
        );
    }
    if (next) {
      queueChanges.push({
        kind: "whistle",
        text: next.referee
          ? `${refereeNameOf(next.referee) ?? "The referee"} carries on refereeing`
          : "No referee for the next set — the captain can assign one",
      });
    }

    return {
      teamOne: {
        code: teamCode(teamNameOf(finished.teamOne)),
        name: teamNameOf(finished.teamOne),
        score: finished.teamOneScore,
      },
      teamTwo: {
        code: teamCode(teamNameOf(finished.teamTwo)),
        name: teamNameOf(finished.teamTwo),
        score: finished.teamTwoScore,
      },
      winner: winnerKey,
      tallies: Object.values(tallyMap),
      nextSetNumber: next?.sequence ?? finished.sequence + 1,
      upNext: next
        ? {
            teamOne: nextTeam(next.teamOne),
            teamTwo: nextTeam(next.teamTwo),
            rematch,
          }
        : null,
      queueChanges,
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

  const title = ended
    ? `Set ${ended.match.sequence} · Full Time`
    : match?.status === "SCHEDULED"
      ? `Set ${setNumber} · Ready`
      : "Live Set";

  const renderBody = () => {
    if (fullTimeProps) {
      return (
        <View className="gap-[16px]">
          <FullTimeView
            {...fullTimeProps}
            clock={mmss(limitMs)}
            handOver={handOver}
            onStartNextSet={canStartNext ? handleStartNextSet : undefined}
          />
          {/* Someone else records the next set: this phone is done for now. */}
          {nextGame && !canStartNext && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="mx-[31px] items-center rounded-[10px] bg-primary py-[18px]"
            >
              <Text className="text-[16px] font-[700]">Done</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (!match) {
      if (loadingMatchups || loadingActiveSession) {
        return (
          <ActivityIndicator
            color="#00FF94"
            size="large"
            style={{ marginTop: 60 }}
          />
        );
      }
      const allFinished =
        matchups.length > 0 && matchups.every((m) => m.status === "FINISHED");
      // No game yet: the captain can create Set 1 (and the teams) right here.
      if (!allFinished && isCaptain) {
        return (
          <View className="mx-[31px] mt-[40px] gap-[14px]">
            <ThemedText
              lightColor="#6D717F"
              darkColor="#9BA1A6"
              className="text-center text-[14px] leading-[20px]"
            >
              Set 1 hasn&apos;t been created yet.
            </ThemedText>
            <TouchableOpacity
              disabled={creatingGame}
              onPress={handleCreateFirstGame}
              className="items-center rounded-[10px] bg-primary py-[18px]"
            >
              {creatingGame ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-[16px] font-[700]">Create Set 1</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <ThemedText
          lightColor="#6D717F"
          darkColor="#9BA1A6"
          className="mx-[31px] mt-[40px] text-center text-[14px] leading-[20px]"
        >
          {allFinished
            ? "All of this session's sets have been played."
            : "No set has been created yet. The captain creates Set 1 from Choose Referee."}
        </ThemedText>
      );
    }

    if (!scoreboardTeams) return null;

    // Someone else is recording: show the score, no controls.
    if (!canRecord) {
      return (
        <View className="mx-[24px] gap-[24px]">
          <Scoreboard
            teamOne={scoreboardTeams.teamOne}
            teamTwo={scoreboardTeams.teamTwo}
            clock={clockLabel}
          />
          <ThemedText
            lightColor="#6D717F"
            darkColor="#9BA1A6"
            className="text-center text-[14px] leading-[20px]"
          >
            {hasReferee
              ? `${refereeNameOf(match.referee) ?? "The referee"} is recording Set ${setNumber}.`
              : captainPlaying
                ? `The captain is running the scoreboard for Set ${setNumber}.`
                : `Set ${setNumber} has no referee — a player from the two teams is running the scoreboard.`}
          </ThemedText>
        </View>
      );
    }

    return (
      <LiveSetView
        teamOne={scoreboardTeams.teamOne}
        teamTwo={scoreboardTeams.teamTwo}
        clock={clockLabel}
        scheduled={match.status === "SCHEDULED"}
        setNumber={setNumber}
        onKickOff={handleKickOff}
        busy={loadingMatchAction}
        pendingTaps={pendingTaps}
        canRecordScorers={hasReferee}
        clockPaused={Boolean(clock.pausedAt)}
        onToggleClock={toggleClock}
        onAddMinute={addMinute}
        onResetClock={resetClock}
        onChangeScore={changeScore}
        onRecordGoal={() => setShowGoalSheet(true)}
        onCancel={() => router.back()}
        onEndSet={handleEndSet}
      />
    );
  };

  if (!sessionId) {
    return (
      <SafeAreaScreen>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#888" }}>No session data available</Text>
          <TouchableOpacity
            onPress={() => router.back()}
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
      {/* Referee mode: the captain's phone is in the referee's hands */}
      {inRefereeMode && (
        <View className="flex-row items-center gap-[10px] bg-[#111] px-[24px] py-[14px]">
          <MaterialCommunityIcons
            name="whistle-outline"
            size={20}
            color="#00FF94"
          />
          <Text className="text-[15px] font-[700] text-white">
            Referee mode · {refereeEntry?.guestName ?? "Referee"}
          </Text>
        </View>
      )}

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
        {/* Header row */}
        <View className="mx-[24px] mb-[24px]">
          <View className="flex flex-row items-center justify-between">
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
              {title}
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
            {inRefereeMode && (
              <Text className="mt-[6px] text-[13px] text-[#6D717F]">
                Set {setNumber} · on {user?.firstName ?? "the captain"}&apos;s
                phone
              </Text>
            )}
          </View>
        </View>

        {renderBody()}
      </ScrollView>

      {goalTeams && (
        <RecordGoalSheet
          isVisible={showGoalSheet}
          onClose={() => setShowGoalSheet(false)}
          subtitle={`Set ${setNumber} · ${goalTeams.teamOne.name} vs ${goalTeams.teamTwo.name} · ${mmss(elapsedMs)}`}
          teams={goalTeams}
          onSubmit={handleGoalRecorded}
        />
      )}

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
