import { getTournamentsByLocation } from "@/api/tournamentThunk";
import { nearByLocation } from "@/api/sessions";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import LocationIcon from "@/assets/svg/LocationIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import React, { useMemo, useEffect, useState, useCallback } from "react";
import ChevronRight from "@/assets/svg/ChevronRight";
import { Ionicons } from "@expo/vector-icons";
import { TournamentsHeader } from "@/components/tournaments/tournaments-header";
import { TournamentSkeletonCard } from "@/components/tournaments/tournament-skeleton-card";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  View,
} from "react-native";
import CustomDatePicker from "@/components/modals/CustomDatePicker";
import { DateStrip } from "@/components/sessions/DateStrip";

type DateItem = {
  id: number;
  dateNumber: string;
  dayName: string;
  isToday: boolean;
};

export default function TournamentScreen({ title = "Tournaments" }) {
  const [dates, setDates] = useState<DateItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { pitches } = useAppSelector((state) => state.sessions);
  const {
    tournamentsByLocation,
    loadingTournamentsByLocation,
    errorTournamentsByLocation,
  } = useAppSelector((state) => state.tournament);

  const screenBg = isDark ? "#000" : "#FAFAFA";
  const mutedText = isDark ? "#555" : "#999";
  const primaryText = isDark ? "#FFF" : "#111";

  useEffect(() => {
    if (!user?.location?.coordinates) return;

    const [lng, lat] = user.location.coordinates;

    dispatch(nearByLocation({ lat: 6.45306, lng: 3.42158 }));
  }, [dispatch, user?.location?.coordinates]);

  useEffect(() => {
    if (!pitches?.length) return;

    const tournamentPitches = pitches.filter(
      (pitch) => pitch?.tournament === true,
    );

    tournamentPitches.forEach((pitch) => {
      if (!pitch._id) return;

      dispatch(getTournamentsByLocation(pitch._id));
    });
  }, [dispatch, pitches]);

  const handleRefresh = useCallback(async () => {
    if (!user?.location?.coordinates) return;
    setRefreshing(true);
    try {
      const [lng, lat] = user.location.coordinates;
      const result = await dispatch(
        nearByLocation({ lat: 6.45306, lng: 3.42158 }),
      ).unwrap();

      const tournamentPitches = (result ?? []).filter(
        (pitch) => pitch?.tournament === true && pitch?._id,
      );

      await Promise.all(
        tournamentPitches.map((pitch) =>
          dispatch(getTournamentsByLocation(pitch._id)).unwrap(),
        ),
      );
    } catch (error) {
      console.error("Failed to refresh tournaments:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, user]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setDates(
      Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return {
          id: d.getTime(),
          dateNumber: `${d.getDate()}`,
          dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
          isToday: i === 0,
        };
      }),
    );
  }, []);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const handleDatePress = (item: DateItem) => {
    const d = new Date(item.id);
    setSelectedDate((prev) => (prev?.getTime() === item.id ? null : d));
  };

  const handleNewTournament = () => {
    router.push({
      pathname: "/",
      params: { locationId: "" },
    });
  };

  const showSkeletons = loadingTournamentsByLocation || refreshing;

  return (
    <SafeAreaScreen style={{ backgroundColor: screenBg }}>
      <TournamentsHeader
        title={title}
        isDark={isDark}
        onCalendarPress={() => setCalendarVisible(true)}
        onNewTournament={handleNewTournament}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00FF94"
            colors={["#00FF94"]}
          />
        }
      >
        <CustomDatePicker
          date={calendarDate}
          isVisible={isCalendarVisible}
          onClose={() => setCalendarVisible(false)}
          onChange={(d) => {
            setCalendarDate(d);
            setSelectedDate(d);
          }}
        />

        <View style={{ marginBottom: 20 }}>
          <DateStrip
            dates={dates}
            selectedDate={selectedDate}
            onDatePress={handleDatePress}
            isDark={isDark}
          />
        </View>

        <View className="mt-[18px] w-full px-[32px]">
          <TouchableOpacity className="mb-[18px] flex w-full flex-row items-center justify-between rounded-[5px] border border-[#7D7D7D] px-[21px] py-[15px]">
            <Text className="text-base text-[#696969]">Search location</Text>
            <View className="h-7 w-7 items-center justify-center rounded-full bg-[#00FF94]">
              <LocationIcon />
            </View>
          </TouchableOpacity>

          <View style={{ paddingHorizontal: 20 }}>
            {showSkeletons ? (
              // Loading state
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <TournamentSkeletonCard key={n} isDark={isDark} />
              ))
            ) : errorTournamentsByLocation ? (
              // Error state
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 60,
                }}
              >
                <Ionicons name="wifi-outline" size={40} color={mutedText} />

                <Text
                  style={{
                    color: mutedText,
                    marginTop: 12,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  {errorTournamentsByLocation}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    if (pitches?.length) {
                      pitches
                        .filter(
                          (pitch) => pitch?.tournament === true && pitch._id,
                        )
                        .forEach((pitch) => {
                          dispatch(getTournamentsByLocation(pitch._id));
                        });
                    }
                  }}
                  style={{
                    marginTop: 16,
                    backgroundColor: "#00FF94",
                    borderRadius: 10,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{ fontWeight: "700", fontSize: 13 }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : tournamentsByLocation?.length === 0 ? (
              // Empty state
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 60,
                }}
              >
                <Ionicons name="trophy-outline" size={40} color={mutedText} />

                <Text
                  style={{
                    color: mutedText,
                    marginTop: 12,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  No tournaments found nearby.
                </Text>
              </View>
            ) : (
              // Success state
              <View style={{ gap: 12 }}>
                {tournamentsByLocation?.map((tournament) => (
                  <TouchableOpacity
                    key={tournament._id}
                    className="flex-row items-center justify-between border-b border-[#DFDFDF] px-[16px] py-[14px]"
                    onPress={() =>
                      router.push({
                        pathname: "/tournamentdetail",
                        params: {
                          tournamentId: tournament._id,
                        },
                      })
                    }
                  >
                    <View className="flex-row items-center gap-3">
                      {/* Tournament initials */}
                      <View className="h-[40px] w-[40px] items-center justify-center">
                        <View className="relative h-full w-full">
                          <Image
                            source={require("@/assets/images/activepolygon.png")}
                            resizeMode="contain"
                            className="h-full w-full"
                          />

                          <View className="absolute inset-0 items-center justify-center">
                            <ThemedText className="text-sm">
                              {getInitials(tournament.name)}
                            </ThemedText>
                          </View>
                        </View>
                      </View>

                      {/* Tournament name */}
                      <View>
                        <ThemedText className="text-lg font-semibold">
                          {tournament.name}
                        </ThemedText>

                        <Text
                          className="mt-1 text-xs"
                          style={{ color: mutedText }}
                        >
                          {tournament.status
                            ? tournament.status.charAt(0).toUpperCase() +
                              tournament.status.slice(1)
                            : "Tournament"}
                        </Text>
                      </View>
                    </View>

                    {/* Navigate to tournament details */}
                    <View className="flex-row items-center">
                      <View
                        className="mr-2 h-12 w-[1.5px]"
                        style={{
                          backgroundColor: isDark ? "#333" : "#DFDFDF",
                        }}
                      />

                      <ChevronRight
                        width={24}
                        height={24}
                        color={isDark ? "#CCC" : "#DFDFDF"}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
