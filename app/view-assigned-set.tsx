import { getSession, getSessionSets } from "@/api/sessions";
import pitch from "@/assets/images/greenpitch.png";
import OpenIcon from "@/assets/svg/OpenIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import PlayerInfoCard from "@/app/playerinfocard";
import TeamBoxes from "@/app/teamboxes";

// ─── Pitch formation helpers ────────────────────────────────────────────────

/** Returns {left%, top%} positions for N players laid out like a real formation. */
function buildFormationPositions(
  count: number,
): { left: number; top: number }[] {
  // Each row: [top%, [left% positions]]
  // top% 90 = near own goal (GK end), top% 5 = near opponent goal
  if (count <= 0) return [];
  if (count === 1) return [{ left: 50, top: 85 }];
  if (count === 2)
    return [
      { left: 50, top: 85 },
      { left: 50, top: 10 },
    ];
  if (count === 3)
    return [
      { left: 50, top: 85 },
      { left: 50, top: 45 },
      { left: 50, top: 10 },
    ];

  // Generalised: split players into GK + rows
  const formations: Record<number, { top: number; cols: number[] }[]> = {
    4: [
      { top: 85, cols: [50] },
      { top: 55, cols: [25, 75] },
      { top: 10, cols: [50] },
    ],
    5: [
      { top: 85, cols: [50] },
      { top: 60, cols: [20, 80] },
      { top: 30, cols: [50] },
      { top: 8, cols: [50] },
    ],
    6: [
      { top: 85, cols: [50] },
      { top: 62, cols: [20, 80] },
      { top: 35, cols: [20, 80] },
      { top: 8, cols: [50] },
    ],
    7: [
      { top: 85, cols: [50] },
      { top: 62, cols: [20, 80] },
      { top: 40, cols: [15, 50, 85] },
      { top: 12, cols: [50] },
    ],
    8: [
      { top: 85, cols: [50] },
      { top: 65, cols: [15, 50, 85] },
      { top: 42, cols: [20, 80] },
      { top: 20, cols: [20, 80] },
      { top: 5, cols: [50] },
    ],
    9: [
      { top: 85, cols: [50] },
      { top: 65, cols: [15, 50, 85] },
      { top: 45, cols: [20, 80] },
      { top: 25, cols: [15, 50, 85] },
      { top: 5, cols: [50] },
    ],
    10: [
      { top: 85, cols: [50] },
      { top: 66, cols: [15, 38, 62, 85] },
      { top: 44, cols: [20, 50, 80] },
      { top: 22, cols: [20, 80] },
      { top: 5, cols: [50] },
    ],
    11: [
      { top: 85, cols: [50] },
      { top: 66, cols: [12, 37, 63, 88] },
      { top: 44, cols: [20, 50, 80] },
      { top: 22, cols: [15, 50, 85] },
      { top: 5, cols: [50] },
    ],
  };

  const capped = Math.min(count, 11);
  const tmpl = formations[capped];
  if (!tmpl)
    return Array.from({ length: count }, (_, i) => ({
      left: 50,
      top: Math.round(10 + (i / (count - 1)) * 75),
    }));

  const positions: { left: number; top: number }[] = [];
  for (const row of tmpl) {
    for (const col of row.cols) {
      positions.push({ left: col, top: row.top });
      if (positions.length === count) break;
    }
    if (positions.length === count) break;
  }
  return positions;
}

/** Resolve a player ID from a players array entry — handles both string IDs and populated objects. */
function resolvePlayerId(p: any): string {
  return typeof p === "string" ? p : (p?._id ?? "");
}

