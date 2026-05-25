import { allSessions } from "@/api/sessions";
import CustomDatePicker from "@/components/modals/CustomDatePicker";
import PlusIcon from "@/assets/svg/PlusIcon";
import { CalendarPolygon } from "@/components/sessions/CalendarPolygon";
import { SessionMatchCard } from "@/components/sessions/SessionMatchCard";
import { TeamScheduleGroup } from "@/components/sessions/TeamScheduleGroup";
import {
  DateItem,
  ExpandedState,
  Match,
  ScheduleProps,
  SessionTab,
  TAB_ROUTE_MAP,
} from "@/components/sessions/types";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";

export default function Schedule({
  initialTab = "all",
  title = "Match schedule",
}: ScheduleProps = {}) {
  const [expandedAll, setExpandedAll] = useState<ExpandedState>({
    "All Teams": false,
  });
  const [expandedTournaments, setExpandedTournaments] = useState<ExpandedState>(
    { Tournaments: false },
  );
  const [expandedFriendlies, setExpandedFriendlies] = useState<ExpandedState>({
    Friendlies: false,
  });
  const [expandedSets, setExpandedSets] = useState<ExpandedState>({
    "Set Games": false,
  });
  const [dates, setDates] = useState<DateItem[]>([]);
  const [activeTab, setActiveTab] = useState<SessionTab>(initialTab);
  const [date, setDate] = useState(new Date());

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const scrollViewRef = useRef<ScrollView>(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { all, loadingAll, errorAll } = useAppSelector(
    (state) => state.sessions,
  );

  useEffect(() => {
    if (!user?.location?.coordinates) return;
    const [lat, lng] = user.location.coordinates;
    dispatch(allSessions({ lat, lng }));
  }, [dispatch, user]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newDates: DateItem[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      newDates.push({
        id: d.getTime(),
        dateNumber: `${d.getDate()}`,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        isToday: d.getTime() === today.getTime(),
      });
    }
    setDates(newDates);
  }, []);

  const formattedMatches = useMemo(() => {
    if (!all || all.length === 0) return [];
    return all.map((session: any) => {
      const captainName =
        session.captain?.firstName || session.captain?.username || "Unknown";
      const locationName = session.location?.name || "Unknown Location";
      const hasJoined =
        session.members?.some(
          (member: any) =>
            member._id === user?._id || member.userId === user?._id,
        ) || false;
      const startTime = session.startTime
        ? new Date(session.startTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "TBD";
      let minute = "0'";
      if (session.inProgress && session.startTime) {
        const diff = Math.floor(
          (new Date().getTime() - new Date(session.startTime).getTime()) /
            60000,
        );
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
        minute,
        team1score: "?",
        team2score: "?",
        joined: !hasJoined,
        sessionId: session._id,
        inProgress: session.inProgress,
        finished: session.finished,
        isFull: session.isFull,
        sessionData: session,
      };
    });
  }, [all, user]);

  const groupedAll = [
    { teamName: "All Teams", teamInitials: "AT", matches: formattedMatches },
  ];
  const groupedFriendlies = [
    {
      teamName: "Friendlies",
      teamInitials: "FR",
      matches: formattedMatches.filter(
        (m) => m.teams.matchType.toLowerCase() === "friendly",
      ),
    },
  ];
  const groupedTournaments = [
    {
      teamName: "Tournaments",
      teamInitials: "TM",
      matches: formattedMatches.filter(
        (m) => m.teams.matchType.toLowerCase() === "tournament",
      ),
    },
  ];
  const groupedSets = [
    {
      teamName: "Set Games",
      teamInitials: "ST",
      matches: formattedMatches.filter(
        (m) => m.teams.matchType.toLowerCase() === "set",
      ),
    },
  ];

  const renderMatchCard = (match: Match, idx: number) => (
    <SessionMatchCard key={idx} match={match} sessionData={match.sessionData} />
  );

  const renderTabContent = () => {
    if (loadingAll) {
      return (
        <View className="items-center py-10">
          <Text className="text-gray-400 text-sm">Loading sessions...</Text>
        </View>
      );
    }
    if (errorAll) {
      return (
        <View className="items-center py-10">
          <Text className="text-red-500 text-sm">{errorAll}</Text>
        </View>
      );
    }

    const tabGroupMap: Record<
      SessionTab,
      {
        group: typeof groupedAll;
        expanded: ExpandedState;
        setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>;
        emptyMsg: string;
      }
    > = {
      all: {
        group: groupedAll,
        expanded: expandedAll,
        setExpanded: setExpandedAll,
        emptyMsg: "No sessions available 😕",
      },
      tournaments: {
        group: groupedTournaments,
        expanded: expandedTournaments,
        setExpanded: setExpandedTournaments,
        emptyMsg: "No tournament sessions available 😕",
      },
      friendlies: {
        group: groupedFriendlies,
        expanded: expandedFriendlies,
        setExpanded: setExpandedFriendlies,
        emptyMsg: "No friendly sessions available 😕",
      },
      sets: {
        group: groupedSets,
        expanded: expandedSets,
        setExpanded: setExpandedSets,
        emptyMsg: "No set games available 😕",
      },
    };

    const { group, expanded, setExpanded, emptyMsg } = tabGroupMap[activeTab];

    if (group[0].matches.length === 0) {
      return (
        <View className="items-center py-10">
          <Text className="text-gray-400 text-sm">{emptyMsg}</Text>
        </View>
      );
    }

    return (
      <View className="gap-4">
        {group.map((teamSchedule) => (
          <TeamScheduleGroup
            key={teamSchedule.teamName}
            teamSchedule={teamSchedule}
            isExpanded={!!expanded[teamSchedule.teamName]}
            onToggle={() =>
              setExpanded((prev) => ({
                ...prev,
                [teamSchedule.teamName]: !prev[teamSchedule.teamName],
              }))
            }
            renderMatch={renderMatchCard}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaScreen>
      <ScrollView
        className="mb-[40px] h-full flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      >
        <View className="flex-col gap-4 lg:flex-row">
          {/* Header: title + calendar icon + calendar strip */}
          <View className="w-full">
            <View className="flex flex-col gap-[25px] px-[32px] py-6">
              <View className="mb-6 flex-row items-center justify-between">
                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[20px] font-[600] text-black"
                >
                  {title}
                </ThemedText>
                <TouchableOpacity onPress={() => setCalendarVisible(true)}>
                  <Ionicons
                    name="calendar-outline"
                    size={28}
                    color={theme.icon}
                  />
                </TouchableOpacity>
                <CustomDatePicker
                  date={date}
                  isVisible={isCalendarVisible}
                  onClose={() => setCalendarVisible(false)}
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
            <View className="w-full border-t-[1px] border-[#464242]" />
          </View>

          {/* New game button */}
          <View className="mt-[18px] px-[32px]">
            <TouchableOpacity
              className="flex w-full flex-row items-center justify-between rounded-[5px] border border-[#7D7D7D] px-[21px] py-[15px]"
              onPress={() => {
                const tabId = TAB_ROUTE_MAP[activeTab];
                router.push(
                  (tabId ? `/${tabId}` : "/screens/newsession") as any,
                );
              }}
            >
              <Text className="text-base text-[#696969]">New game? </Text>
              <PlusIcon />
            </TouchableOpacity>
          </View>

          {/* Tab bar + content */}
          <View className="mt-[13px] w-full px-[32px]">
            <View className="mb-4 flex w-full flex-row justify-between gap-2">
              {(["all", "tournaments", "friendlies", "sets"] as const).map(
                (tab) => (
                  <TouchableWithoutFeedback
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                  >
                    <View
                      className={`rounded px-4 py-[9px] ${
                        activeTab === tab ? "bg-[#00FF94]" : "bg-[#ECECEC]"
                      }`}
                    >
                      <Text
                        className={`text-sm font-[600] ${
                          activeTab === tab ? "text-black" : "text-[#929292]"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                ),
              )}
            </View>

            <View className="mt-[33px] flex-1">{renderTabContent()}</View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
