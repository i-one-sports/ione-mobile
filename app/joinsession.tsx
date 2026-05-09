import { joinSession } from "@/api/sessions";
import BackIcon from "@/assets/svg/BackIcon";
import OpenIcon from "@/assets/svg/OpenIcon";
import PitchIcon from "@/assets/svg/PitchSvg";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import useMatchScore from "@/hooks/useMatchScore";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";
import PlayerInfoCard from "./playerinfocard";

export default function JoinSession() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [showDetails, setShowDetails] = useState(false);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const sessionData = params.session
    ? JSON.parse(params.session as string)
    : null;

  const { user } = useAppSelector((state) => state.auth);

  // Connect to session stream to get live updates for all matches in this session
  const sessionScore = useMatchScore({
    sessionId: sessionData?._id,
    onScoreUpdate: (data) => {
      console.log("Live score update received:", data);
      Toast.show({
        type: "info",
        text1: "Score Update",
        text2: `${data.teamOne.name} ${data.teamOneScore} - ${data.teamTwoScore} ${data.teamTwo.name}`,
      });
    },
    onError: (error) => {
      console.error("SSE error:", error);
      Toast.show({
        type: "error",
        text1: "SSE error",
        text2: `${error}`,
      });
    },
  });

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "Time TBD";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDuration = (timeDuration: number) => {
    if (!timeDuration) return "TBD";
    const hours = Math.floor(timeDuration / 60);
    const minutes = timeDuration % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    return `${minutes} minutes`;
  };

  const formatWinningDecider = (decider: string) => {
    const deciderMap: { [key: string]: string } = {
      penalties: "Shootout",
      highestGoals: "Highest Goals",
      goldenGoal: "Golden Goal",
      shootout: "Shootout",
    };
    return deciderMap[decider] || decider || "TBD";
  };

  const getMatchDuration = (minsPerSet: number) => {
    if (!minsPerSet) return "Golden Goal";
    return `${minsPerSet} minutes per set`;
  };

  const handleJoinSession = async () => {
    if (!sessionData?._id) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Session ID not found",
      });
      return;
    }

    setLoading(true);
    dispatch(joinSession({ sessionId: sessionData._id }))
      .unwrap()
      .then((response) => {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.message || "Successfully joined session",
        });
        router.back();
      })
      .catch((err) => {
        setLoading(false);
        const message =
          err?.msg?.message || err?.msg || "Failed to join session";
        Toast.show({
          type: "error",
          text1: "Error",
          text2: message,
        });
      });
  };

  const isMember = sessionData?.members?.some(
    (member: any) => member._id === user?._id,
  );

  if (!sessionData) {
    return (
      <SafeAreaScreen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No session data available</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-[#00FF94] px-6 py-3 rounded-[5px]"
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
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: 1,
        }}
      >
        <View className="flex flex-col gap-[31px]">
          <View className="mx-[32px] flex flex-col gap-[31px]">
            {/* Session Status with Live Connection Indicator */}
            <View className="w-full rounded-[10px] border-[1px] border-[#43B75D] bg-[#ECF8EF] p-[16px]">
              <View className="flex flex-col gap-[4px]">
                <View className="flex flex-row items-center justify-between">
                  <ThemedText
                    lightColor="#6C757D"
                    darkColor="#9BA1A6"
                    className="text-[14px] font-[600] leading-[24px] text-black"
                  >
                    {sessionData.inProgress
                      ? "Match In Progress"
                      : sessionData.finished
                        ? "Match Finished"
                        : sessionData.isFull
                          ? "Session Full"
                          : "Waiting For Players"}
                  </ThemedText>

                  {/* Live Connection Status Indicator */}
                  <View className="flex flex-row items-center gap-1">
                    <View
                      className={`w-2 h-2 rounded-full ${
                        sessionScore.connected ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <Text className="text-[10px] text-[#6D717F]">
                      {sessionScore.connected ? "Live" : "Offline"}
                    </Text>
                  </View>
                </View>

                <Text className="text-[11px] text-[#6D717F]">
                  {sessionData.members?.length || 0} /{" "}
                  {sessionData.maxNumber || 0} players joined
                </Text>

                {/* Show error if connection fails */}
                {sessionScore.error && (
                  <Text className="text-[10px] text-red-500 mt-1">
                    {sessionScore.error}
                  </Text>
                )}
              </View>
            </View>

            <View>
              <View className="flex flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                  <BackIcon />
                </TouchableOpacity>

                <View>
                  <ThemedText
                    lightColor={theme.text}
                    darkColor={theme.text}
                    className="text-[20px] font-[600]"
                  >
                    {sessionData.captain?.firstName ||
                      sessionData.captain?.username ||
                      "Session"}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  onPress={() => setShowDetails(!showDetails)}
                  activeOpacity={0.6}
                >
                  <OpenIcon />
                </TouchableOpacity>
              </View>

              <View className="mt-[5px] flex w-full flex-col items-center justify-center gap-[2px] text-center">
                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[13px] font-[400] text-black"
                >
                  {sessionData.location?.name || "Location TBD"},{" "}
                  {sessionData.location?.address || ""}
                </ThemedText>
                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[13px] font-[400] text-black"
                >
                  {formatDate(sessionData.startTime)} •{" "}
                  {formatTime(sessionData.startTime)}
                </ThemedText>
              </View>

              <View className="mx-auto mt-[45px]">
                {sessionData.isFull ? (
                  <View className="flex w-[120px] items-center justify-center rounded-[5px] bg-gray-400 p-[10px]">
                    <Text className="text-[10px] font-[400]">Session Full</Text>
                  </View>
                ) : sessionData.inProgress ? (
                  <View className="flex w-[120px] items-center justify-center rounded-[5px] bg-yellow-400 p-[10px]">
                    <Text className="text-[10px] font-[400]">In Progress</Text>
                  </View>
                ) : sessionData.finished ? (
                  <View className="flex w-[120px] items-center justify-center rounded-[5px] bg-gray-600 p-[10px]">
                    <Text className="text-[10px] font-[400] text-white">
                      Match Ended
                    </Text>
                  </View>
                ) : isMember ? (
                  <TouchableOpacity
                    className="flex w-[120px] items-center justify-center rounded-[5px] bg-primary p-[10px]"
                    onPress={() =>
                      router.push({
                        pathname: "/assigned",
                        params: {
                          session: JSON.stringify(sessionData),
                        },
                      })
                    }
                  >
                    <Text className="text-[10px] font-[400] text-white">
                      Assign Sets
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="flex w-[120px] items-center justify-center rounded-[5px] bg-primary p-[10px]"
                    onPress={handleJoinSession}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#000000" />
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

          <View className="flex flex-row items-center justify-between border-b-[1px] border-t-[1px] border-[#5c5a5a8a] px-[31px] py-[21px]">
            <View className="flex flex-row gap-[17px]">
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[15px] font-[500] text-black"
              >
                Lineups
              </ThemedText>
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[15px] font-[500] text-black"
              >
                Squad List
              </ThemedText>
            </View>
            <View>
              <PitchIcon />
            </View>
          </View>

          {/* Player Cards */}
          {sessionData.members && sessionData.members.length > 0 ? (
            sessionData.members.map((member: any, index: number) => (
              <PlayerInfoCard
                key={member._id || index}
                name={
                  member.firstName || member.username || `Player ${index + 1}`
                }
              />
            ))
          ) : (
            <View className="items-center py-10">
              <Text className="text-gray-400 text-sm">No players yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Session Details Dropdown */}
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
              left: 0,
              right: 0,
              zIndex: 300,
            }}
            className="rounded-[10px] bg-[#F2F2F2] px-[31px] py-[40px] shadow-lg"
          >
            <View className="mb-[17px] flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]">Duration:</Text>
              <Text className="text-[14px] font-[600] text-black">
                {getDuration(sessionData.timeDuration)}
              </Text>
            </View>

            <View className="mb-[17px] flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]">
                Duration per match:
              </Text>
              <Text className="text-[14px] font-[600] text-black">
                {getMatchDuration(sessionData.minsPerSet)}
              </Text>
            </View>

            <View className="mb-[17px] flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]">Match type:</Text>
              <Text className="text-[14px] font-[600] text-black capitalize">
                {sessionData.matchType || "Friendly"}
              </Text>
            </View>

            <View className="mb-[17px] flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]">
                Players per team:
              </Text>
              <Text className="text-[14px] font-[600] text-black">
                {sessionData.playersPerTeam || "TBD"}
              </Text>
            </View>

            <View className="mb-[17px] flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]">
                Number of sets:
              </Text>
              <Text className="text-[14px] font-[600] text-black">
                {sessionData.setNumber || "TBD"}
              </Text>
            </View>

            <View className="flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]">
                Winning decider:
              </Text>
              <Text className="text-[14px] font-[600] text-black">
                {formatWinningDecider(sessionData.winningDecider)}
              </Text>
            </View>
          </View>
        </>
      )}
    </SafeAreaScreen>
  );
}
