import { getMatchups } from "@/api/matchesThunk";
import {
  acceptRefereeInvite,
  declineRefereeInvite,
  getReferees,
} from "@/api/refereesThunk";
import { getSession, getSessionSets } from "@/api/sessions";
import Polygon from "@/components/Polygon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { LngLat, distanceInMetres, formatDistance } from "@/utils/distance";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
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

// Within this distance of the pitch counts as "at the pitch". The check is
// soft: it only warns, Accept always works (the server doesn't check either).
const AT_PITCH_METRES = 300;

type PitchCheck =
  | { state: "checking" }
  | { state: "near" }
  | { state: "far"; metres: number }
  | { state: "off" }
  | { state: "unknown" };

const idOf = (value: { _id: string } | string | undefined | null) =>
  typeof value === "string" ? value : value?._id;

/** "Team A" → "TA", "Team 1" → "T1" */
const teamCode = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function RefereeInvite() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useAppDispatch();

  const { sessionId, refereeId } = useLocalSearchParams<{
    sessionId?: string;
    refereeId?: string;
  }>();
  const { user } = useAppSelector((state) => state.auth);
  const { activeSession, sets } = useAppSelector((state) => state.sessions);
  const { matchups } = useAppSelector((state) => state.matches);
  const { roster, loadingReferees, errorReferees, loadingRefereeAction } =
    useAppSelector((state) => state.referees);

  const [refreshing, setRefreshing] = useState(false);
  const [pitchCheck, setPitchCheck] = useState<PitchCheck>({
    state: "checking",
  });

  const accent = isDark ? "#00FF94" : "#00A85A";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const rowStyle = {
    backgroundColor: isDark ? "#0D1F17" : "#EDFFF8",
    borderBottomWidth: 2,
    borderBottomColor: isDark ? "#1a3d2b" : "#6BF8BD",
  };

  const loadAll = useCallback(async () => {
    if (!sessionId) return;
    await Promise.all([
      dispatch(getReferees(sessionId)),
      dispatch(getMatchups(sessionId)),
      dispatch(getSessionSets({ sessionId })),
      dispatch(getSession(sessionId)),
    ]);
  }, [dispatch, sessionId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const session = activeSession?._id === sessionId ? activeSession : null;
  const pitchCoords: LngLat | undefined = (session?.location as any)?.location
    ?.coordinates;

  // Soft "You're at the pitch" check.
  const checkPitch = useCallback(async () => {
    if (!pitchCoords) {
      setPitchCheck({ state: "unknown" });
      return;
    }
    setPitchCheck({ state: "checking" });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPitchCheck({ state: "off" });
        return;
      }
      const here = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const metres = distanceInMetres(
        [here.coords.longitude, here.coords.latitude],
        pitchCoords,
      );
      setPitchCheck(
        metres <= AT_PITCH_METRES
          ? { state: "near" }
          : { state: "far", metres },
      );
    } catch {
      setPitchCheck({ state: "off" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pitchCoords?.[0], pitchCoords?.[1]]);

  useEffect(() => {
    if (session) checkPitch();
  }, [session, checkPitch]);

  const entry = roster.find((e) => e._id === refereeId);
  const members: any[] = session?.members ?? [];
  const isPlaying = members.some((m) => m._id === user?._id);
  // 3+ teams: players referee sets their own team isn't in, so playing is fine.
  const poolMode = sets.length >= 3;

  // "Emeka (Team A captain) picked you."
  const inviter = members.find((m) => m._id === entry?.invitedBy);
  const inviterTeam = sets.find((set) =>
    set.players.some((p: any) => idOf(p) === entry?.invitedBy),
  );
  const inviterLabel = inviter
    ? `${inviter.firstName ?? inviter.nickname ?? "The captain"}${
        inviterTeam ? ` (${inviterTeam.name} captain)` : ""
      }`
    : "The captain";

  // Preview of the first game they'd referee.
  const game = matchups.find((m) => m.status !== "FINISHED");
  const teamName = (team: any) =>
    typeof team === "object"
      ? team.name
      : (sets.find((set) => set._id === team)?.name ?? "Team");
  const teamOneName = game ? teamName(game.teamOne) : "Team A";
  const teamTwoName = game ? teamName(game.teamTwo) : "Team B";
  const minsPerSet = session?.minsPerSet;
  const kickOff = session?.startTime
    ? new Date(session.startTime).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const leave = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  const handleAccept = () => {
    if (!refereeId) return;
    dispatch(acceptRefereeInvite(refereeId))
      .unwrap()
      .then(() => {
        Toast.show({
          type: "success",
          text1: "You're the referee",
          text2: "The captain will put you on a set.",
        });
      })
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Couldn't accept",
          text2: err?.msg,
        });
        if (sessionId) dispatch(getReferees(sessionId));
      });
  };

  const handleDecline = () => {
    if (!refereeId) return;
    Alert.alert(
      "Decline this invite?",
      "The captain can invite someone else.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () =>
            dispatch(declineRefereeInvite(refereeId))
              .unwrap()
              .then(leave)
              .catch((err) =>
                Toast.show({
                  type: "error",
                  text1: "Couldn't decline",
                  text2: err?.msg,
                }),
              ),
        },
      ],
    );
  };

  const pitchRow = (() => {
    switch (pitchCheck.state) {
      case "near":
        return { ok: true, text: "You're at the pitch" };
      case "far":
        return {
          ok: false,
          text: `You're ${formatDistance(pitchCheck.metres)} from the pitch`,
        };
      case "off":
        return {
          ok: false,
          text: "Location off — we can't confirm you're at the pitch",
        };
      case "unknown":
        return { ok: false, text: "We couldn't find the pitch's location" };
      default:
        return null;
    }
  })();

  const renderCheck = (
    icon: keyof typeof Ionicons.glyphMap,
    text: string,
    ok: boolean | null,
    onRetry?: () => void,
  ) => (
    <View
      style={rowStyle}
      className="flex-row items-center gap-[14px] px-[16px] py-[16px]"
    >
      <Ionicons name={icon} size={22} color={accent} />
      <ThemedText
        lightColor={theme.text}
        darkColor={theme.text}
        className="flex-1 text-[15px]"
      >
        {text}
      </ThemedText>
      {ok === null ? (
        <ActivityIndicator size="small" color={accent} />
      ) : ok ? (
        <Ionicons name="checkmark" size={22} color={accent} />
      ) : onRetry ? (
        <TouchableOpacity onPress={onRetry}>
          <Ionicons name="refresh" size={20} color="#FFB800" />
        </TouchableOpacity>
      ) : (
        <Ionicons name="alert-circle-outline" size={22} color="#FFB800" />
      )}
    </View>
  );

  const renderBody = () => {
    if (loadingReferees && !entry) {
      return (
        <ActivityIndicator
          color="#00FF94"
          size="large"
          style={{ marginTop: 80 }}
        />
      );
    }
    if (!entry) {
      return (
        <Text
          style={{
            color: mutedColor,
            fontSize: 14,
            textAlign: "center",
            marginTop: 60,
            marginHorizontal: 31,
            lineHeight: 20,
          }}
        >
          {errorReferees ?? "This invite isn't available any more."}
        </Text>
      );
    }

    const answered = entry.status !== "INVITED";

    return (
      <View className="mx-[24px] gap-[24px]">
        <View className="items-center gap-[12px]">
          <View
            className="h-[110px] w-[110px] items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? "#0D3B26" : "#D4FFF0" }}
          >
            <MaterialCommunityIcons
              name="whistle-outline"
              size={48}
              color={accent}
            />
          </View>
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="mt-[8px] text-center text-[24px] font-[800]"
          >
            {entry.status === "ACCEPTED"
              ? "You're refereeing this session"
              : entry.status === "DECLINED"
                ? "You declined this invite"
                : "Referee this session?"}
          </ThemedText>
          {!answered && (
            <Text
              style={{
                color: mutedColor,
                fontSize: 15,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              {inviterLabel} picked you. You won&apos;t play — you run the set
              clock and record goals.
            </Text>
          )}
        </View>

        {/* The set they'd referee first */}
        <View
          className="gap-[16px] rounded-[16px] p-[20px]"
          style={{ backgroundColor: isDark ? "#111" : "#fff" }}
        >
          <View className="flex-row items-start justify-between">
            {[teamOneName, teamTwoName].map((name, i) => (
              <React.Fragment key={name + i}>
                <View className="w-[90px] items-center gap-[8px]">
                  <Polygon teamCode={teamCode(name)} size={56} />
                  <ThemedText
                    lightColor={theme.text}
                    darkColor={theme.text}
                    className="text-[15px]"
                  >
                    {name}
                  </ThemedText>
                </View>
                {i === 0 && (
                  <View className="items-center pt-[6px]">
                    <ThemedText
                      lightColor={theme.text}
                      darkColor={theme.text}
                      style={{
                        fontSize: 30,
                        fontWeight: "800",
                        lineHeight: 36,
                      }}
                    >
                      0–0
                    </ThemedText>
                    <View
                      className="mt-[4px] h-[3px] w-[56px] rounded-full"
                      style={{ backgroundColor: isDark ? "#fff" : "#111" }}
                    />
                    {!!minsPerSet && (
                      <View className="mt-[8px] flex-row items-center gap-[4px]">
                        <Ionicons
                          name="time-outline"
                          size={15}
                          color={mutedColor}
                        />
                        <Text style={{ fontSize: 13, color: mutedColor }}>
                          {String(minsPerSet).padStart(2, "0")}:00
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
          <View
            className="flex-row justify-between border-t pt-[14px]"
            style={{ borderColor: isDark ? "#222" : "#E5E7EB" }}
          >
            <Text style={{ color: mutedColor, fontSize: 13 }}>
              {minsPerSet ? `${minsPerSet} mins per set` : ""}
            </Text>
            <Text style={{ color: mutedColor, fontSize: 13 }}>{kickOff}</Text>
          </View>
        </View>

        {!answered && (
          <>
            <View className="gap-[12px]">
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[17px] font-[700]"
              >
                Before you start
              </ThemedText>
              {pitchRow
                ? renderCheck(
                    "location-outline",
                    pitchRow.text,
                    pitchRow.ok,
                    pitchRow.ok ? undefined : checkPitch,
                  )
                : renderCheck(
                    "location-outline",
                    "Checking your location…",
                    null,
                  )}
              {renderCheck(
                "eye-outline",
                !isPlaying
                  ? "You're not playing in this session"
                  : poolMode
                    ? "You'll only referee sets your team isn't playing"
                    : "You're on a team in this session",
                !isPlaying || poolMode,
              )}
            </View>

            <View className="gap-[12px]">
              <View className="flex-row gap-[12px]">
                <View className="flex-1">
                  <CustomButton
                    title="Decline"
                    onPress={handleDecline}
                    disabled={loadingRefereeAction}
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
                    title="Accept"
                    onPress={handleAccept}
                    loading={loadingRefereeAction}
                    disabled={loadingRefereeAction}
                    style={{ borderRadius: 10, paddingVertical: 18 }}
                    titleStyle={{ color: "#000", fontWeight: "700" }}
                  />
                </View>
              </View>
              <Text
                style={{ color: mutedColor, fontSize: 13, textAlign: "center" }}
              >
                You&apos;ll be recorded as the referee for this session
              </Text>
            </View>
          </>
        )}

        {answered && (
          <CustomButton
            primary
            title={
              entry.status === "ACCEPTED" ? "Open referee controls" : "Done"
            }
            onPress={() =>
              entry.status === "ACCEPTED" && sessionId
                ? router.replace({
                    pathname: "/match/referee",
                    params: { sessionId },
                  })
                : leave()
            }
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
            Referee Invite
          </ThemedText>
          <View style={{ width: 22 }} />
        </View>

        {renderBody()}
      </ScrollView>
    </SafeAreaScreen>
  );
}
