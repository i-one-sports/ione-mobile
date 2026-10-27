import { assignReferee, getMatch } from "@/api/matchesThunk";
import { getReferees } from "@/api/refereesThunk";
import { getSession, getSessionSets } from "@/api/sessions";
import Polygon from "@/components/Polygon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import InitialsAvatar from "@/components/match/InitialsAvatar";
import { Match } from "@/components/typings/match";
import CustomButton from "@/components/ui/CustomButton";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { teamPlayerIds } from "@/utils/teamPlayers";
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

// Design #5: you've been handed the whistle for a set. Accept opens the
// referee controls (you're already assigned); Pass it on hands it to someone
// else on the referee list who isn't playing that set.
export default function TakeWhistle() {
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

  const [showPass, setShowPass] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const accent = isDark ? "#00FF94" : "#00A85A";
  const mutedColor = isDark ? "#9BA1A6" : "#6D717F";
  const rowStyle = {
    backgroundColor: isDark ? "#0D1F17" : "#EDFFF8",
    borderBottomWidth: 2,
    borderBottomColor: isDark ? "#1a3d2b" : "#6BF8BD",
  };

  const loadAll = useCallback(async () => {
    if (!sessionId || !matchId) return;
    await Promise.all([
      dispatch(getSession(sessionId)),
      dispatch(getSessionSets({ sessionId })),
      dispatch(getReferees(sessionId)),
      dispatch(getMatch(matchId)),
    ]);
  }, [dispatch, sessionId, matchId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const session = activeSession?._id === sessionId ? activeSession : null;
  const match = currentMatch?._id === matchId ? currentMatch : null;

  const teamName = (team: Match["teamOne"] | undefined) =>
    typeof team === "object"
      ? team.name
      : (sets.find((set) => set._id === team)?.name ?? "Team");
  const playersOf = (team: Match["teamOne"] | undefined) =>
    teamPlayerIds(team, sets);
  const playingIds = match
    ? [...playersOf(match.teamOne), ...playersOf(match.teamTwo)]
    : [];

  const myEntryIds = roster
    .filter(
      (e) =>
        e.status === "ACCEPTED" &&
        ((e.mode === "OWN_PHONE" && idOf(e.user as any) === user?._id) ||
          (e.mode === "CAPTAIN_DEVICE" && e.deviceOwner === user?._id)),
    )
    .map((e) => e._id);
  const isMine = Boolean(match?.referee && myEntryIds.includes(match.referee));
  const myTeam = sets.find((set) =>
    set.players.some((p: any) => idOf(p) === user?._id),
  );

  const nameOf = (entryId: string) => {
    const entry = roster.find((e) => e._id === entryId);
    if (!entry) return "Referee";
    if (entry.guestName) return entry.guestName;
    if (typeof entry.user === "object") return personName(entry.user);
    const member = (session?.members as any[] | undefined)?.find(
      (m) => m._id === entry.user,
    );
    return personName(member);
  };

  // Who else can take it: accepted, not playing this set, not me.
  const passOptions = roster
    .filter(
      (e) =>
        e.status === "ACCEPTED" &&
        !myEntryIds.includes(e._id) &&
        !playingIds.includes(idOf(e.user as any) ?? ""),
    )
    .map((e) => {
      const userId = idOf(e.user as any);
      return {
        id: e._id,
        name: nameOf(e._id),
        team: userId
          ? sets.find((set) => set.players.some((p: any) => idOf(p) === userId))
              ?.name
          : "Referee mode",
      };
    });

  const handleAccept = () => {
    if (!sessionId) return;
    router.replace({ pathname: "/match/referee", params: { sessionId } });
  };

  const handlePass = (refereeId: string) => {
    if (!match) return;
    dispatch(assignReferee({ matchId: match._id, refereeId }))
      .unwrap()
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Whistle passed on",
          text2: `${nameOf(refereeId)} referees Set ${match.sequence}`,
        });
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)");
      })
      .catch((err) =>
        Toast.show({
          type: "error",
          text1: "Couldn't pass it on",
          text2: err?.msg,
        }),
      );
  };

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

    if (!isMine || match.status === "FINISHED") {
      return (
        <View className="mx-[31px] mt-[60px] items-center gap-[16px]">
          <Text
            style={{
              color: mutedColor,
              fontSize: 14,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {match.status === "FINISHED"
              ? `Set ${match.sequence} has finished.`
              : `Set ${match.sequence} has a different referee now.`}
          </Text>
          <CustomButton
            primary
            title="Back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/(tabs)")
            }
            style={{ borderRadius: 10, paddingVertical: 16 }}
            titleStyle={{ color: "#000", fontWeight: "700" }}
          />
        </View>
      );
    }

    const teamOneName = teamName(match.teamOne);
    const teamTwoName = teamName(match.teamTwo);

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
            className="mt-[8px] text-[26px] font-[800]"
          >
            Take the whistle
          </ThemedText>
          <Text
            style={{
              color: mutedColor,
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            {myTeam
              ? "Your team isn't playing this set, so one of you officiates it."
              : `You're refereeing Set ${match.sequence}.`}
          </Text>
        </View>

        {/* The set they'll referee */}
        <View
          className="flex-row items-start justify-between rounded-[16px] p-[20px]"
          style={{ backgroundColor: isDark ? "#111" : "#fff" }}
        >
          <View className="w-[90px] items-center gap-[8px]">
            <Polygon teamCode={teamCode(teamOneName)} size={56} />
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[15px]"
            >
              {teamOneName}
            </ThemedText>
          </View>
          <View className="items-center pt-[6px]">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              style={{ fontSize: 30, fontWeight: "800", lineHeight: 36 }}
            >
              {match.teamOneScore}–{match.teamTwoScore}
            </ThemedText>
            <View
              className="mt-[4px] h-[3px] w-[56px] rounded-full"
              style={{ backgroundColor: isDark ? "#fff" : "#111" }}
            />
            <View className="mt-[8px] flex-row items-center gap-[4px]">
              <Ionicons name="time-outline" size={15} color={mutedColor} />
              <Text style={{ fontSize: 13, color: mutedColor }}>
                {String(session?.minsPerSet ?? 10).padStart(2, "0")}:00
              </Text>
            </View>
          </View>
          <View className="w-[90px] items-center gap-[8px]">
            <Polygon teamCode={teamCode(teamTwoName)} size={56} />
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[15px]"
            >
              {teamTwoName}
            </ThemedText>
          </View>
        </View>

        {/* As referee you */}
        <View className="gap-[12px]">
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="text-[17px] font-[700]"
          >
            As referee you
          </ThemedText>
          {[
            "Run the match clock",
            "Record goals and scorers",
            "Pass the whistle when you play",
          ].map((line, i) => (
            <View
              key={line}
              style={rowStyle}
              className="flex-row items-center gap-[14px] px-[16px] py-[16px]"
            >
              <View className="h-[28px] w-[28px] items-center justify-center rounded-full bg-[#00FF94]">
                <Text className="text-[13px] font-[800] text-black">
                  {i + 1}
                </Text>
              </View>
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[15px]"
              >
                {line}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Pass it on */}
        {showPass && (
          <View className="gap-[10px]">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[17px] font-[700]"
            >
              Pass it on
            </ThemedText>
            {passOptions.length === 0 ? (
              <Text style={{ color: mutedColor, fontSize: 13, lineHeight: 19 }}>
                No one else on the referee list is free for this set. Ask your
                captain to invite a teammate.
              </Text>
            ) : (
              passOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  disabled={loadingMatchAction}
                  onPress={() => handlePass(option.id)}
                  style={rowStyle}
                  className="flex-row items-center gap-[14px] px-[16px] py-[13px]"
                >
                  <InitialsAvatar name={option.name} />
                  <View className="flex-1">
                    <ThemedText
                      lightColor={theme.text}
                      darkColor={theme.text}
                      className="text-[15px] font-[600]"
                    >
                      {option.name}
                    </ThemedText>
                    {!!option.team && (
                      <Text style={{ fontSize: 12, color: mutedColor }}>
                        {option.team}
                      </Text>
                    )}
                  </View>
                  {loadingMatchAction ? (
                    <ActivityIndicator size="small" color={accent} />
                  ) : (
                    <MaterialCommunityIcons
                      name="whistle-outline"
                      size={20}
                      color={accent}
                    />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View className="flex-row gap-[12px]">
          <View className="flex-1">
            <CustomButton
              title={showPass ? "Keep it" : "Pass it on"}
              onPress={() => setShowPass((v) => !v)}
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
        {/* Banner */}
        {match && isMine && (
          <View className="mx-[24px] mb-[24px] gap-[4px] rounded-[12px] border-[1.5px] border-[#43B75D] bg-[#ECF8EF] p-[16px]">
            <Text className="text-[15px] font-[700] text-[#111]">
              You&apos;re the referee
            </Text>
            <Text className="text-[13px] text-[#6D717F]">
              {myTeam
                ? `${myTeam.name} officiates Set ${match.sequence}`
                : `You officiate Set ${match.sequence}`}
            </Text>
          </View>
        )}

        {renderBody()}
      </ScrollView>
    </SafeAreaScreen>
  );
}
