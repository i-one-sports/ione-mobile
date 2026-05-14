import { nearBy, nearByLocation } from "@/api/sessions";
import FilterSvg from "@/assets/svg/FilterSvg";
import NotificationIcon from "@/assets/svg/NotificationIcon";
import FixtureList from "@/components/FixtureList";
import PitchCarousel from "@/components/PitchCarousel";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import ShimmerCarousel from "@/components/ShimmerCarousel";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { pitches, loadingPitches } = useAppSelector((state) => state.sessions);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user?.location?.coordinates) return;
    const [lat, lng] = user.location.coordinates;
    dispatch(nearBy({ lat, lng }));
    dispatch(nearByLocation({ lat, lng }));
  }, [dispatch, user]);

  const formattedPitches =
    pitches?.map((p: any) => ({
      id: p._id,
      name: p.name,
      location: p.address,
      image: { uri: p.pitchPhoto },
      isBooked: p.booked,
    })) || [];

  const accent = isDark ? "#00FF94" : "#00cc77";
  const searchBg = isDark ? "#1a1a1a" : "#fff";
  const searchBorder = isDark ? "#2a2a2a" : "#e8e8e8";
  const emptyBg = isDark ? "#0D2B1F" : "#EDFFF8";
  const notifBg = isDark ? "#1a1a1a" : "#f5f5f5";

  return (
    <SafeAreaScreen className="flex-1">
      {/* ── FIXED TOP SECTION ── */}
      <View style={{ paddingHorizontal: 35, paddingTop: 8, gap: 18 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ gap: 2 }}>
            <ThemedText
              lightColor="#666"
              darkColor="#aaa"
              style={{ fontSize: 13 }}
            >
              Hey, {user?.firstName} 👋
            </ThemedText>
            <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
              {"It's Matchday!"}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: notifBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NotificationIcon />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: searchBg,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: searchBorder,
          }}
        >
          <MaterialIcons
            name="search"
            size={18}
            color={isDark ? "#555" : "#999"}
          />
          <TextInput
            placeholder="Search for pitches, sessions..."
            placeholderTextColor={isDark ? "#555" : "#9CA3AF"}
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 13,
              color: isDark ? "#fff" : "#111",
            }}
          />
          <FilterSvg />
        </View>

        {/* Nearby Pitches */}
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ThemedText style={{ fontSize: 17, fontWeight: "700" }}>
              Nearby Pitches
            </ThemedText>
            <TouchableOpacity>
              <ThemedText
                lightColor={accent}
                darkColor={accent}
                style={{ fontSize: 12, fontWeight: "600" }}
              >
                See all
              </ThemedText>
            </TouchableOpacity>
          </View>

          {loadingPitches ? (
            <ShimmerCarousel />
          ) : formattedPitches.length === 0 ? (
            <View
              style={{
                backgroundColor: emptyBg,
                borderRadius: 12,
                paddingVertical: 28,
                alignItems: "center",
                gap: 8,
              }}
            >
              <MaterialIcons name="location-off" size={32} color={accent} />
              <ThemedText
                lightColor="#666"
                darkColor="#aaa"
                style={{ fontSize: 13, textAlign: "center" }}
              >
                No pitches found near your location
              </ThemedText>
            </View>
          ) : (
            <PitchCarousel data={formattedPitches} />
          )}
        </View>
      </View>

      {/* ── SCROLLABLE FIXTURES SECTION ── */}
      <View style={{ flex: 1, paddingHorizontal: 35, paddingTop: 20 }}>
        {/* Section header — stays fixed above the list */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <ThemedText style={{ fontSize: 17, fontWeight: "700" }}>
            Upcoming Fixtures
          </ThemedText>
          <TouchableOpacity onPress={() => router.push("/allfixtures")}>
            <ThemedText
              lightColor={accent}
              darkColor={accent}
              style={{ fontSize: 12, fontWeight: "600" }}
            >
              View all
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* FlatList fills remaining space and scrolls */}
        <FixtureList limit={4} />
      </View>
    </SafeAreaScreen>
  );
}
