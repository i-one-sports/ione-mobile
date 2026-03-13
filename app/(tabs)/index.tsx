/* eslint-disable @typescript-eslint/no-unused-vars */

import { nearBy, nearByLocation } from "@/api/sessions";
import FilterSvg from "@/assets/svg/FilterSvg";
import NotificationIcon from "@/assets/svg/NotificationIcon";
import FixtureList from "@/components/FixtureList";
import PitchCarousel from "@/components/PitchCarousel";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import ShimmerCarousel from "@/components/ShimmerCarousel";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import React, { useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAppSelector((state) => state.auth);
  const { sessions, pitches, loadingPitches, errorPitches, all } =
    useAppSelector((state) => state.sessions);
  const dispatch = useAppDispatch();
  console.log("pitches from home screen", user?.location?.coordinates);
  useEffect(() => {
    if (!user?.location?.coordinates) return;

    const [lat, lng] = user.location.coordinates;

    const payload = {
      lat,
      lng,
    };

    dispatch(nearBy(payload));
    dispatch(nearByLocation(payload));
  }, [dispatch, user]);

  const formattedPitches =
    pitches?.map((p: any) => ({
      id: p._id,
      name: p.name,
      location: p.address,
      image: { uri: p.pitchPhoto },
      isBooked: p.booked,
    })) || [];

  return (
    <SafeAreaScreen className="flex-1">
      {" "}
      {/* Add flex-1 here */}
      <View className="py-6 px-[35px]">
        <View className="flex flex-col gap-6">
          {/* Header */}
          <View className="flex flex-row items-center justify-between">
            <View>
              <ThemedText className="text-sm font-normal">
                Hey, {user.firstName}👋
              </ThemedText>
              <ThemedText className="text-xl font-semibold">
                {"It's Matchday!"}
              </ThemedText>
            </View>

            <TouchableOpacity>
              <NotificationIcon />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-[5px] px-[21px] py-[15px] border border-[#7D7D7D] dark:border-gray-700">
            <TextInput
              placeholder="Search for locations"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-xs dark:text-white h-auto"
            />
            <View className="ml-2">
              <FilterSvg />
            </View>
          </View>

          {/* Nearby Pitches Section */}
          <View>
            <ThemedText className="text-lg font-semibold mb-[10px]">
              Nearby Pitches
            </ThemedText>

            {loadingPitches ? (
              <ShimmerCarousel />
            ) : formattedPitches.length === 0 ? (
              <View className="items-center py-10">
                <ThemedText className="text-gray-400 text-sm">
                  No pitches found near your location 😕
                </ThemedText>
              </View>
            ) : (
              <PitchCarousel data={formattedPitches} />
            )}
          </View>
        </View>
      </View>
      <View className="flex-1 px-[35px] mb-[70px]">
        {" "}
        {/* Add flex-1 and padding */}
        <ThemedText className="text-lg font-semibold mb-4">
          Upcoming Fixtures
        </ThemedText>
        <FixtureList />
      </View>
    </SafeAreaScreen>
  );
}
