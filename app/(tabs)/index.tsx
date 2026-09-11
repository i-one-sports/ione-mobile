import {
  nearBy,
  nearByLocation,
  searchRegisteredLocation,
  startSession,
} from "@/api/sessions";
import FilterSvg from "@/assets/svg/FilterSvg";
import NotificationIcon from "@/assets/svg/NotificationIcon";
import FixtureList from "@/components/FixtureList";
import Loader from "@/components/loader";
import PitchCarousel, { PitchData } from "@/components/PitchCarousel";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import ShimmerCarousel from "@/components/ShimmerCarousel";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Toast from "react-native-toast-message";
import ActionBanner from "@/components/ActionBanner";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const {
    pitches,
    loadingPitches,
    registeredLocations,
    loadingRegisteredLocations,
  } = useAppSelector((state) => state.sessions);
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedItem, setSelectedItem] = useState<PitchData | null>(null);
  const [loadingId, setLoadingId] = useState(false);

  const handleStartSession = (locationId: string) => {
    setLoadingId(true);
    dispatch(startSession({ locationId }))
      .unwrap()
      .then((response: any) => {
        setLoadingId(false);
        router.push(`/screens/newsession?locationId=${response._id}`);
      })
      .catch((err: any) => {
        setLoadingId(false);
        const message =
          err?.msg?.message || err?.msg || "Failed to start session";
        Toast.show({
          type: "error",
          props: {
            title: "Error",
            message,
          },
        });
      });
  };

  const handleCreateTournaments = (locationId: string) => {
    router.push({
      pathname: "/screens/tournamentform",
      params: {
        locationId,
      },
    });
  };

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
      return;
    }

    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      dispatch(searchRegisteredLocation({ name: query }));
    }, 350);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [searchQuery, dispatch]);

  const searchResponse = Array.isArray(registeredLocations)
    ? registeredLocations[0]
    : registeredLocations;

  const searchResults = searchResponse?.results ?? [];
  const showSearchResults =
    searchQuery.trim().length > 0 &&
    (loadingRegisteredLocations || searchResults.length > 0);

  useEffect(() => {
    if (!user?.location?.coordinates) return;
    const [lat, lng] = user.location.coordinates;
    dispatch(nearBy({ lat, lng }));
    // dispatch(
    //   nearBy({
    //     lat: 4.094,
    //     lng: 6.41222,
    //   }),
    // );
    dispatch(nearByLocation({ lat, lng }));
    // dispatch(nearByLocation({ lat: 6.45306, lng: 3.42158 }));
  }, [dispatch, user]);

  // lng=6.41222&lat=4.094
  //   console.log("[HomeScreen] pitches:", pitches);

  const showEmailVerificationBanner = !user?.emailVerified;

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
      <View style={{ paddingHorizontal: 24, paddingTop: 8, gap: 18 }}>
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
            <NotificationIcon color={isDark ? "#FFFFFF" : "#2D264B"} />
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
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 13,
              color: isDark ? "#fff" : "#111",
            }}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons
                name="close"
                size={18}
                color={isDark ? "#555" : "#999"}
              />
            </TouchableOpacity>
          ) : (
            <FilterSvg />
          )}
        </View>

        {showSearchResults && (
          <View
            style={{
              backgroundColor: searchBg,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: searchBorder,
              overflow: "hidden",
            }}
          >
            {loadingRegisteredLocations ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator color={accent} />
              </View>
            ) : searchResults.length === 0 ? (
              <View
                style={{ paddingVertical: 24, alignItems: "center", gap: 8 }}
              >
                <MaterialIcons name="search-off" size={28} color={accent} />
                <ThemedText
                  lightColor="#666"
                  darkColor="#aaa"
                  style={{ fontSize: 13 }}
                >
                  No locations found for &quot;{searchQuery}&quot;
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 280 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedItem({
                        id: item._id,
                        name: item.name,
                        location: "",
                        isBooked: false,
                      })
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: searchBorder,
                    }}
                  >
                    <MaterialIcons
                      name="location-pin"
                      size={18}
                      color={accent}
                    />
                    <ThemedText
                      style={{ fontSize: 14, marginLeft: 10, flex: 1 }}
                    >
                      {item.name}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}

        {showEmailVerificationBanner && (
          <ActionBanner
            title="Verify Your Email"
            description="Verify your email to unlock all app features."
            icon="mail-outline"
            accent={accent}
            isDark={isDark}
            onPress={() => router.push("/verify-email")}
          />
        )}

        {/* Nearby Pitches */}
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <ThemedText style={{ fontSize: 17, fontWeight: "700" }}>
              Nearby Pitches
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push("/screens/newsession")}
            >
              <ThemedText
                lightColor={accent}
                darkColor={accent}
                style={{ fontSize: 12, fontWeight: "600" }}
              >
                Create session
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
            <PitchCarousel data={formattedPitches} onSelect={setSelectedItem} />
          )}
        </View>
      </View>

      {/* ── SCROLLABLE FIXTURES SECTION ── */}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
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

      <Loader visible={loadingId} />
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center px-8"
          onPress={() => setSelectedItem(null)}
        >
          <Pressable
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6"
            onPress={() => {}}
          >
            <ThemedText className="text-lg font-bold mb-1">
              {selectedItem?.name}
            </ThemedText>
            <ThemedText className="text-sm mb-5 text-gray-500 dark:text-gray-400">
              What would you like to do?
            </ThemedText>
            <TouchableOpacity
              onPress={() => {
                const item = selectedItem;
                setSelectedItem(null);
                if (item) handleStartSession(item.id);
              }}
              className="bg-[#67F095] rounded-xl py-3.5 items-center mb-2.5"
            >
              <Text className="text-[#fff] text-[15px] font-semibold">
                Create Session
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const item = selectedItem;
                setSelectedItem(null);
                if (item) handleCreateTournaments(item.id);
              }}
              className="rounded-xl py-3.5 items-center border border-[#e5e5e5] dark:border-[#67F095]"
            >
              <ThemedText className="text-[15px] font-semibold">
                Create Tournament
              </ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaScreen>
  );
}
