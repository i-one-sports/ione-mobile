import { getSession } from "@/api/sessions";
import { castSessionVote, getSessionVote } from "@/api/votesThunk";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import InitialsAvatar from "@/components/match/InitialsAvatar";
import StatChips from "@/components/match/StatChips";
import CustomButton from "@/components/ui/CustomButton";
import { Colors } from "@/constants/Colors";
import { clearVoteState } from "@/redux/reducers/votes";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  candidateName,
  formatClock,
  formatShort,
  positionLabel,
} from "@/utils/vote";
import { openPlayerStats } from "@/utils/openPlayerStats";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

export default function Vote() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useAppDispatch();

  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const { activeSession } = useAppSelector((state) => state.sessions);
  const {
    sessionVote,
    voteNotOpen,
    loadingSessionVote,
    errorSessionVote,
    loadingCastVote,
  } = useAppSelector((state) => state.votes);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());

  const accent = isDark ? "#00FF94" : "#00A85A";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const rowBg = isDark ? "#0D1F17" : "#EDFFF8";
  const rowBorder = isDark ? "#1a3d2b" : "#6BF8BD";

  useEffect(() => {
    if (!sessionId) return;
    dispatch(getSessionVote(sessionId));
    // Opened from a push notification, joinsession may not have loaded it.
    if (activeSession?._id !== sessionId) dispatch(getSession(sessionId));
    return () => {
      dispatch(clearVoteState());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, dispatch]);

  // Tick the "left to vote" countdown while voting is open.
  useEffect(() => {
    if (sessionVote?.status !== "OPEN") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [sessionVote?.status]);

  // Once the result is counted, this screen hands over to the result screen.
  useEffect(() => {
    if (sessionVote?.result && sessionId) {
      router.replace({ pathname: "/match/vote-result", params: { sessionId } });
    }
  }, [sessionVote?.result, sessionId]);

  const onRefresh = useCallback(async () => {
    if (!sessionId) return;
    setRefreshing(true);
    await dispatch(getSessionVote(sessionId));
    setRefreshing(false);
  }, [dispatch, sessionId]);

  const timeLeft = sessionVote
    ? new Date(sessionVote.closesAt).getTime() - now
    : 0;
  const selected = sessionVote?.candidates.find(
    (c) => c.user._id === selectedId,
  );
  const myVoteCandidate = sessionVote?.candidates.find(
    (c) => c.user._id === sessionVote.myVote,
  );

  const handleVote = () => {
    if (!sessionId || !selected) return;
    const name = candidateName(selected.user);
    // Votes are final, so confirm first.
    Alert.alert(
      `Vote for ${name}?`,
      "Your vote is final and can't be changed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Vote",
          onPress: () => {
            dispatch(
              castSessionVote({ sessionId, candidateId: selected.user._id }),
            )
              .unwrap()
              .catch((err) => {
                Toast.show({
                  type: "error",
                  text1: "Vote not sent",
                  text2: err?.msg,
                });
                // 409 already voted / 400 closed: show what the server has now.
                dispatch(getSessionVote(sessionId));
              });
          },
        },
      ],
    );
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
    .join(" · ");

  const renderInfo = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    body: string,
  ) => (
    <View className="mx-[31px] mt-[60px] items-center gap-[12px]">
      <View
        className="h-[96px] w-[96px] items-center justify-center rounded-full"
        style={{ backgroundColor: rowBg }}
      >
        <Ionicons name={icon} size={40} color={accent} />
      </View>
      <ThemedText
        lightColor={theme.text}
        darkColor={theme.text}
        className="text-center text-[20px] font-[700]"
      >
        {title}
      </ThemedText>
      <Text
        style={{
          color: mutedColor,
          fontSize: 14,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        {body}
      </Text>
    </View>
  );

  const renderBody = () => {
    if (loadingSessionVote && !sessionVote && !voteNotOpen) {
      return (
        <ActivityIndicator
          color="#00FF94"
          size="large"
          style={{ marginTop: 80 }}
        />
      );
    }
    if (voteNotOpen) {
      return renderInfo(
        "time-outline",
        "Voting opens shortly",
        "Voting opens within a minute of the session ending. Pull down to refresh.",
      );
    }
    if (errorSessionVote || !sessionVote) {
      return renderInfo(
        "cloud-offline-outline",
        "Couldn't load voting",
        errorSessionVote ?? "Pull down to try again.",
      );
    }
    if (sessionVote.status === "CLOSED") {
      return renderInfo(
        "hourglass-outline",
        "Counting votes…",
        "Voting has closed. The result will be ready in a minute or two.",
      );
    }

    // #8 — vote sent
    if (sessionVote.myVote) {
      const turnout = sessionVote.eligibleCount
        ? sessionVote.votesCast / sessionVote.eligibleCount
        : 0;
      return (
        <View className="mx-[24px] mt-[40px] items-center gap-[12px]">
          <View
            className="h-[110px] w-[110px] items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? "#0D3B26" : "#D4FFF0" }}
          >
            <Ionicons name="star-outline" size={44} color={accent} />
          </View>
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="mt-[12px] text-[24px] font-[800]"
          >
            Vote don enter!
          </ThemedText>
          <Text
            style={{
              color: mutedColor,
              fontSize: 14,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            You voted for {candidateName(myVoteCandidate?.user)}. Results drop
            when voting closes.
          </Text>

          <View
            className="mt-[20px] w-full gap-[14px] rounded-[12px] p-[18px]"
            style={{ backgroundColor: isDark ? "#111" : "#fff" }}
          >
            <View className="flex-row justify-between">
              <Text style={{ color: mutedColor, fontSize: 14 }}>Votes in</Text>
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[14px] font-[700]"
              >
                {sessionVote.votesCast} of {sessionVote.eligibleCount} players
              </ThemedText>
            </View>
            <View
              className="h-[8px] overflow-hidden rounded-full"
              style={{ backgroundColor: rowBg }}
            >
              <View
                className="h-full rounded-full bg-[#00FF94]"
                style={{ width: `${Math.min(turnout, 1) * 100}%` }}
              />
            </View>
            <View className="flex-row justify-between">
              <Text style={{ color: mutedColor, fontSize: 14 }}>Closes in</Text>
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[14px] font-[700]"
              >
                {formatShort(timeLeft)}
              </ThemedText>
            </View>
          </View>

          <View className="mt-[16px] w-full">
            <CustomButton
              primary
              title="Back to Session"
              onPress={() => router.back()}
              style={{ borderRadius: 10, paddingVertical: 18 }}
              titleStyle={{ color: "#000", fontWeight: "700" }}
            />
          </View>
        </View>
      );
    }

    // Open but this player can't vote: a referee or spectator.
    if (!sessionVote.canVote) {
      return renderInfo(
        "people-outline",
        "Only players can vote",
        `Players who played this session are voting. ${sessionVote.votesCast} of ${sessionVote.eligibleCount} have voted so far.`,
      );
    }

    // #7 — choose a player
    return (
      <View className="gap-[24px]">
        <View
          className="mx-[24px] flex-row items-center justify-between rounded-[12px] border-[1.5px] border-[#43B75D] p-[16px]"
          style={{ backgroundColor: rowBg }}
        >
          <View className="flex-1 gap-[4px]">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[16px] font-[700]"
            >
              Who be the best player?
            </ThemedText>
            <Text style={{ color: mutedColor, fontSize: 13 }}>
              One vote · anonymous · not yourself
            </Text>
          </View>
          <View className="items-end">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[18px] font-[800]"
            >
              {formatClock(timeLeft)}
            </ThemedText>
            <Text style={{ color: mutedColor, fontSize: 12 }}>
              left to vote
            </Text>
          </View>
        </View>

        <View className="gap-[12px]">
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="mx-[31px] text-[17px] font-[700]"
          >
            Played this session
          </ThemedText>
          {sessionVote.candidates.map((candidate) => {
            const isMe = candidate.user._id === user?._id;
            const isSelected = candidate.user._id === selectedId;
            const name = candidateName(candidate.user);
            return (
              <TouchableOpacity
                key={candidate.user._id}
                disabled={isMe}
                onPress={() => setSelectedId(candidate.user._id)}
                className="mx-[24px] flex-row items-center justify-between px-[16px] py-[13px]"
                style={{
                  backgroundColor: rowBg,
                  borderBottomWidth: 2,
                  borderBottomColor: rowBorder,
                  opacity: isMe ? 0.5 : 1,
                  ...(isSelected && {
                    borderWidth: 2,
                    borderColor: accent,
                    borderRadius: 6,
                  }),
                }}
              >
                <View className="flex-1 flex-row items-center gap-[14px]">
                  {/* The row picks who to vote for; the avatar opens their stats. */}
                  <TouchableOpacity
                    onPress={() => openPlayerStats(candidate.user)}
                    hitSlop={6}
                  >
                    <InitialsAvatar name={isMe ? "Me" : name} />
                  </TouchableOpacity>
                  <View className="flex-1">
                    <ThemedText
                      lightColor={theme.text}
                      darkColor={theme.text}
                      className="text-[15px] font-[700]"
                    >
                      {isMe ? "You" : name}
                    </ThemedText>
                    <Text style={{ color: mutedColor, fontSize: 13 }}>
                      {isMe
                        ? "Can't vote for yourself"
                        : positionLabel(candidate.user.position)}
                    </Text>
                  </View>
                </View>
                {!isMe && (
                  <View className="flex-row items-center gap-[8px]">
                    <StatChips
                      goals={candidate.goals}
                      assists={candidate.assists}
                    />
                    <View style={{ width: 22 }}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={22} color={accent} />
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mx-[24px] flex-row gap-[12px]">
          <View className="flex-1">
            {/* There's no "skip" to send; not voting just doesn't count. */}
            <CustomButton
              title="Skip"
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
              title={selected ? `Vote ${selected.user.firstName}` : "Vote"}
              onPress={handleVote}
              loading={loadingCastVote}
              disabled={!selected || loadingCastVote}
              style={{ borderRadius: 10, paddingVertical: 18 }}
              titleStyle={{ color: "#000", fontWeight: "700" }}
            />
          </View>
        </View>
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
        {/* Header */}
        <View className="mx-[24px] mb-[24px]">
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
              Player of the Session
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
              }}
            >
              {sessionLine}
            </Text>
          )}
        </View>

        {renderBody()}
      </ScrollView>
    </SafeAreaScreen>
  );
}
