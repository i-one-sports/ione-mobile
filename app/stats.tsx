import { getUserRating, getUserStats } from "@/api/statsThunk";
import { getMyBadges, getUserBadges, shareBadge } from "@/api/badgesThunk";
import { Badge } from "@/components/typings/badge";
import { badgeInfo } from "@/constants/badges";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import InitialsAvatar from "@/components/match/InitialsAvatar";
import { getPositionName } from "@/components/profile/utils";
import { RatingComponentKey } from "@/components/typings/stats";
import { statsKey } from "@/redux/reducers/stats";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

const THIS_YEAR = new Date().getFullYear();
// null = all-time totals.
const SEASONS: (number | null)[] = [
  null,
  THIS_YEAR,
  THIS_YEAR - 1,
  THIS_YEAR - 2,
];

export default function Stats() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();

  // Someone else's stats: the API returns numbers only, so their name and
  // position come in the params. Default: the signed-in player.
  const params = useLocalSearchParams<{
    userId?: string;
    name?: string;
    position?: string;
  }>();
  const { user } = useAppSelector((state) => state.auth);
  const userId = params.userId ?? user?._id ?? "";
  const isMe = userId === user?._id;
  const name =
    params.name ??
    (isMe
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "You"
      : "Player");
  const positionCode = params.position ?? (isMe ? user?.position : "") ?? "";
  const isDefender = positionCode === "DF";

  const { stats, ratings, loadingStats, loadingRating, errorRating } =
    useAppSelector((state) => state.stats);
  const [season, setSeason] = useState<number | null>(null);
  const [showSeasons, setShowSeasons] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const rating = ratings[userId];
  const seasonStats = stats[statsKey(userId, season)];

  const accent = isDark ? "#00FF94" : "#00cc77";
  const cardBg = isDark ? "#0D2B1F" : "#D4F5E9";
  const surfaceBg = isDark ? "#141414" : "#fff";
  const borderColor = isDark ? "#242424" : "#efefef";
  const rowDivider = isDark ? "#1e1e1e" : "#f5f5f5";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const rowBg = isDark ? "#0D1F17" : "#EDFFF8";
  const rowBorder = isDark ? "#1a3d2b" : "#6BF8BD";

  useEffect(() => {
    if (userId) dispatch(getUserRating(userId));
  }, [dispatch, userId]);

  // Your badges include private ones; others only show what they've shared.
  const { myBadges, userBadges } = useAppSelector((state) => state.badges);
  const badges: Badge[] = isMe ? myBadges : (userBadges[userId] ?? []);
  useEffect(() => {
    if (!userId) return;
    if (isMe) dispatch(getMyBadges());
    else dispatch(getUserBadges(userId));
  }, [dispatch, userId, isMe]);

  // Tap your own badge to show it on, or hide it from, your public profile.
  const toggleShare = (badge: Badge) => {
    const title = badgeInfo(badge.badge).title;
    Alert.alert(
      badge.shared ? `Hide ${title}?` : `Share ${title}?`,
      badge.shared
        ? "Other players won't see it on your profile."
        : "Other players will see it on your profile.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: badge.shared ? "Hide" : "Share am",
          onPress: () =>
            dispatch(shareBadge({ badgeId: badge._id, shared: !badge.shared })),
        },
      ],
    );
  };

  useEffect(() => {
    if (userId) dispatch(getUserStats({ userId, season: season ?? undefined }));
  }, [dispatch, userId, season]);

  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    await Promise.all([
      dispatch(getUserRating(userId)),
      dispatch(getUserStats({ userId, season: season ?? undefined })),
    ]);
    setRefreshing(false);
  }, [dispatch, userId, season]);

  const totals = rating?.totals;
  const tiles = isDefender
    ? [
        { label: "Goals", value: totals?.goals },
        { label: "Assists", value: totals?.assists },
        { label: "Clean sheets", value: totals?.cleanSheets },
        {
          label: "Sets won",
          value: totals && `${Math.round(totals.setWinPct)}%`,
        },
      ]
    : [
        { label: "Goals", value: totals?.goals },
        { label: "Assists", value: totals?.assists },
        {
          label: "Sets won",
          value: totals && `${Math.round(totals.setWinPct)}%`,
        },
        {
          label: "Sessions won",
          value: totals && `${Math.round(totals.sessionWinPct)}%`,
        },
      ];

  // How each part of the rating is described (same formula for every position).
  const componentInfo: Record<
    RatingComponentKey,
    { title: string; detail: string }
  > = {
    contribution: {
      title: "Contribution",
      detail: `${
        isDefender
          ? "Goals + assists + clean sheets per session"
          : "Goals + assists per session"
      } · ${totals?.contributionsPerSession ?? 0}`,
    },
    setWin: {
      title: "Set win %",
      detail: `Sets won ÷ sets played · ${Math.round(totals?.setWinPct ?? 0)}%`,
    },
    sessionWin: {
      title: "Session win %",
      detail: `Sessions their team won most sets · ${Math.round(totals?.sessionWinPct ?? 0)}%`,
    },
    votes: {
      title: "Player votes",
      detail: `Avg share of session votes · ${Math.round(totals?.voteSharePct ?? 0)}%`,
    },
    experience: {
      title: "Experience",
      detail: `Sessions played · ${rating?.window.sessions ?? 0} of ${rating?.window.of ?? 20}`,
    },
  };

  const winRate =
    seasonStats && seasonStats.totalMatches > 0
      ? `${Math.round((seasonStats.wins / seasonStats.totalMatches) * 100)}%`
      : "—";
  const seasonRows = seasonStats
    ? [
        { label: "Matches played", value: seasonStats.totalMatches },
        { label: "Goals", value: seasonStats.goals },
        { label: "Assists", value: seasonStats.assists },
        ...(isDefender
          ? [{ label: "Clean sheets", value: seasonStats.cleanSheets }]
          : []),
        { label: "Wins", value: seasonStats.wins },
        { label: "Draws", value: seasonStats.draws },
        { label: "Losses", value: seasonStats.losses },
        { label: "Win rate", value: winRate },
        {
          label: "Player of the Session",
          value: seasonStats.playerOfSessionAwards,
        },
      ]
    : [];

  const seasonLabel = (s: number | null) => (s ? String(s) : "All time");

  return (
    <SafeAreaScreen className="flex-1">
      {/* Header */}
      <View className="flex-row justify-between items-center w-full px-[35px] mb-8">
        <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
          Stats
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 20,
          }}
        >
          <MaterialIcons
            name="arrow-back"
            size={15}
            color={isDark ? "#fff" : "#111"}
          />
          <ThemedText style={{ fontSize: 13, fontWeight: "500" }}>
            {isMe ? "Profile" : "Back"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF94"
            colors={["#00FF94"]}
          />
        }
      >
        <View className="w-full px-[35px] pb-10" style={{ gap: 32 }}>
          {/* Player + rating */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <InitialsAvatar name={name} size={84} />
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 22, fontWeight: "800" }}>
                {name}
              </ThemedText>
              <Text style={{ fontSize: 14, color: mutedColor, marginTop: 2 }}>
                {[
                  positionCode ? getPositionName(positionCode) : null,
                  rating
                    ? `${rating.window.sessions} session${rating.window.sessions === 1 ? "" : "s"}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#111",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                alignItems: "center",
                minWidth: 84,
              }}
            >
              {loadingRating && !rating ? (
                <ActivityIndicator color="#00FF94" />
              ) : (
                <Text
                  style={{ fontSize: 30, fontWeight: "800", color: "#00FF94" }}
                >
                  {rating?.rating != null ? rating.rating.toFixed(1) : "—"}
                </Text>
              )}
              <Text style={{ fontSize: 11, color: "#ccc", letterSpacing: 1 }}>
                RATING
              </Text>
            </View>
          </View>

          {errorRating && !rating ? (
            <Text style={{ color: mutedColor, fontSize: 13 }}>
              {errorRating}
            </Text>
          ) : rating?.rating == null && rating ? (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 10,
                padding: 14,
              }}
            >
              <ThemedText style={{ fontSize: 13, lineHeight: 19 }}>
                No rating yet — it starts after a refereed session.
              </ThemedText>
            </View>
          ) : null}

          {/* Stat tiles */}
          {rating && (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: rowBg,
                borderRadius: 16,
                paddingVertical: 18,
              }}
            >
              {tiles.map((tile) => (
                <View
                  key={tile.label}
                  style={{ flex: 1, alignItems: "center", gap: 4 }}
                >
                  <ThemedText style={{ fontSize: 22, fontWeight: "800" }}>
                    {tile.value ?? 0}
                  </ThemedText>
                  <Text
                    style={{
                      fontSize: 12,
                      color: mutedColor,
                      textAlign: "center",
                    }}
                  >
                    {tile.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* How the rating is made */}
          {rating && (
            <View style={{ gap: 12 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                How the rating is made
              </ThemedText>
              {rating.components.map((part) => {
                const info = componentInfo[part.key];
                const pct = part.max > 0 ? part.score / part.max : 0;
                return (
                  <View
                    key={part.key}
                    style={{
                      backgroundColor: rowBg,
                      borderBottomWidth: 2,
                      borderBottomColor: rowBorder,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontSize: 15, fontWeight: "700" }}>
                          {info?.title ?? part.key}
                        </ThemedText>
                        {!!info && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: mutedColor,
                              marginTop: 2,
                            }}
                          >
                            {info.detail}
                          </Text>
                        )}
                      </View>
                      <Text style={{ fontSize: 15, color: mutedColor }}>
                        <Text style={{ fontWeight: "800", color: accent }}>
                          {part.score.toFixed(1)}
                        </Text>{" "}
                        / {part.max}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: isDark ? "#1a3d2b" : "#D4F5E6",
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          width: `${Math.min(pct, 1) * 100}%`,
                          borderRadius: 4,
                          backgroundColor: "#00FF94",
                        }}
                      />
                    </View>
                  </View>
                );
              })}
              <Text style={{ fontSize: 12, color: mutedColor }}>
                Last {rating.window.of} sessions · same formula for every
                position
              </Text>
            </View>
          )}

          {/* Player of the Session + badges (design #10) */}
          {(rating || badges.length > 0) && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {rating && (
                <View
                  style={{
                    flexGrow: 1,
                    flexBasis: "45%",
                    backgroundColor: rowBg,
                    borderRadius: 16,
                    paddingVertical: 22,
                    paddingHorizontal: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <MaterialIcons name="star-outline" size={26} color={accent} />
                  <ThemedText
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    Player of the Session ×{rating.playerOfSessionAwards}
                  </ThemedText>
                </View>
              )}
              {badges.map((badge) => {
                const info = badgeInfo(badge.badge);
                return (
                  <TouchableOpacity
                    key={badge._id}
                    disabled={!isMe}
                    onPress={() => toggleShare(badge)}
                    style={{
                      flexGrow: 1,
                      flexBasis: "45%",
                      backgroundColor: "#111",
                      borderRadius: 16,
                      paddingVertical: 22,
                      paddingHorizontal: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: "#00FF94",
                        fontSize: 26,
                        fontWeight: "900",
                      }}
                    >
                      {info.code}
                    </Text>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: "700",
                        textAlign: "center",
                      }}
                    >
                      {info.title}
                      {isMe && !badge.shared ? " · private" : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Season Statistics */}
          <View style={{ gap: 16 }}>
            {/* Section header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>
                Season Statistics
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowSeasons((v) => !v)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <ThemedText style={{ fontSize: 12, fontWeight: "600" }}>
                  {seasonLabel(season)}
                </ThemedText>
                <MaterialIcons
                  name={
                    showSeasons ? "keyboard-arrow-up" : "keyboard-arrow-down"
                  }
                  size={16}
                  color={isDark ? "#aaa" : "#555"}
                />
              </TouchableOpacity>
            </View>

            {showSeasons && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {SEASONS.map((s) => {
                  const active = s === season;
                  return (
                    <TouchableOpacity
                      key={seasonLabel(s)}
                      onPress={() => {
                        setSeason(s);
                        setShowSeasons(false);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: active ? accent : borderColor,
                        backgroundColor: active ? cardBg : "transparent",
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 12,
                          fontWeight: active ? "700" : "500",
                        }}
                      >
                        {seasonLabel(s)}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Stats rows card */}
            <View
              style={{
                backgroundColor: surfaceBg,
                borderRadius: 16,
                borderWidth: 1,
                borderColor,
                overflow: "hidden",
              }}
            >
              {loadingStats && !seasonStats ? (
                <ActivityIndicator color={accent} style={{ padding: 24 }} />
              ) : seasonRows.length === 0 ? (
                <Text style={{ color: mutedColor, fontSize: 13, padding: 18 }}>
                  No stats for {seasonLabel(season)}.
                </Text>
              ) : (
                seasonRows.map((row, index) => (
                  <View
                    key={row.label}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 14,
                      paddingHorizontal: 18,
                      borderBottomWidth: index < seasonRows.length - 1 ? 1 : 0,
                      borderBottomColor: rowDivider,
                    }}
                  >
                    <ThemedText
                      lightColor="#555"
                      darkColor="#aaa"
                      style={{ fontSize: 13 }}
                    >
                      {row.label}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 14, fontWeight: "700" }}>
                      {row.value}
                    </ThemedText>
                  </View>
                ))
              )}
            </View>

            {/* Info note */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: cardBg,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <MaterialIcons name="info-outline" size={15} color={accent} />
              <ThemedText
                lightColor="#555"
                darkColor="#aaa"
                style={{ fontSize: 11, flex: 1, lineHeight: 17 }}
              >
                Only refereed sets count. Sets with no referee and disputed
                results are left out. Clean sheets are for defenders.
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
