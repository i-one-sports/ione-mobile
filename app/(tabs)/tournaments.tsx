import { getTournamentsByLocation } from "@/api/tournamentThunk";
import { nearByLocation } from "@/api/sessions";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import CalendarIcon from "@/assets/svg/CalendarIcon";
import LocationIcon from "@/assets/svg/LocationIcon";
import PlusIcon from "@/assets/svg/PlusIcon";
import TournamentIcon from "@/assets/svg/TournamentIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import React, { useMemo, useEffect } from "react";
import ChevronRight from "@/assets/svg/ChevronRight";
import {
  Image,
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
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { pitches } = useAppSelector((state) => state.sessions);
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

            <View className="gap-3">
              {tournamentsByLocation?.map((tournament) => (
                <TouchableOpacity
                  key={tournament._id}
                  className="flex-row items-center justify-between border-b border-[#DFDFDF] px-[16px] py-[14px]"
                  onPress={() =>
                    router.push({
                      pathname: "/",
                      params: {
                        tournamentId: tournament._id,
                        tournamentName: tournament.name,
                      },
                    })
                  }
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-[40px] w-[40px] items-center justify-center">
                      <View className="relative h-full w-full">
                        <Image
                          source={require("@/assets/images/activepolygon.png")}
                          resizeMode="contain"
                          className="h-full w-full"
                        />
                        <View className="absolute inset-0 items-center justify-center">
                          <ThemedText className="text-sm">
                            {getInitials(tournament.name)}{" "}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <Text className="text-lg font-semibold text-black">
                      {tournament.name}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View className="h-12 w-[1.5px] bg-[#DFDFDF] mr-2" />

                    <ChevronRight width={24} height={24} />
                  </View>
                </TouchableOpacity>
              ))}
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
