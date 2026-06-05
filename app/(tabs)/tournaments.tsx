import { getTournamentsByLocation } from "@/api/tournamentThunk";
import { nearByLocation } from "@/api/sessions";
import { getLocation } from "@/api/ownerDashboardThunk";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import CalendarIcon from "@/assets/svg/CalendarIcon";
import CloseIcon from "@/assets/svg/CloseIcon";
import LocationIcon from "@/assets/svg/LocationIcon";
import OpenIcon from "@/assets/svg/OpenIcon";
import PlusIcon from "@/assets/svg/PlusIcon";
import TournamentIcon from "@/assets/svg/TournamentIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type DateItem = {
  id: number;
  dateNumber: string;
  dayName: string;
  isToday: boolean;
};

export default function TournamentScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [isExpanded, setIsExpanded] = useState(true);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { pitches } = useAppSelector((state) => state.sessions);
  const { location } = useAppSelector((state) => state.ownerDashboard);

  const { tournamentsByLocation } = useAppSelector((state) => state.tournament);

  useEffect(() => {
    if (!user?.location?.coordinates) return;
    const [lng, lat] = user.location.coordinates;

    dispatch(nearByLocation({ lat, lng }));
  }, [dispatch, user?.location?.coordinates]);

  useEffect(() => {
    if (!pitches || pitches.length === 0) return;
    const nearestLocationId = pitches[0]._id;

    dispatch(getTournamentsByLocation(nearestLocationId));
  }, [dispatch, pitches]);

  useEffect(() => {
    dispatch(getLocation());
  }, [dispatch]);

  console.log("location", location);
  console.log("result", tournamentsByLocation);
  const dates = useMemo<DateItem[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 30 }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() + index);

      return {
        id: date.getTime(),
        dateNumber: `${date.getDate()}`,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        isToday: date.getTime() === today.getTime(),
      };
    });
  }, []);

  const CalendarPolygon = ({
    date,
    day,
    isActive,
    isToday,
  }: {
    date: string;
    day: string;
    isActive: boolean;
    isToday: boolean;
  }) => (
    <TouchableOpacity className="items-center gap-1">
      <View className="h-[51px] w-[51px] items-center justify-center">
        {isActive ? (
          <View className="relative h-full w-full">
            <Image
              source={require("@/assets/images/activepolygon.png")}
              resizeMode="contain"
              className="h-full w-full"
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-base font-semibold text-black">{date}</Text>
            </View>
          </View>
        ) : (
          <View className="relative h-full w-full">
            <Image
              source={require("@/assets/images/inactivepolygon.png")}
              resizeMode="contain"
              className="h-full w-full"
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-base font-semibold text-[#929292]">
                {date}
              </Text>
            </View>
          </View>
        )}
      </View>
      <ThemedText
        lightColor={theme.text}
        darkColor={theme.text}
        className="px-4 text-center text-base leading-6"
      >
        {day}
      </ThemedText>
      {isToday && (
        <Text className="text-xs font-medium text-[#00FF94]">Today</Text>
      )}
    </TouchableOpacity>
  );

  const tournamentSessions = [
    {
      _id: "victoria-island-cup-1",
      tournamentName: "Island Champions Cup",
      captain: { _id: "captain-1", firstName: "Lagos", username: "Lagos FC" },
      location: {
        name: "Victoria Island",
        address: "Victoria Island, Lagos",
      },
      startTime: new Date().toISOString(),
      timeDuration: 90,
      minsPerSet: 30,
      matchType: "tournament",
      playersPerTeam: 5,
      setNumber: 3,
      winningDecider: "highestGoals",
      maxNumber: 10,
      members: [
        { _id: "player-1", firstName: "Team Alpha" },
        { _id: "player-2", firstName: "Team Beta" },
      ],
      inProgress: false,
      finished: false,
      isFull: false,
      teams: {
        teamOne: "Team Alpha",
        teamTwo: "Team Beta",
      },
    },
    {
      _id: "victoria-island-cup-2",
      tournamentName: "VI Night League",
      captain: { _id: "captain-2", firstName: "Island", username: "Island FC" },
      location: {
        name: "Victoria Island",
        address: "Victoria Island, Lagos",
      },
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      timeDuration: 60,
      minsPerSet: 20,
      matchType: "tournament",
      playersPerTeam: 6,
      setNumber: 3,
      winningDecider: "goldenGoal",
      maxNumber: 12,
      members: [
        { _id: "player-3", firstName: "VI Strikers" },
        { _id: "player-4", firstName: "Marina FC" },
      ],
      inProgress: false,
      finished: false,
      isFull: false,
      teams: {
        teamOne: "VI Strikers",
        teamTwo: "Marina FC",
      },
    },
  ];

  const openTournament = (session: (typeof tournamentSessions)[number]) => {
    router.push({
      pathname: "/tournamentdetail",
      params: {
        session: JSON.stringify(session),
      },
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const ScheduleMatchCard = ({
    session,
  }: {
    session: (typeof tournamentSessions)[number];
  }) => (
    <TouchableOpacity
      onPress={() => openTournament(session)}
      className="items-center justify-center border-b border-gray-200 p-3"
    >
      <View className="mb-3 flex-row justify-between" />
      <View className="mb-3 flex w-full flex-row items-center justify-between">
        <Text className="origin-center rotate-[-90deg] text-sm font-medium">
          {formatTime(session.startTime)}
        </Text>
        <View className="relative w-full flex-1 flex-col items-start gap-2 whitespace-nowrap border-l-[1px] border-[#DFDFDF] pl-4">
          <View className="flex flex-row border-[0.1px] border-primary">
            <ThemedText lightColor="#00FF94">
              {session.location.name}
            </ThemedText>
          </View>
          <View className="w-full flex-1 flex-row items-center justify-between pr-[23px]">
            <View className="flex flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center">
                <Image
                  source={require("@/assets/images/dropdownpolygon.png")}
                  resizeMode="contain"
                  className="h-full w-full"
                />
                <View className="absolute inset-0 items-center justify-center">
                  <Text className="text-xs font-bold text-black">
                    {getInitials(session.teams.teamOne)}
                  </Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium">
                  {session.teams.teamOne}
                </Text>
                <Text className="text-xs text-gray-500">
                  {session.members.length}/{session.maxNumber} players
                </Text>
              </View>
            </View>
          </View>

          <View className="absolute bottom-0 right-[50px] top-0 justify-center border-r-[1px] border-[#DFDFDF] px-3">
            <Text className="text-sm font-medium text-black">0&apos;</Text>
          </View>

          <View className="w-full flex-1 flex-row items-center justify-between pr-[23px]">
            <View className="flex flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center">
                <Image
                  source={require("@/assets/images/dropdownpolygon.png")}
                  resizeMode="contain"
                  className="h-full w-full"
                />
                <View className="absolute inset-0 items-center justify-center">
                  <Text className="text-xs font-bold text-black">
                    {getInitials(session.teams.teamTwo)}
                  </Text>
                </View>
              </View>
              <Text className="flex-1 text-sm font-medium">
                {session.teams.teamTwo}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => openTournament(session)}
          className="absolute right-[5px] rounded-[5px] bg-[#00FF94] px-[5px] py-[20px] font-[400]"
        >
          <Text className="origin-center flex rotate-[-90deg] items-center justify-center text-center text-sm font-medium">
            join
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaScreen>
      <ScrollView
        className="mb-[40px] h-full flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: 1,
        }}
      >
        <View className="flex-col gap-4 lg:flex-row">
          <View className="w-full">
            <View className="flex flex-col gap-[25px] px-[32px] py-6">
              <View className="mb-6 flex-row items-center justify-between">
                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[20px] font-[600]"
                >
                  Tournaments
                </ThemedText>
                <CalendarIcon />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-6 pb-2"
              >
                <View className="flex-row gap-3">
                  {dates.map((item) => (
                    <CalendarPolygon
                      key={item.id}
                      date={item.dateNumber}
                      day={item.dayName}
                      isActive={item.isToday}
                      isToday={item.isToday}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
            <View className="w-full border-t-[1px] border-[#464242]" />
          </View>

          <View className="mt-[18px] w-full px-[32px]">
            <TouchableOpacity className="mb-[18px] flex w-full flex-row items-center justify-between rounded-[5px] border border-[#7D7D7D] px-[21px] py-[15px]">
              <Text className="text-base text-[#696969]">Search location</Text>
              <View className="h-7 w-7 items-center justify-center rounded-full bg-[#00FF94]">
                <LocationIcon />
              </View>
            </TouchableOpacity>

            <View className="overflow-hidden rounded-md bg-[#ECFFF8]">
              <Pressable
                className={`relative flex-row items-center justify-between border-b-2 px-[21px] py-[23px] ${
                  isExpanded
                    ? "border-[#DFDFDF]"
                    : "rounded-b-md border-[#00FF94]"
                }`}
                onPress={() => setIsExpanded((current) => !current)}
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-[#00FF94]">
                    <Text className="text-xs font-bold text-white">VI</Text>
                  </View>
                  <Text className="text-lg font-semibold text-black">
                    Victoria Island Cup
                  </Text>
                </View>

                <View className="relative justify-center self-stretch pl-[21px]">
                  <View className="absolute bottom-[-23px] left-0 top-[-23px] border-l-[1px] border-[#DFDFDF]" />
                  <View className="p-1">
                    <Text className="text-base text-gray-500">
                      {isExpanded ? <CloseIcon /> : <OpenIcon />}
                    </Text>
                  </View>
                </View>
              </Pressable>

              {isExpanded && (
                <View className="border-b-2 border-b-[#00FF94]">
                  {tournamentSessions.map((session) => (
                    <ScheduleMatchCard key={session._id} session={session} />
                  ))}
                </View>
              )}
            </View>
          </View>

          <View className="mt-[18px] px-[32px]">
            <TouchableOpacity
              className="flex w-full flex-row items-center justify-between rounded-[5px] border border-[#7D7D7D] px-[21px] py-[15px]"
              onPress={() => router.push("/screens/tournamentform")}
            >
              <View className="flex-row items-center gap-3">
                <TournamentIcon color="#696969" width={20} height={20} />
                <Text className="text-base text-[#696969]">
                  Create tournament
                </Text>
              </View>
              <PlusIcon />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
