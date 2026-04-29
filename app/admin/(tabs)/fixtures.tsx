import { getLocation, getSessionByDate } from "@/api/ownerDashboardThunk";
import CalendarIcon from "@/assets/svg/CalendarIcon";
import CloseIcon from "@/assets/svg/CloseIcon";
import OpenIcon from "@/assets/svg/OpenIcon";
import PlusIcon from "@/assets/svg/PlusIcon";
import CustomDatePicker from "@/components/modals/CustomDatePicker";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";

type RootStackParamList = {
  ScheduleDetail: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Team = {
  initials: string;
  name: string;
  number?: string;
};

type MatchTeams = {
  team1: Team;
  team2: Team;
  matchType: string;
};

type Match = {
  teams: MatchTeams;
  time: string;
  minute: string;
  team1score: number | string;
  team2score: number | string;
  joined: boolean;

  sessionData: {
    location: {
      name: string;
      address?: string;
    };
  };
};
type TeamSchedule = {
  teamName: string;
  teamInitials: string;
  number?: string;
  matches: Match[];
};

type DateItem = {
  id: number;
  dateNumber: string;
  dayName: string;
  isToday: boolean;
};

type ExpandedState = Record<string, boolean>;

// 🔥 TAB → ID Mapping (added)
const TAB_ROUTE_MAP = {
  all: null,
  tournaments: "screens/newsession", // 👈 tournaments tab = new session screen
  friendlies: "screens/friendly",
  sets: "screens/set",
};

export default function Schedule() {
  const [expandedAll, setExpandedAll] = useState<ExpandedState>({
    "All Teams": false,
  });
  const [expandedTournaments, setExpandedTournaments] = useState<ExpandedState>(
    {
      Tournaments: false,
    },
  );
  const [expandedFriendlies, setExpandedFriendlies] = useState<ExpandedState>({
    Friendlies: false,
  });
  const [expandedSets, setExpandedSets] = useState<ExpandedState>({
    "Set Games": false,
  });
  const [dates, setDates] = useState<DateItem[]>([]);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [activeTab, setActiveTab] = useState<
    "all" | "tournaments" | "friendlies" | "sets"
  >("all");
  const navigation = useNavigation<NavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { location, sessionByDate, loadingSessionByDate, errorSessionByDate } =
    useAppSelector((state) => state.ownerDashboard);

  const [date, setDate] = useState(new Date());
  const [isPickerVisible, setPickerVisible] = useState(false);

  const formattedDate = date.toLocaleDateString("en-CA");

  // Fetch all sessions on mount
  useEffect(() => {
    dispatch(getLocation());
  }, [dispatch]);

  useEffect(() => {
    if (location?._id) {
      dispatch(
        getSessionByDate({
          locationId: location._id,
          date: formattedDate,
        }),
      );
    }
  }, [dispatch, location?._id, formattedDate]);

  // Format sessions from API response
  const formattedMatches = useMemo(() => {
    if (!sessionByDate || sessionByDate.length === 0) return [];

    return sessionByDate.map((session: any) => {
      // Extract captain info
      const captainName =
        session.captain?.firstName || session.captain?.username || "Unknown";

      // Extract location info
      const locationName = session.location?.name || "Unknown Location";

      // Determine if user has joined (you'll need to check members array based on your logic)
      const hasJoined =
        session.members?.some(
          (member: any) =>
            member._id === user?._id || member.userId === user?._id,
        ) || false;

      // Format start time if available
      const startTime = session.startTime
        ? new Date(session.startTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "TBD";

      // Calculate match duration or current minute
      let minute = "0'";
      if (session.inProgress && session.startTime) {
        const now = new Date();
        const start = new Date(session.startTime);
        const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
        minute = `${diff}'`;
      }

      return {
        teams: {
          team1: {
            initials: captainName.slice(0, 2).toUpperCase(),
            name: captainName,
            number: `${session.members?.length || 0}/${session.maxNumber || 0} players`,
          },
          team2: {
            initials: locationName.slice(0, 2).toUpperCase(),
            name: locationName,
          },
          matchType: session.matchType || "friendly",
        },
        time: startTime,
        minute: minute,
        team1score: session.inProgress || session.finished ? "?" : "?",
        team2score: session.inProgress || session.finished ? "?" : "?",
        joined: !hasJoined, // Show join button if not joined
        sessionId: session._id,
        inProgress: session.inProgress,
        finished: session.finished,
        isFull: session.isFull,
        sessionData: session, // 👈 Store the full session data
      };
    });
  }, [sessionByDate, user]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newDates: DateItem[] = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayNum = date.getDate();
      const isToday = date.getTime() === today.getTime();

      newDates.push({
        id: date.getTime(),
        dateNumber: `${dayNum}`,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        isToday,
      });
    }

    setDates(newDates);
  }, []);

  const groupedMatchesAll = [
    {
      teamName: "All Teams",
      teamInitials: "AT",
      matches: formattedMatches,
    },
  ];

  const groupedMatchesFriendlies = [
    {
      teamName: "Friendlies",
      teamInitials: "FR",
      matches: formattedMatches.filter(
        (m) => m.teams.matchType.toLowerCase() === "friendly",
      ),
    },
  ];

  const groupedMatchesTournaments = [
    {
      teamName: "Tournaments",
      teamInitials: "TM",
      matches: formattedMatches.filter(
        (m) => m.teams.matchType.toLowerCase() === "tournament",
      ),
    },
  ];

  const groupedMatchesSets = [
    {
      teamName: "Set Games",
      teamInitials: "ST",
      matches: formattedMatches.filter(
        (m) => m.teams.matchType.toLowerCase() === "set",
      ),
    },
  ];

  const toggleAll = (teamName: string): void => {
    setExpandedAll((prev) => ({
      ...prev,
      [teamName]: !prev[teamName],
    }));
  };

  const toggleTournaments = (teamName: string): void => {
    setExpandedTournaments((prev) => ({
      ...prev,
      [teamName]: !prev[teamName],
    }));
  };

  const toggleFriendlies = (teamName: string): void => {
    setExpandedFriendlies((prev) => ({
      ...prev,
      [teamName]: !prev[teamName],
    }));
  };

  const toggleSets = (teamName: string): void => {
    setExpandedSets((prev) => ({
      ...prev,
      [teamName]: !prev[teamName],
    }));
  };

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
        className="px-4 text-center text-base leading-6 text-black"
      >
        {day}
      </ThemedText>
      {isToday && (
        <Text className="text-xs font-medium text-[#00FF94]">Today</Text>
      )}
    </TouchableOpacity>
  );

  const ScheduleMatchCard = ({
    match,
    sessionData,
  }: {
    match: Match;
    sessionData?: any;
  }) => {
    const handleJoinSession = () => {
      if (sessionData) {
        router.push({
          pathname: "/admin/joinsession",
          params: {
            sessionId: sessionData._id,
            sessionPreview: JSON.stringify({
              location: sessionData.location,
              startTime: sessionData.startTime,
              timeDuration: sessionData.timeDuration,
              minsPerSet: sessionData.minsPerSet,
              winningDecider: sessionData.winningDecider,
            }),
          },
        });
      }
    };

    return (
      <TouchableOpacity
        onPress={handleJoinSession}
        className="border-b border-gray-200 items-center justify-center p-3"
      >
        <View className="mb-3 flex-row justify-between"></View>
        <View className="mb-3 flex w-full flex-row items-center justify-between">
          <Text className="origin-center rotate-[-90deg] text-sm font-medium">
            {match.time}
          </Text>
          <View className="w-full flex-1 flex-col relative items-start gap-2 whitespace-nowrap border-l-[1px] border-[#DFDFDF] pl-4">
            <View className="flex flex-row  border-[0.1px] border-primary">
              <ThemedText lightColor="#00FF94">
                {match.sessionData.location.name}
              </ThemedText>
            </View>
            <View className="flex-row flex-1 items-center justify-between w-full pr-[23px]">
              <View className="flex flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center">
                  <Image
                    source={require("@/assets/images/dropdownpolygon.png")}
                    resizeMode="contain"
                    className="h-full w-full"
                  />
                  <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-xs font-bold text-black">
                      {match.teams.team1.initials}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium">
                    {match.teams.team1.name}
                  </Text>
                  {match.teams.team1.number && (
                    <Text className="text-xs text-gray-500">
                      {match.teams.team1.number}
                    </Text>
                  )}
                </View>
              </View>
              <Text
                className={`text-[12px] ${match.joined ? "hidden" : "flex"} font-bold text-black`}
              >
                {match.team1score}
              </Text>
            </View>

            <View className="absolute right-[50px] top-0 bottom-0 border-[#DFDFDF] border-r-[1px] px-3 justify-center">
              <Text className="text-sm font-medium text-black">
                {match.minute}
              </Text>
            </View>

            <View className="flex-row flex-1 items-center  justify-between w-full pr-[23px]">
              <View className="flex flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center">
                  <Image
                    source={require("@/assets/images/dropdownpolygon.png")}
                    resizeMode="contain"
                    className="h-full w-full"
                  />
                  <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-xs font-bold text-black">
                      {match.teams.team2.initials}
                    </Text>
                  </View>
                </View>
                <Text className="flex-1 text-sm font-medium">
                  {match.teams.team2.name}
                </Text>
              </View>
              <Text
                className={`text-[12px] ${match.joined ? "hidden" : "flex"} font-bold text-black`}
              >
                {match.team2score}
              </Text>
            </View>
          </View>
          {match.joined ? (
            <TouchableOpacity
              onPress={handleJoinSession}
              className="absolute bg-[#00FF94] px-[5px] rounded-[5px] font-[400] py-[20px] right-[5px] "
            >
              <Text className="origin-center flex  items-center justify-center text-center rotate-[-90deg] text-sm font-medium">
                view
              </Text>
            </TouchableOpacity>
          ) : (
            ""
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const DropdownIcon = ({ isExpanded }: { isExpanded: boolean }) => (
    <View className="p-1">
      <Text className="text-base text-gray-500">
        {isExpanded ? <CloseIcon /> : <OpenIcon />}
      </Text>
    </View>
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
          <View className="w-full ">
            <View className="flex flex-col gap-[25px] px-[32px] py-6">
              <View className="mb-6 flex-row items-center justify-between">
                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[20px] font-[600] text-black"
                >
                  Match schedule
                </ThemedText>
                <TouchableOpacity onPress={() => setPickerVisible(true)}>
                  <CalendarIcon />
                </TouchableOpacity>
                <CustomDatePicker
                  date={date}
                  isVisible={isPickerVisible}
                  onClose={() => setPickerVisible(false)}
                  onChange={(newDate) => setDate(newDate)}
                />
              </View>

              <ScrollView
                ref={scrollViewRef}
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
            <View className="w-full border-t-[1px] border-[#464242]"></View>
          </View>

          <View className="mt-[18px] px-[32px]">
            <TouchableOpacity
              className="flex w-full flex-row items-center justify-between rounded-[5px] border border-[#7D7D7D] px-[21px] py-[15px]"
              onPress={() => {
                const tabId = TAB_ROUTE_MAP[activeTab];

                if (!tabId) {
                  // For the "all" tab → route to newsession screen
                  return router.push("/screens/newsession");
                }

                router.push(`/${tabId}` as any);
              }}
            >
              <Text className="text-base text-[#696969]">New game? </Text>
              <PlusIcon />
            </TouchableOpacity>
          </View>

          <View className="mt-[13px] w-full px-[32px]">
            <View className="mb-4 flex w-full flex-row justify-between gap-2">
              {(["all", "tournaments", "friendlies", "sets"] as const).map(
                (tab) => (
                  <TouchableWithoutFeedback
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                  >
                    <View
                      className={`
                rounded px-4 py-[9px]
                ${activeTab === tab ? "bg-[#00FF94]" : "bg-[#ECECEC]"}
              `}
                    >
                      <Text
                        className={`
                  text-sm font-[600]
                  ${activeTab === tab ? "text-black" : "text-[#929292]"}
                `}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                ),
              )}
            </View>

            <View className="mt-[33px] flex-1">
              {/* Loading State */}
              {loadingSessionByDate && (
                <View className="items-center py-10">
                  <Text className="text-gray-400 text-sm">
                    Loading sessions...
                  </Text>
                </View>
              )}

              {/* Error State */}
              {errorSessionByDate && !loadingSessionByDate && (
                <View className="items-center py-10">
                  <Text className="text-red-500 text-sm">
                    {errorSessionByDate}
                  </Text>
                </View>
              )}

              {/* Empty State */}
              {!loadingSessionByDate &&
                !errorSessionByDate &&
                formattedMatches.length === 0 && (
                  <View className="items-center py-10">
                    <Text className="text-gray-400 text-sm">
                      No sessions available 😕
                    </Text>
                  </View>
                )}

              {/* All Tab */}
              {!loadingSessionByDate &&
                !errorSessionByDate &&
                activeTab === "all" &&
                formattedMatches.length > 0 && (
                  <View className="gap-4">
                    {groupedMatchesAll.map((teamSchedule) => (
                      <View
                        key={teamSchedule.teamName}
                        className="overflow-hidden rounded-md bg-[#ECFFF8]"
                      >
                        <Pressable
                          className={`relative flex-row items-center justify-between border-b-2 px-[21px] py-[23px] ${expandedAll[teamSchedule.teamName] ? "border-[#DFDFDF]" : "rounded-b-md border-[#00FF94]"}`}
                          onPress={() => toggleAll(teamSchedule.teamName)}
                        >
                          <View className="flex-row items-center gap-3">
                            <View className="h-6 w-6 items-center justify-center rounded-full bg-[#00FF94]">
                              <Text className="text-xs font-bold text-white">
                                {teamSchedule.teamInitials}
                              </Text>
                            </View>
                            <Text className="text-lg font-semibold">
                              {teamSchedule.teamName}
                            </Text>
                          </View>

                          <View className="relative justify-center self-stretch pl-[21px]">
                            <View className="absolute bottom-[-23px] left-0 top-[-23px] border-l-[1px] border-[#DFDFDF]" />
                            <DropdownIcon
                              isExpanded={expandedAll[teamSchedule.teamName]}
                            />
                          </View>
                        </Pressable>

                        {expandedAll[teamSchedule.teamName] && (
                          <View className="border-b-2 border-b-[#00FF94]">
                            {teamSchedule.matches.map((match, idx) => (
                              <ScheduleMatchCard
                                key={idx}
                                match={match}
                                sessionData={match.sessionData}
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

              {/* Tournaments Tab */}
              {!loadingSessionByDate &&
                !errorSessionByDate &&
                activeTab === "tournaments" && (
                  <View className="gap-4">
                    {groupedMatchesTournaments[0].matches.length === 0 ? (
                      <View className="items-center py-10">
                        <Text className="text-gray-400 text-sm">
                          No tournament sessions available 😕
                        </Text>
                      </View>
                    ) : (
                      groupedMatchesTournaments.map((teamSchedule) => (
                        <View
                          key={teamSchedule.teamName}
                          className="overflow-hidden rounded-md bg-[#ECFFF8]"
                        >
                          <Pressable
                            className={`relative flex-row items-center justify-between border-b-2 px-[21px] py-[23px] ${expandedTournaments[teamSchedule.teamName] ? "border-[#DFDFDF]" : "rounded-b-md border-[#00FF94]"}`}
                            onPress={() =>
                              toggleTournaments(teamSchedule.teamName)
                            }
                          >
                            <View className="flex-row items-center gap-3">
                              <View className="h-6 w-6 items-center justify-center rounded-full bg-[#00FF94]">
                                <Text className="text-xs font-bold text-white">
                                  {teamSchedule.teamInitials}
                                </Text>
                              </View>
                              <Text className="text-lg font-semibold">
                                {teamSchedule.teamName}
                              </Text>
                            </View>

                            <View className="relative justify-center self-stretch pl-[21px]">
                              <View className="absolute bottom-[-23px] left-0 top-[-23px] border-l-[1px] border-[#DFDFDF]" />
                              <DropdownIcon
                                isExpanded={
                                  expandedTournaments[teamSchedule.teamName]
                                }
                              />
                            </View>
                          </Pressable>

                          {expandedTournaments[teamSchedule.teamName] && (
                            <View className="border-b-2 border-b-[#00FF94]">
                              {teamSchedule.matches.map((match, idx) => (
                                <ScheduleMatchCard
                                  key={idx}
                                  match={match}
                                  sessionData={match.sessionData}
                                />
                              ))}
                            </View>
                          )}
                        </View>
                      ))
                    )}
                  </View>
                )}

              {/* Friendlies Tab */}
              {!loadingSessionByDate &&
                !errorSessionByDate &&
                activeTab === "friendlies" && (
                  <View className="gap-4">
                    {groupedMatchesFriendlies[0].matches.length === 0 ? (
                      <View className="items-center py-10">
                        <Text className="text-gray-400 text-sm">
                          No friendly sessions available 😕
                        </Text>
                      </View>
                    ) : (
                      groupedMatchesFriendlies.map((teamSchedule) => (
                        <View
                          key={teamSchedule.teamName}
                          className="overflow-hidden rounded-md bg-[#ECFFF8]"
                        >
                          <Pressable
                            className={`relative flex-row items-center justify-between border-b-2 px-[21px] py-[23px] ${expandedFriendlies[teamSchedule.teamName] ? "border-[#DFDFDF]" : "rounded-b-md border-[#00FF94]"}`}
                            onPress={() =>
                              toggleFriendlies(teamSchedule.teamName)
                            }
                          >
                            <View className="flex-row items-center gap-3">
                              <View className="h-6 w-6 items-center justify-center rounded-full bg-[#00FF94]">
                                <Text className="text-xs font-bold text-white">
                                  {teamSchedule.teamInitials}
                                </Text>
                              </View>
                              <Text className="text-lg font-semibold">
                                {teamSchedule.teamName}
                              </Text>
                            </View>

                            <View className="relative justify-center self-stretch pl-[21px]">
                              <View className="absolute bottom-[-23px] left-0 top-[-23px] border-l-[1px] border-[#DFDFDF]" />
                              <DropdownIcon
                                isExpanded={
                                  expandedFriendlies[teamSchedule.teamName]
                                }
                              />
                            </View>
                          </Pressable>

                          {expandedFriendlies[teamSchedule.teamName] && (
                            <View className="border-b-2 border-b-[#00FF94]">
                              {teamSchedule.matches.map((match, idx) => (
                                <ScheduleMatchCard
                                  key={idx}
                                  match={match}
                                  sessionData={match.sessionData}
                                />
                              ))}
                            </View>
                          )}
                        </View>
                      ))
                    )}
                  </View>
                )}

              {/* Sets Tab */}
              {!loadingSessionByDate &&
                !errorSessionByDate &&
                activeTab === "sets" && (
                  <View className="gap-4">
                    {groupedMatchesSets[0].matches.length === 0 ? (
                      <View className="items-center py-10">
                        <Text className="text-gray-400 text-sm">
                          No set games available 😕
                        </Text>
                      </View>
                    ) : (
                      groupedMatchesSets.map((teamSchedule) => (
                        <View
                          key={teamSchedule.teamName}
                          className="overflow-hidden rounded-md bg-[#ECFFF8]"
                        >
                          <Pressable
                            className={`relative flex-row items-center justify-between border-b-2 px-[21px] py-[23px] ${expandedSets[teamSchedule.teamName] ? "border-[#DFDFDF]" : "rounded-b-md border-[#00FF94]"}`}
                            onPress={() => toggleSets(teamSchedule.teamName)}
                          >
                            <View className="flex-row items-center gap-3">
                              <View className="h-6 w-6 items-center justify-center rounded-full bg-[#00FF94]">
                                <Text className="text-xs font-bold text-white">
                                  {teamSchedule.teamInitials}
                                </Text>
                              </View>
                              <Text className="text-lg font-semibold">
                                {teamSchedule.teamName}
                              </Text>
                            </View>

                            <View className="relative justify-center self-stretch pl-[21px]">
                              <View className="absolute bottom-[-23px] left-0 top-[-23px] border-l-[1px] border-[#DFDFDF]" />
                              <DropdownIcon
                                isExpanded={expandedSets[teamSchedule.teamName]}
                              />
                            </View>
                          </Pressable>

                          {expandedSets[teamSchedule.teamName] && (
                            <View className="border-b-2 border-b-[#00FF94]">
                              {teamSchedule.matches.map((match, idx) => (
                                <ScheduleMatchCard
                                  key={idx}
                                  match={match}
                                  sessionData={match.sessionData}
                                />
                              ))}
                            </View>
                          )}
                        </View>
                      ))
                    )}
                  </View>
                )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
