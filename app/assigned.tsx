import { createSets, getSessionSets } from "@/api/sessions";
import pitch from "@/assets/images/greenpitch.png";
import BackIcon from "@/assets/svg/BackIcon";
import OpenIcon from "@/assets/svg/OpenIcon";
import PitchIcon from "@/assets/svg/PitchSvg";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import PlayerInfoCard from "./playerinfocard";
import TeamBoxes from "./teamboxes";

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  position: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  height: number;
  [key: string]: any;
}

interface Set {
  _id: string;
  name: string;
  players: string[];
  session: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionData {
  _id: string;
  matchType: string;
  location: {
    name: string;
    address: string;
    [key: string]: any;
  };
  members: Member[];
  setNumber: number;
  playersPerTeam: number;
  winningDecider: string;
  [key: string]: any;
}

export default function Assigned() {
  const params = useLocalSearchParams();
  const data: SessionData | null = params.session
    ? JSON.parse(params.session as string)
    : null;
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("squad"); // Start with squad view
  const [selectedSet, setSelectedSet] = useState<string | null>(null);

  // Select sets from Redux
  const { sets, loadingSets, errorSets, creatingSet } = useAppSelector(
    (state) => state.sessions,
  );
  // console.log('players',sets[0].players)
  // ⭐️ Extract dynamic data
  const pitchName = data?.location?.name ?? "Unknown Pitch";
  const pitchAddress = data?.location?.address ?? "Unknown Address";
  const sessionId = data?._id;

  const members = data?.members || [];

  // Fixed positions for 7 players (simple formation)
  const pitchPositions = [
    // GK - Back center
    { left: 50, top: 80 },
    // DF - Back left
    { left: 25, top: 67 },
    // DF - Back right
    { left: 75, top: 67 },
    // MF - Middle left
    { left: 20, top: 40 },
    // MF - Center
    { left: 50, top: 40 },
    // MF - Middle right
    { left: 80, top: 40 },
    // ST - Front center
    { left: 50, top: 10 },
  ];

  // Dummy player data for empty sets
  const dummyPlayers = [
    { _id: "dummy-1", firstName: "Player 1", position: "GK", isDummy: true },
    { _id: "dummy-2", firstName: "Player 2", position: "DF", isDummy: true },
    { _id: "dummy-3", firstName: "Player 3", position: "DF", isDummy: true },
    { _id: "dummy-4", firstName: "Player 4", position: "MF", isDummy: true },
    { _id: "dummy-5", firstName: "Player 5", position: "MF", isDummy: true },
    { _id: "dummy-6", firstName: "Player 6", position: "MF", isDummy: true },
    { _id: "dummy-7", firstName: "Player 7", position: "ST", isDummy: true },
  ];

  // Fetch sets when component mounts
  useEffect(() => {
    if (sessionId) {
      dispatch(getSessionSets({ sessionId }));
    }
  }, [dispatch, sessionId]);

  // Handle creating sets
  const handleCreateSets = async () => {
    if (!sessionId) {
      Toast.show({
        type: "error",
        props: {
          title: "Error",
          message: "Session ID not found",
        },
      });
      return;
    }

    dispatch(createSets({ sessionId }))
      .unwrap()
      .then((response) => {
        console.log("Sets created:", response);
        Toast.show({
          type: "success",
          props: {
            title: "Success",
            message: "Sets created successfully",
          },
        });
        dispatch(getSessionSets({ sessionId }));
      })
      .catch((err) => {
        console.log("Error creating sets:", err);
        const message =
          err?.msg?.message || err?.msg || "Failed to create sets";
        Toast.show({
          type: "error",
          props: {
            title: "Error",
            message: message,
          },
        });
      });
  };

  // Filter players by selected set
  const getFilteredPlayers = (): Member[] => {
    if (!selectedSet || sets.length === 0) {
      return members;
    }

    const currentSet = sets.find((s: Set) => s._id === selectedSet);
    if (!currentSet) return [];

    // Get player IDs from the selected set
    const playerIdsInSet = currentSet.players;

    // Filter members who are in the selected set's players array
    return members.filter((member) =>
      currentSet.players.some((p: any) => p._id === member._id),
    );
  };

  // Get players for pitch display
  const getPlayersForPitch = () => {
    if (selectedSet) {
      const currentSet = sets.find((s: Set) => s._id === selectedSet);
      if (!currentSet) return [];

      // Get real players from selected set
      const realPlayers = members.filter((member) =>
        currentSet.players.some((p: any) => p._id === member._id),
      );

      // If we have real players, show them
      if (realPlayers.length > 0) {
        // Always show exactly 7 players (real + dummy if needed)
        const displayPlayers = [...realPlayers];
        const neededDummies = 7 - displayPlayers.length;

        for (let i = 0; i < neededDummies; i++) {
          displayPlayers.push({
            ...dummyPlayers[i],
            _id: `dummy-${Date.now()}-${i}`,
            isDummy: true,
          });
        }

        return displayPlayers.slice(0, 7);
      }

      // If no real players in set, show dummy players
      return dummyPlayers;
    }

    // If no set selected, show all members with dummy players if needed
    const displayPlayers = [...members];
    const neededDummies = Math.max(0, 7 - displayPlayers.length);

    for (let i = 0; i < neededDummies; i++) {
      displayPlayers.push({
        ...dummyPlayers[i],
        _id: `dummy-${Date.now()}-${i}`,
        isDummy: true,
      });
    }

    return displayPlayers.slice(0, 7);
  };

  const filteredMembers = getFilteredPlayers();
  const pitchPlayers = getPlayersForPitch();

  // Group filtered players by position
  const goalkeepers = filteredMembers.filter(
    (p: Member) => p.position === "GK",
  );
  const defenders = filteredMembers.filter((p: Member) => p.position === "DF");
  const midfielders = filteredMembers.filter(
    (p: Member) => p.position === "MF",
  );
  const strikers = filteredMembers.filter((p: Member) => p.position === "ST");

  // Get current set name
  const currentSetName = selectedSet
    ? sets.find((s: Set) => s._id === selectedSet)?.name
    : null;

  return (
    <SafeAreaScreen>
      <ScrollView
        className="mb-[40px] h-full flex-1 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      >
        <View className="flex flex-col gap-[31px]">
          <View className="mx-[32px] flex flex-col gap-[31px]">
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
                    {data?.matchType?.toUpperCase() ?? "Match"}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  onPress={() => setShowDetails(true)}
                  activeOpacity={0.6}
                >
                  <OpenIcon />
                </TouchableOpacity>
              </View>

              <View className="mt-[5px] flex w-full flex-col items-center justify-center gap-[2px] text-center">
                <ThemedText className="text-[13px] font-[400] text-black">
                  {pitchName}
                </ThemedText>
                <ThemedText className="text-[13px] font-[400] text-black">
                  {pitchAddress}
                </ThemedText>
              </View>
            </View>

            {/* Create Sets Button */}
            {sets.length === 0 && !loadingSets && (
              <TouchableOpacity
                onPress={handleCreateSets}
                disabled={creatingSet}
                className="bg-[#00FF94] rounded-lg py-3 px-4 items-center"
                activeOpacity={0.7}
              >
                {creatingSet ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-[600] text-[16px]">
                    Create Sets
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View className="flex flex-row items-center justify-between border-b-[1px] border-t-[1px] border-[#5c5a5a8a] px-[31px] py-[21px]">
            <View className="flex flex-row gap-[17px]">
              <Pressable onPress={() => setActiveTab("squad")}>
                <ThemedText
                  lightColor={activeTab === "squad" ? "#000" : "#00000080"}
                  className={`py-2 text-[15px] ${
                    activeTab === "squad"
                      ? "border-b-[3px] border-[#00FF94]"
                      : ""
                  } font-[500]`}
                >
                  Squad List
                </ThemedText>
              </Pressable>

              <Pressable onPress={() => setActiveTab("lineups")}>
                <ThemedText
                  lightColor={activeTab === "lineups" ? "#000" : "#00000080"}
                  className={`py-2 text-[15px] ${
                    activeTab === "lineups"
                      ? "border-b-[3px] border-[#00FF94]"
                      : ""
                  } font-[500]`}
                >
                  Lineups
                </ThemedText>
              </Pressable>
            </View>

            <TouchableOpacity onPress={() => setActiveTab("lineups")}>
              <PitchIcon />
            </TouchableOpacity>
          </View>

          {/* Display Sets Loading */}
          {loadingSets && (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color="#00FF94" />
              <Text className="mt-2 text-[14px] text-[#2A2A2A]">
                Loading sets...
              </Text>
            </View>
          )}

          <View>
            {/* ✅ PITCH VIEW - Only shows when PitchIcon is clicked (activeTab === 'lineups') */}
            {activeTab === "lineups" && (
              <View className="mx-[31px] mt-6">
                {/* Team Filter Boxes - Show for pitch view too */}
                {sets.length > 0 && (
                  <View className="mb-[20px]">
                    <TeamBoxes
                      sets={sets}
                      selectedSet={selectedSet}
                      onSelectSet={setSelectedSet}
                    />
                    {selectedSet && currentSetName && (
                      <View className="px-[32px] mt-3">
                        <Text className="text-[14px] font-[600] text-[#2A2A2A] text-center">
                          {currentSetName}
                        </Text>
                        <Text className="text-[12px] text-[#2A2A2A] text-center mt-1">
                          {filteredMembers.length}{" "}
                          {filteredMembers.length === 1 ? "player" : "players"}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Show message if no sets created yet */}
                {sets.length === 0 && !loadingSets && (
                  <View className="px-[32px] py-8 items-center">
                    <Text className="text-[16px] text-[#2A2A2A] text-center">
                      Create sets first to view lineups on pitch.
                    </Text>
                  </View>
                )}

                {/* PITCH VIEW */}
                <View className="relative h-[400px] w-full rounded-[12px] overflow-hidden bg-green-800">
                  <Image
                    source={pitch}
                    resizeMode="cover"
                    className="absolute h-full w-full"
                  />

                  {/* Show players on pitch */}
                  {pitchPlayers.map((player: any, index: number) => {
                    const position = pitchPositions[index];
                    const isDummy = player.isDummy;

                    // Get display name
                    const displayName =
                      player.nickname ||
                      player.firstName ||
                      `Player ${index + 1}`;

                    // Get initials for avatar
                    const initials =
                      player.nickname?.[0]?.toUpperCase() ||
                      player.firstName?.[0]?.toUpperCase() ||
                      "P";

                    return (
                      <View
                        key={player._id || `dummy-${index}`}
                        style={{
                          position: "absolute",
                          top: `${position.top}%`,
                          left: `${position.left}%`,
                          transform: [{ translateX: -20 }, { translateY: -20 }],
                        }}
                        className="items-center"
                      >
                        {/* Player Avatar */}
                        <View className="relative">
                          <View
                            className={`h-[40px] w-[40px] rounded-full ${isDummy ? "bg-gray-300" : "bg-white"} border-2 ${isDummy ? "border-gray-500" : "border-green-600"} items-center justify-center shadow-lg`}
                          >
                            <Text className="text-[16px] font-bold text-gray-800">
                              {initials}
                            </Text>
                          </View>
                        </View>

                        {/* Player Name */}
                        <View className="mt-2 items-center">
                          <Text className="text-[12px] font-bold text-white bg-black/70 px-2 py-1 rounded-full min-w-[60px] text-center">
                            {displayName.length > 8
                              ? `${displayName.substring(0, 8)}...`
                              : displayName}
                          </Text>
                          {!isDummy && player.position && (
                            <Text className="text-[10px] text-gray-200 mt-1">
                              {player.position}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}

                  {/* Show message if no real players */}
                  {selectedSet &&
                    filteredMembers.length === 0 &&
                    !loadingSets && (
                      <View className="flex-1 items-center justify-center bg-black/30">
                        <Text className="text-white text-sm font-semibold">
                          No players in this team
                        </Text>
                        <Text className="text-gray-300 text-xs mt-1">
                          Dummy players shown for layout
                        </Text>
                      </View>
                    )}
                </View>

                {/* Formation Info */}
                <View className="mt-4 items-center">
                  <Text className="text-gray-700 text-sm font-bold">
                    Formation: 2-3-1
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    {selectedSet
                      ? `${filteredMembers.length} real players • ${7 - filteredMembers.length} dummy players`
                      : `${members.length} real players • ${7 - members.length} dummy players`}
                  </Text>
                </View>
              </View>
            )}

            {/* ✅ SQUAD LIST - Default view */}
            {activeTab === "squad" && (
              <View className="flex flex-col gap-[20px] w-full">
                {/* Team Filter for Squad List */}
                {sets.length > 0 && (
                  <View className="mb-[10px]">
                    <TeamBoxes
                      sets={sets}
                      selectedSet={selectedSet}
                      onSelectSet={setSelectedSet}
                    />
                    {selectedSet && currentSetName && (
                      <View className="px-[32px] mt-3">
                        <Text className="text-[14px] font-[600] text-[#2A2A2A] text-center">
                          {currentSetName}
                        </Text>
                        <Text className="text-[12px] text-[#2A2A2A] text-center mt-1">
                          {filteredMembers.length}{" "}
                          {filteredMembers.length === 1 ? "player" : "players"}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {filteredMembers.length > 0 ? (
                  filteredMembers.map((player: Member) => {
                    // Find which set this player belongs to
                    const playerSet = sets.find((s: Set) =>
                      s.players.some((p: any) => p._id === player._id),
                    );
                    console.log("members", playerSet);
                    return (
                      <View
                        key={player._id}
                        className="flex flex-col gap-[10px] px-[32px]"
                      >
                        <PlayerInfoCard
                          name={player.nickname || player.firstName}
                        />
                        <View className="flex flex-row justify-between items-center">
                          <Text className="text-[12px] text-[#2A2A2A]">
                            Position: {player.position}
                          </Text>
                          {sets.length > 0 && (
                            <Text className="text-[12px] text-[#2A2A2A]">
                              Team: {playerSet?.name || "Unassigned"}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View className="px-[32px] py-8 items-center">
                    <Text className="text-[16px] text-[#2A2A2A] text-center">
                      {selectedSet
                        ? `No players in ${currentSetName} - Dummy data shown on pitch`
                        : "No players available"}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

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
            }}
          />

          {/* DROPDOWN PANEL */}
          <View
            style={{
              position: "absolute",
              top: 250,
              left: 0,
              right: 0,
              zIndex: 300,
            }}
            className="rounded-[10px] bg-[#F2F2F2] px-[31px] py-[40px] shadow-lg mx-[20px]"
          >
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]">Sets:</Text>
              <Text className="text-[14px] font-[600] text-primary">
                {data?.setNumber}
              </Text>
            </View>

            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]">
                Players per team:
              </Text>
              <Text className="text-[14px] font-[600] text-primary">
                {data?.playersPerTeam}
              </Text>
            </View>

            <View className="mb-2 flex flex-row justify-between">
              <ThemedText className="text-[14px] text-[#2A2A2A]">
                Winning decider:
              </ThemedText>
              <ThemedText className="text-[14px] font-[600] text-primary">
                {data?.winningDecider}
              </ThemedText>
            </View>

            {sets.length > 0 && (
              <View className="mt-[10px] pt-[10px] border-t-[1px] border-[#D0D0D0]">
                <Text className="text-[14px] text-[#2A2A2A] mb-2">
                  Created Sets:
                </Text>
                {sets.map((set: Set) => (
                  <Text key={set._id} className="text-[13px] text-black mb-1">
                    • {set.name} ({set.players.length} players)
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
