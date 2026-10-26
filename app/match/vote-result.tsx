import { getSession } from "@/api/sessions";
import { getSessionVote } from "@/api/votesThunk";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import InitialsAvatar from "@/components/match/InitialsAvatar";
import { Colors } from "@/constants/Colors";
import { clearVoteState } from "@/redux/reducers/votes";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { candidateName, positionLabel } from "@/utils/vote";
import { openPlayerStats } from "@/utils/openPlayerStats";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function VoteResult() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useAppDispatch();

  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { activeSession } = useAppSelector((state) => state.sessions);
  const { sessionVote, voteNotOpen, loadingSessionVote, errorSessionVote } =
    useAppSelector((state) => state.votes);
  const [refreshing, setRefreshing] = useState(false);

  const accent = isDark ? "#00FF94" : "#00A85A";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const rowBg = isDark ? "#0D1F17" : "#EDFFF8";
  const rowBorder = isDark ? "#1a3d2b" : "#6BF8BD";
  const chipBg = isDark ? "#0D3B26" : "#D4FFF0";

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

  const onRefresh = useCallback(async () => {
    if (!sessionId) return;
    setRefreshing(true);
    await dispatch(getSessionVote(sessionId));
    setRefreshing(false);
  }, [dispatch, sessionId]);

  const result = sessionVote?.result;
  const findCandidate = (id: string) =>
    sessionVote?.candidates.find((c) => c.user._id === id);
  const votesFor = (id: string) =>
    result?.tallies.find((t) => t.candidate === id)?.votes ?? 0;

  const subtitle = [
    activeSession?.location?.name,
    result
      ? `Voting closed · ${result.votesCast} of ${result.eligibleCount} voted`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

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

  const renderWinner = (id: string, size: number) => {
    const candidate = findCandidate(id);
    const name = candidateName(candidate?.user);
    return (
      <TouchableOpacity
        key={id}
        onPress={() => openPlayerStats(candidate?.user)}
        className="items-center gap-[6px]"
      >
        <View>
          <InitialsAvatar name={name} size={size} />
          <View
            className="absolute bottom-[0px] right-[-4px] items-center justify-center rounded-full border-[3px]"
            style={{
              width: size * 0.36,
              height: size * 0.36,
              backgroundColor: "#00FF94",
              borderColor: isDark ? "#000" : "#fff",
            }}
          >
            <Ionicons name="star" size={size * 0.16} color="#000" />
          </View>
        </View>
        <ThemedText
          lightColor={theme.text}
          darkColor={theme.text}
          className="mt-[8px] text-[22px] font-[800]"
        >
          {name}
        </ThemedText>
        {!!candidate?.user.position && (
          <Text style={{ color: mutedColor, fontSize: 14 }}>
            {positionLabel(candidate.user.position)}
          </Text>
        )}
        <View className="mt-[6px] flex-row flex-wrap justify-center gap-[8px]">
          {[
            {
              key: "votes",
              label: `${votesFor(id)} of ${result?.votesCast ?? 0} votes`,
            },
            {
              key: "goals",
              icon: "soccer" as const,
              label: `${candidate?.goals ?? 0}`,
            },
            {
              key: "assists",
              icon: "shoe-sneaker" as const,
              label: `${candidate?.assists ?? 0}`,
            },
          ].map((chip) => (
            <View
              key={chip.key}
              className="flex-row items-center gap-[6px] rounded-full px-[14px] py-[6px]"
              style={{ backgroundColor: chipBg }}
            >
              {chip.icon && (
                <MaterialCommunityIcons
                  name={chip.icon}
                  size={15}
                  color={isDark ? "#fff" : "#111"}
                />
              )}
              <Text style={{ fontSize: 14, fontWeight: "700", color: accent }}>
                {chip.label}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

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
        "Voting hasn't opened",
        "Voting opens within a minute of the session ending.",
      );
    }
    if (errorSessionVote || !sessionVote) {
      return renderInfo(
        "cloud-offline-outline",
        "Couldn't load the result",
        errorSessionVote ?? "Pull down to try again.",
      );
    }
    if (!result) {
      return sessionVote.status === "OPEN"
        ? renderInfo(
            "time-outline",
            "Voting is still open",
            "Results drop when voting closes.",
          )
        : renderInfo(
            "hourglass-outline",
            "Counting votes…",
            "The result will be ready in a minute or two. Pull down to refresh.",
          );
    }

    const minPct = Math.round(result.minTurnout * 100);

    return (
      <View className="gap-[28px]">
        {result.outcome === "AWARDED" ? (
          result.winners.length > 1 ? (
            // Tie: the award is shared.
            <View className="mx-[24px] items-center gap-[16px]">
              <View
                className="rounded-full px-[14px] py-[6px]"
                style={{ backgroundColor: chipBg }}
              >
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: accent }}
                >
                  Shared award
                </Text>
              </View>
              <View className="flex-row flex-wrap justify-center gap-[28px]">
                {result.winners.map((id) => renderWinner(id, 84))}
              </View>
            </View>
          ) : (
            <View className="mx-[24px]">
              {renderWinner(result.winners[0], 120)}
            </View>
          )
        ) : (
          renderInfo(
            "ribbon-outline",
            "No award this time",
            `Only ${result.votesCast} of ${result.eligibleCount} players voted. At least ${minPct}% need to vote for an award.`,
          )
        )}

        {result.tallies.length > 0 && (
          <View className="gap-[12px]">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="mx-[31px] text-[17px] font-[700]"
            >
              Top votes
            </ThemedText>
            {result.tallies.map((tally, index) => {
              const name = candidateName(findCandidate(tally.candidate)?.user);
              const isWinner = result.winners.includes(tally.candidate);
              return (
                <TouchableOpacity
                  key={tally.candidate}
                  onPress={() =>
                    openPlayerStats(findCandidate(tally.candidate)?.user)
                  }
                  className="mx-[24px] flex-row items-center gap-[14px] px-[16px] py-[14px]"
                  style={{
                    backgroundColor: rowBg,
                    borderBottomWidth: 2,
                    borderBottomColor: rowBorder,
                  }}
                >
                  <Text
                    style={{ color: mutedColor, fontSize: 13, minWidth: 14 }}
                  >
                    {index + 1}
                  </Text>
                  <InitialsAvatar name={name} />
                  <View className="flex-1 gap-[8px]">
                    <ThemedText
                      lightColor={theme.text}
                      darkColor={theme.text}
                      className={`text-[15px] ${isWinner ? "font-[700]" : "font-[400]"}`}
                    >
                      {name}
                    </ThemedText>
                    <View
                      className="h-[8px] overflow-hidden rounded-full"
                      style={{
                        backgroundColor: isDark ? "#1a3d2b" : "#D4F5E6",
                      }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${tally.percent}%`,
                          backgroundColor: isWinner ? "#00FF94" : "#7EE8B8",
                        }}
                      />
                    </View>
                  </View>
                  <ThemedText
                    lightColor={theme.text}
                    darkColor={theme.text}
                    className="text-[15px] font-[700]"
                  >
                    {tally.percent}%
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View
          className="mx-[24px] rounded-[12px] border p-[16px]"
          style={{ borderColor: isDark ? "#333" : "#E5E7EB" }}
        >
          <Text style={{ color: mutedColor, fontSize: 14, lineHeight: 20 }}>
            Votes count for up to 20% of a player&apos;s overall rating. Goals,
            assists, clean sheets and wins make up the rest.
          </Text>
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
          {!!subtitle && (
            <Text
              style={{
                color: mutedColor,
                fontSize: 13,
                textAlign: "center",
                marginTop: 6,
                lineHeight: 19,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {renderBody()}
      </ScrollView>
    </SafeAreaScreen>
  );
}
