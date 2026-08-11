import {
  allSessions,
  getSession,
  joinSession,
  leaveSession,
} from "@/api/sessions";
import BackIcon from "@/assets/svg/BackIcon";
import OpenIcon from "@/assets/svg/OpenIcon";
import PitchIcon from "@/assets/svg/PitchSvg";
import pitch from "@/assets/images/greenpitch.png";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import useMatchScore from "@/hooks/useMatchScore";
import { clearActiveSession } from "@/redux/reducers/sessions";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";
import PlayerInfoCard from "./playerinfocard";

function buildFormationPositions(
  count: number,
): { left: number; top: number }[] {
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

export default function JoinSession() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [showDetails, setShowDetails] = useState(false);
  const [activeView, setActiveView] = useState<"squad" | "lineups">("squad");
  const dispatch = useAppDispatch();

  // params only carries the sessionId + static display data (for the initial render skeleton)
  const params = useLocalSearchParams<{
    sessionId?: string;
    session?: string;
  }>();

  // Support both a plain sessionId param and the legacy full-session JSON param
  const staticSession = params.session ? JSON.parse(params.session) : null;
  const sessionId: string = params.sessionId ?? staticSession?._id ?? "";

  const { user } = useAppSelector((state) => state.auth);
  const { activeSession, loadingActiveSession, loadingJoin, loadingLeave } =
    useAppSelector((state) => state.sessions);

  // Fetch fresh session data from server on mount
  useEffect(() => {
    if (sessionId) dispatch(getSession(sessionId));
    return () => {
      dispatch(clearActiveSession());
    };
  }, [sessionId, dispatch]);

  // Derive everything from the server response — no manual state flags
  const session = activeSession ?? staticSession;
  const members = activeSession?.members ?? staticSession?.members ?? [];

  const isMember = members.some((m: any) => m._id === user?._id);
  const myMemberData = members.find((m: any) => m._id === user?._id);
  const myPaymentStatus = myMemberData?.paymentStatus ?? null;

  const paymentRequired = activeSession?.paymentRequired ?? false;

  // Per docs: payment records are ONLY initialized when the session fills up.
  // Only show Pay button when the backend has created a record (PENDING or FAILED).
  // null = no record yet (session not full), PAID = done, NOT_REQUIRED = free.
  const showPayButton =
    isMember &&
    paymentRequired &&
    (myPaymentStatus === "PENDING" || myPaymentStatus === "FAILED");

  const handleScoreUpdate = useCallback((data: any) => {
    Toast.show({
      type: "info",
      text1: "Score Update",
      text2: `${data.teamOne.name} ${data.teamOneScore} - ${data.teamTwoScore} ${data.teamTwo.name}`,
    });
  }, []);

  const sessionScore = useMatchScore({
    sessionId,
    onScoreUpdate: handleScoreUpdate,
  });

  const handleJoinSession = () => {
    if (!sessionId) return;
    dispatch(joinSession({ sessionId }))
      .unwrap()
      .then((response) => {
        Toast.show({
          type: "success",
          text1: "Joined!",
          text2: response.message,
        });
        // Re-fetch the session so member list + payment status reflect server state
        dispatch(getSession(sessionId));
        // Keep the sessions list fresh when user navigates back
        if (user?.location?.coordinates) {
          const [lat, lng] = user.location.coordinates;
          dispatch(allSessions({ lat, lng }));
        }
      })
      .catch((err) => {
        Toast.show({ type: "error", text1: "Error", text2: err?.msg });
      });
  };

  const handleLeaveSession = () => {
    if (!sessionId) return;
    dispatch(leaveSession(sessionId))
      .unwrap()
      .then((response) => {
        Toast.show({
          type: "success",
          text1: "Left session",
          text2: response.message,
        });
        dispatch(getSession(sessionId));
        if (user?.location?.coordinates) {
          const [lat, lng] = user.location.coordinates;
          dispatch(allSessions({ lat, lng }));
        }
      })
      .catch((err) => {
        Toast.show({ type: "error", text1: "Error", text2: err?.msg });
      });
  };

  // Helper formatters
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "Time TBD";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
      penalties: "Shootout",
      highestGoals: "Highest Goals",
      goldenGoal: "Golden Goal",
      shootout: "Shootout",
    };
    return (decider && map[decider]) || decider || "TBD";
  };

  const getMatchDuration = (minsPerSet?: number) => {
    if (!minsPerSet) return "Golden Goal";
    return `${minsPerSet} mins per set`;
  };

  const paymentStatusColor = (status?: string) => {
    switch (status) {
      case "PAID":
        return "#00FF94";
      case "PENDING":
        return "#FFB800";
      case "FAILED":
        return "#FF4444";
      case "REFUNDED":
        return "#888";
      default:
        return "#888";
    }
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
      <ScrollView
        className="mb-[40px] h-full flex-1 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      >
        <View className="flex flex-col gap-[31px]">
          <View className="mx-[32px] flex flex-col gap-[31px]">
            {/* Session status bar + live indicator */}
            <View className="w-full rounded-[10px] border-[1px] border-[#43B75D] bg-[#ECF8EF] p-[16px]">
              <View className="flex flex-col gap-[4px]">
                <View className="flex flex-row items-center justify-between">
                  <ThemedText
                    lightColor="#6C757D"
                    darkColor="#9BA1A6"
                    className="text-[14px] font-[600] leading-[24px]"
                  >
                    {session?.inProgress
                      ? "Match In Progress"
                      : session?.finished
                        ? "Match Finished"
                        : session?.isFull
                          ? "Session Full"
                          : "Waiting For Players"}
                  </ThemedText>

                  <View className="flex flex-row items-center gap-1">
                    <View
                      className={`w-2 h-2 rounded-full ${sessionScore.connected ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <Text className="text-[10px] text-[#6D717F]">
                      {sessionScore.connected ? "Live" : "Offline"}
                    </Text>
                  </View>
                </View>

                <Text className="text-[11px] text-[#6D717F]">
                  {members.length} / {session?.maxNumber || 0} players joined
                </Text>

                {sessionScore.error && (
                  <Text className="text-[10px] text-red-500 mt-1">
                    {sessionScore.error}
                  </Text>
                )}
              </View>
            </View>

            {/* Header row */}
            <View>
              <View className="flex flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                  <BackIcon />
                </TouchableOpacity>

                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[20px] font-[600]"
                >
                  {session?.captain?.firstName ||
                    session?.captain?.username ||
                    "Session"}
                </ThemedText>

                <TouchableOpacity
                  onPress={() => setShowDetails(!showDetails)}
                  activeOpacity={0.6}
                >
                  <OpenIcon />
                </TouchableOpacity>
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
              {loadingActiveSession && !activeSession && (
                <View style={{ alignItems: "center", marginTop: 20 }}>
                  <ActivityIndicator color="#00FF94" size="small" />
                </View>
              )}

              {/* Action buttons — derived purely from server data */}
              <View className="mx-auto mt-[45px]">
                {loadingActiveSession &&
                !activeSession ? null : session?.isFull && !isMember ? (
                  <View className="flex w-[120px] items-center justify-center rounded-[5px] bg-gray-400 p-[10px]">
                    <Text className="text-[10px] font-[400]">Session Full</Text>
                  </View>
                ) : session?.inProgress && !isMember ? (
                  <View className="flex w-[120px] items-center justify-center rounded-[5px] bg-yellow-400 p-[10px]">
                    <Text className="text-[10px] font-[400]">In Progress</Text>
                  </View>
                ) : session?.finished && !isMember ? (
                  <View className="flex w-[120px] items-center justify-center rounded-[5px] bg-gray-600 p-[10px]">
                    <Text className="text-[10px] font-[400] text-white">
                      Match Ended
                    </Text>
                  </View>
                ) : isMember ? (
                  <View className="flex flex-col items-center gap-[8px]">
                    {/* Assign sets */}
                    <TouchableOpacity
                      className="flex w-[120px] items-center justify-center rounded-[5px] bg-primary p-[10px]"
                      onPress={() =>
                        router.push({
                          pathname: "/assigned",
                          params: { session: JSON.stringify(session) },
                        })
                      }
                    >
                      <Text className="text-[10px] font-[400] text-black">
                        Assign Sets
                      </Text>
                    </TouchableOpacity>

                    {/* Pay Fee — only shown when server says payment is required and unpaid */}
                    {showPayButton && (
                      <TouchableOpacity
                        className="flex w-[120px] items-center justify-center rounded-[5px] bg-black p-[10px]"
                        onPress={() =>
                          router.push({
                            pathname: "/payment-screens/session-payment",
                            params: {
                              sessionId,
                              locationName: session?.location?.name ?? "",
                              startTime: session?.startTime ?? "",
                              matchType: session?.matchType ?? "",
                            },
                          })
                        }
                      >
                        <Text className="text-[10px] font-[600] text-primary">
                          Pay Fee
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Payment status badge */}
                    {paymentRequired && myPaymentStatus && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 2,
                        }}
                      >
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor:
                              paymentStatusColor(myPaymentStatus),
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 10,
                            color: paymentStatusColor(myPaymentStatus),
                          }}
                        >
                          {myPaymentStatus === "NOT_REQUIRED"
                            ? "Free"
                            : myPaymentStatus}
                        </Text>
                      </View>
                    )}

                    {/* Leave session — only before match starts */}
                    {!session?.inProgress && !session?.finished && (
                      <TouchableOpacity
                        onPress={handleLeaveSession}
                        disabled={loadingLeave}
                        style={{ marginTop: 4 }}
                      >
                        {loadingLeave ? (
                          <ActivityIndicator size="small" color="#FF4444" />
                        ) : (
                          <Text style={{ fontSize: 10, color: "#FF4444" }}>
                            Leave
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    className="flex w-[120px] items-center justify-center rounded-[5px] bg-primary p-[10px]"
                    onPress={handleJoinSession}
                    disabled={loadingJoin}
                  >
                    {loadingJoin ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text className="text-[10px] font-[400]">
                        Join session
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: "#5c5a5a8a",
              paddingHorizontal: 31,
              paddingVertical: 21,
            }}
          >
            <View style={{ flexDirection: "row", gap: 17 }}>
              {(["lineups", "squad"] as const).map((view) => {
                const label = view === "lineups" ? "Lineups" : "Squad List";
                const isActive = activeView === view;
                return (
                  <TouchableOpacity
                    key={view}
                    onPress={() => setActiveView(view)}
                  >
                    <ThemedText
                      lightColor={isActive ? "#00CC77" : theme.text}
                      darkColor={isActive ? "#00FF94" : theme.text}
                      style={{
                        fontSize: 15,
                        fontWeight: isActive ? "700" : "500",
                        borderBottomWidth: isActive ? 2 : 0,
                        borderBottomColor: "#00FF94",
                        paddingBottom: 2,
                      }}
                    >
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={() => setActiveView("lineups")}>
              <PitchIcon />
            </TouchableOpacity>
          </View>

          {activeView === "lineups" ? (
            <View style={{ marginHorizontal: 16 }}>
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
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: "rgba(0,0,0,0.18)",
                  }}
                />
                {buildFormationPositions(members.length).map((pos, i) => {
                  const member = members[i];
                  const displayName =
                    member?.nickname || member?.firstName || `P${i + 1}`;
                  const initial = displayName[0]?.toUpperCase() ?? "?";
                  return (
                    <View
                      key={i}
                      style={{
                        position: "absolute",
                        left: `${pos.left}%` as any,
                        top: `${pos.top}%` as any,
                        transform: [{ translateX: -22 }, { translateY: -22 }],
                        alignItems: "center",
                        width: 44,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: "#00FF94",
                          borderWidth: 2,
                          borderColor: "#fff",
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
                            color: "#000",
                          }}
                        >
                          {initial}
                        </Text>
                      </View>
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
            </View>
          ) : loadingActiveSession && members.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <ActivityIndicator color="#00FF94" />
            </View>
          ) : members.length > 0 ? (
            members.map((member: any, index: number) => (
              <PlayerInfoCard
                key={member._id || index}
                name={
                  member.nickname || member.firstName || `Player ${index + 1}`
                }
                paymentStatus={
                  paymentRequired ? member.paymentStatus : undefined
                }
              />
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ color: "#9BA1A6", fontSize: 14 }}>
                No players yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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