function memberInSet(setPlayers: any[], memberId: string): boolean {
  return setPlayers.some((p) => resolvePlayerId(p) === memberId);
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface Member {
  _id: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  position?: string;
  paymentStatus?: string;
  [key: string]: any;
}

interface SetDoc {
  _id: string;
  name: string;
  players: any[]; // array of ObjectId strings or populated objects
  session: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ViewAssignedSetScreen() {
  const params = useLocalSearchParams<{
    session?: string;
    sessionId?: string;
  }>();
  const staticData = params.session ? JSON.parse(params.session) : null;
  const sessionId: string = params.sessionId ?? staticData?._id ?? "";

  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<"squad" | "lineups">("squad");
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { sets, loadingSets, activeSession } = useAppSelector(
    (s) => s.sessions,
  );

  // Prefer live activeSession members (with paymentStatus), fall back to params
  const sessionData = activeSession ?? staticData;
  const members: Member[] = sessionData?.members ?? [];
  const paymentRequired = sessionData?.paymentRequired ?? false;

  const pitchName = sessionData?.location?.name ?? "Unknown Pitch";
  const pitchAddress = sessionData?.location?.address ?? "";

  // Fetch sets and fresh session data on mount
  useEffect(() => {
    if (!sessionId) return;
    dispatch(getSessionSets({ sessionId }));
    dispatch(getSession(sessionId));
  }, [dispatch, sessionId]);

  const onRefresh = async () => {
    if (!sessionId) return;
    setRefreshing(true);
    await Promise.all([
      dispatch(getSessionSets({ sessionId })),
      dispatch(getSession(sessionId)),
    ]);
    setRefreshing(false);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const safeSets: SetDoc[] = Array.isArray(sets) ? sets : [];

  const currentSet: SetDoc | null = selectedSet
    ? (safeSets.find((s) => s._id === selectedSet) ?? null)
    : null;

  const filteredMembers: Member[] = currentSet
    ? members.filter((m) => memberInSet(currentSet.players, m._id))
    : members;

  // ── Pitch players ──────────────────────────────────────────────────────────
  const playersPerTeam = sessionData?.playersPerTeam ?? 7;

  const pitchPlayers: Member[] = (() => {
    const source = currentSet
      ? members.filter((m) => memberInSet(currentSet.players, m._id))
      : members;
    const real = source.slice(0, playersPerTeam);
    const needed = playersPerTeam - real.length;
    const dummies: Member[] = Array.from({ length: needed }, (_, i) => ({
      _id: `dummy-${i}`,
      firstName: `P${i + 1}`,
      isDummy: true,
    }));
    return [...real, ...dummies];
  })();

  const pitchPositions = buildFormationPositions(pitchPlayers.length);

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
          />
        }
      >
        <View className="flex flex-col gap-[31px]">
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View className="mx-[24px] flex flex-col gap-[31px]">
            <View>
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
                  {sessionData?.matchType
                    ? sessionData.matchType.charAt(0).toUpperCase() +
                      sessionData.matchType.slice(1)
                    : "Match"}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setShowDetails(true)}
                  activeOpacity={0.6}
                >
                  <OpenIcon />
                </TouchableOpacity>
              </View>
              <View className="mt-[5px] flex w-full flex-col items-center gap-[2px]">
                <ThemedText className="text-[13px] font-[400]">
                  {pitchName}
                </ThemedText>
                <ThemedText className="text-[13px] font-[400] text-[#6D717F]">
                  {pitchAddress}
                </ThemedText>
              </View>
            </View>

            {/* No teams allocated yet — admin can only view */}
            {safeSets.length === 0 && !loadingSets && (
              <View className="items-center py-2">
                <Text className="text-[12px] text-[#6D717F] text-center">
                  No teams have been allocated yet.
                </Text>
              </View>
            )}
            {loadingSets && safeSets.length === 0 && (
              <View className="items-center py-2">
                <ActivityIndicator color="#00FF94" />
                <Text className="text-[12px] text-[#6D717F] mt-1">
                  Loading sets…
                </Text>
              </View>
            )}
          </View>

          {/* ── Team selector (shown when sets exist) ──────────────────────── */}
          {safeSets.length > 0 && (
            <View className="px-[32px]">
              <TeamBoxes
                sets={safeSets}
                selectedSet={selectedSet}
                onSelectSet={setSelectedSet}
              />
              {selectedSet && currentSet && (
                <Text className="text-center text-[12px] text-[#6D717F] mt-2">
                  {currentSet.name} · {filteredMembers.length} player
                  {filteredMembers.length !== 1 ? "s" : ""}
                </Text>
              )}
            </View>
          )}

          {/* ── Tab bar ────────────────────────────────────────────────────── */}
          <View className="flex flex-row items-center relative justify-between border-b-[1px] border-t-[1px] border-[#5c5a5a8a] px-[31px] py-[21px]">
            <View className="flex flex-row gap-[17px]">
              <Pressable onPress={() => setActiveTab("squad")} hitSlop={8}>
                <View className="relative">
                  <ThemedText
                    lightColor={activeTab === "squad" ? "#000" : "#00000060"}
                    darkColor={activeTab === "squad" ? "#FFF" : "#FFFFFF60"}
                    className="py-2 text-[15px] font-[500]"
                  >
                    Squad List
                  </ThemedText>

                  {activeTab === "squad" && (
                    <View className="absolute bottom-[-22px] h-[2px] w-full bg-[#00FF94]" />
                  )}
                </View>
              </Pressable>

              <Pressable onPress={() => setActiveTab("lineups")} hitSlop={8}>
                <View className="relative">
                  <ThemedText
                    lightColor={activeTab === "lineups" ? "#000" : "#00000060"}
                    darkColor={activeTab === "lineups" ? "#FFF" : "#FFFFFF60"}
                    className="py-2 text-[15px] font-[500]"
                  >
                    Lineups
                  </ThemedText>

                  {activeTab === "lineups" && (
                    <View className="absolute bottom-[-22px] h-[2px] w-full bg-[#00FF94]" />
                  )}
                </View>
              </Pressable>
            </View>
            <TouchableOpacity
              onPress={() => setActiveTab("lineups")}
              hitSlop={8}
            >
              <View style={{ opacity: activeTab === "lineups" ? 1 : 0.4 }}>
                <Text style={{ fontSize: 20 }}>⚽</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Squad list ─────────────────────────────────────────────────── */}
          {activeTab === "squad" && (
            <View className="flex flex-col gap-[12px]">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((player) => {
                  const playerSet = safeSets.find((s) =>
                    memberInSet(s.players, player._id),
                  );
                  return (
                    <View key={player._id} className="flex flex-col gap-[4px]">
                      <PlayerInfoCard
                        name={player.nickname ?? player.firstName ?? "Player"}
                        paymentStatus={
                          paymentRequired
                            ? (player.paymentStatus as any)
                            : undefined
                        }
                      />
                      <View className="flex flex-row justify-between px-[47px]">
                        <Text className="text-[11px] text-[#6D717F]">
                          {player.position ?? "—"}
                        </Text>
                        {safeSets.length > 0 && (
                          <Text className="text-[11px] text-[#6D717F]">
                            {playerSet?.name ?? "Unassigned"}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              ) : (
                <View className="items-center py-10">
                  <Text className="text-[14px] text-[#6D717F] text-center">
                    {selectedSet
                      ? "No players assigned to this team yet"
                      : "No players in session"}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Pitch / Lineups view ───────────────────────────────────────── */}
          {activeTab === "lineups" && (
            <View className="mx-[16px]">
              {safeSets.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-[14px] text-[#6D717F] text-center">
                    No lineups to display yet.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Pitch */}
                  <View
                    style={{
                      height: 420,
                      borderRadius: 14,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Image
                      source={pitch}
                      resizeMode="cover"
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                      }}
                    />

                    {/* Slight dark overlay for contrast */}
                    <View
                      style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: "rgba(0,0,0,0.18)",
                      }}
                    />

                    {pitchPlayers.map((player, index) => {
                      const pos = pitchPositions[index];
                      if (!pos) return null;
                      const isDummy = player.isDummy;
                      const displayName =
                        player.nickname ?? player.firstName ?? `P${index + 1}`;
                      const initial = displayName[0]?.toUpperCase() ?? "?";

                      return (
                        <View
                          key={player._id}
                          style={{
                            position: "absolute",
                            left: `${pos.left}%`,
                            top: `${pos.top}%`,
                            transform: [
                              { translateX: -22 },
                              { translateY: -22 },
                            ],
                            alignItems: "center",
                            width: 44,
                          }}
                        >
                          {/* Avatar */}
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              backgroundColor: isDummy
                                ? "rgba(255,255,255,0.25)"
                                : "#00FF94",
                              borderWidth: 2,
                              borderColor: isDummy
                                ? "rgba(255,255,255,0.4)"
                                : "#fff",
                              alignItems: "center",
                              justifyContent: "center",
                              shadowColor: "#000",
                              shadowOpacity: 0.4,
                              shadowRadius: 4,
                              elevation: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: "800",
                                color: isDummy ? "#fff" : "#000",
                              }}
                            >
                              {initial}
                            </Text>
                          </View>

                          {/* Name tag */}
                          <View
                            style={{
                              marginTop: 3,
                              backgroundColor: "rgba(0,0,0,0.72)",
                              borderRadius: 10,
                              paddingHorizontal: 5,
                              paddingVertical: 2,
                              maxWidth: 56,
                            }}
                          >
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 9,
                                color: "#fff",
                                fontWeight: "700",
                                textAlign: "center",
                              }}
                            >
                              {displayName.length > 8
                                ? `${displayName.slice(0, 7)}…`
                                : displayName}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Formation label */}
                  <View style={{ alignItems: "center", marginTop: 10 }}>
                    <Text style={{ fontSize: 12, color: "#6D717F" }}>
                      {currentSet ? `${currentSet.name} · ` : "All players · "}
                      {pitchPlayers.filter((p) => !p.isDummy).length} real
                      {pitchPlayers.some((p) => p.isDummy) &&
                        ` + ${pitchPlayers.filter((p) => p.isDummy).length} placeholder`}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Session details dropdown ──────────────────────────────────────── */}
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
              top: 200,
              left: 20,
              right: 20,
              zIndex: 300,
            }}
            className="rounded-[10px] bg-[#F2F2F2] px-[31px] py-[30px] shadow-lg"
          >
            {[
              {
                label: "Sets",
                value: sessionData?.setNumber ?? safeSets.length,
              },
              {
                label: "Players per team",
                value: sessionData?.playersPerTeam ?? "—",
              },
              {
                label: "Winning decider",
                value: sessionData?.winningDecider ?? "—",
              },
              {
                label: "Payment required",
                value: paymentRequired ? "Yes" : "No",
              },
            ].map((row) => (
              <View
                key={row.label}
                className="mb-[14px] flex flex-row justify-between"
              >
                <Text className="text-[14px] text-[#2A2A2A]">{row.label}:</Text>
                <Text className="text-[14px] font-[600] text-black">
                  {String(row.value)}
                </Text>
              </View>
            ))}

            {safeSets.length > 0 && (
              <View className="pt-[10px] border-t-[1px] border-[#D0D0D0]">
                <Text className="text-[13px] text-[#2A2A2A] mb-2 font-[600]">
                  Teams:
                </Text>
                {safeSets.map((s) => (
                  <Text key={s._id} className="text-[13px] text-black mb-1">
                    • {s.name} ({s.players.length} players)
                  </Text>
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </SafeAreaScreen>
  );
}
