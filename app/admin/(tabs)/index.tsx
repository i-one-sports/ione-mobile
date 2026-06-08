import {
  getLastMatches,
  getLocation,
  getSummary,
  getUpcomingSessions,
} from "@/api/ownerDashboardThunk";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
import LocationIcon from "@/assets/svg/LocationIcon";
import MatchCardSkeleton from "@/components/MatchCardSkeleton";
import Recent from "@/components/Recent";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { formatPitchCondition } from "@/utils/formatPitchCondition";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ConditionIconConfig = {
  library: "Ionicons" | "MaterialIcons";
  name: string;
};

const CONDITION_ICON: Record<string, ConditionIconConfig> = {
  excellent: { library: "Ionicons", name: "star" },
  good: { library: "Ionicons", name: "sunny-outline" },
  fair: { library: "Ionicons", name: "partly-sunny-outline" },
  poor: { library: "Ionicons", name: "warning-outline" },
  wet: { library: "Ionicons", name: "rainy-outline" },
  under_maintenance: { library: "MaterialIcons", name: "construction" },
};

function PitchConditionIcon({
  condition,
  size,
  color,
}: {
  condition?: string;
  size: number;
  color: string;
}) {
  const config = CONDITION_ICON[condition ?? ""];
  if (!config)
    return <Ionicons name="help-circle-outline" size={size} color={color} />;
  if (config.library === "MaterialIcons")
    return (
      <MaterialIcons name={config.name as any} size={size} color={color} />
    );
  return <Ionicons name={config.name as any} size={size} color={color} />;
}

export default function AdminHomeScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [modalVisible, setModalVisible] = useState(false);

  const {
    dashboardSummary,
    loadingSummmary,
    location,
    lastMatches,
    loadingLastMatches,
    errorLastMatches,
    loadingLocation,
  } = useAppSelector((state) => state.ownerDashboard);

  useEffect(() => {
    dispatch(getLocation());
    if (location?._id) {
      dispatch(getSummary(location._id));
      dispatch(getLastMatches(location._id));
      dispatch(getUpcomingSessions(location._id));
    }
  }, [dispatch, location?._id]);

  const { user } = useAppSelector((state) => state.auth);
  const accent = isDark ? "#00FF94" : "#00cc77";
  const showOnboardingBanner =
    user?.ownerOnboardingStatus === "PENDING_VERIFICATION";

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}>
      {/* Hero image background */}
      <ImageBackground
        source={require("../../../assets/images/adminHeader.png")}
      >
        <SafeAreaView edges={["top"]}>
          <StatusBar style="light" />
          <View
            style={{ paddingHorizontal: 35, paddingTop: 16, paddingBottom: 24 }}
          >
            {/* Top bar: condition pill + action buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}
              >
                {!loadingSummmary && (
                  <PitchConditionIcon
                    condition={dashboardSummary?.pitchCondition}
                    size={13}
                    color="#fff"
                  />
                )}
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    color: "#fff",
                    fontSize: 11,
                  }}
                >
                  {loadingSummmary
                    ? "Loading..."
                    : formatPitchCondition(dashboardSummary?.pitchCondition)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => router.navigate("/admin/notification")}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 10,
                    padding: 9,
                  }}
                >
                  <AdminNotificationIcon />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/admin/pitchcondition")}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 10,
                    padding: 9,
                  }}
                >
                  <PitchConditionIcon
                    condition={dashboardSummary?.pitchCondition}
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Location + pitch name */}
            <View style={{ marginTop: 80 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignSelf: "flex-start",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  marginBottom: 6,
                }}
              >
                <LocationIcon />
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    color: "#fff",
                    fontSize: 11,
                  }}
                >
                  {loadingSummmary
                    ? "Loading..."
                    : dashboardSummary?.address || "Location not found"}
                </Text>
              </View>

              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: "PlayfairDisplay_700Bold",
                    color: "#fff",
                    fontSize: 46,
                    textTransform: "uppercase",
                  }}
                >
                  {loadingLocation
                    ? "Loading..."
                    : location?.name || "No Location"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Content section */}
      <SafeAreaScreen
        style={{
          flex: 1,
          paddingTop: 0,
          backgroundColor: isDark ? "#000" : "#fff",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 35,
            paddingTop: 20,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {showOnboardingBanner && (
            <TouchableOpacity
              onPress={() => router.push("/admin/onboarding")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: isDark ? "#0D2B1F" : "#EDFFF8",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: isDark ? "#1a3d2b" : "#c8f5e2",
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: `${accent}22`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={accent}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{ fontSize: 13, fontWeight: "600", marginBottom: 2 }}
                >
                  Complete Your Onboarding
                </ThemedText>
                <ThemedText
                  lightColor="#666"
                  darkColor="#aaa"
                  style={{ fontSize: 11 }}
                >
                  Verify your identity to start accepting bookings
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={accent} />
            </TouchableOpacity>
          )}

          {/* Section header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <ThemedText
              style={{ fontFamily: "Poppins_600SemiBold", fontSize: 16 }}
            >
              Recent Matches
            </ThemedText>
            {lastMatches.length > 0 && (
              <TouchableOpacity>
                <ThemedText
                  lightColor={accent}
                  darkColor={accent}
                  style={{ fontSize: 12, fontWeight: "600" }}
                >
                  See all
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Skeleton loading */}
          {(loadingLastMatches || loadingLocation) &&
            lastMatches.length === 0 && (
              <View style={{ gap: 12 }}>
                {[1, 2, 3].map((i) => (
                  <MatchCardSkeleton key={i} />
                ))}
              </View>
            )}

          {/* Empty state — only shown once location + matches have both finished loading */}
          {!loadingLastMatches &&
            !loadingLocation &&
            lastMatches.length === 0 && (
              <View
                style={{
                  backgroundColor: isDark ? "#0D2B1F" : "#EDFFF8",
                  borderRadius: 12,
                  paddingVertical: 32,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MaterialIcons name="sports-soccer" size={32} color={accent} />
                <ThemedText
                  lightColor="#666"
                  darkColor="#aaa"
                  style={{ fontSize: 13, textAlign: "center" }}
                >
                  {errorLastMatches || "No recent matches yet"}
                </ThemedText>
              </View>
            )}

          {/* Match cards */}
          <View style={{ gap: 12 }}>
            {lastMatches.map((match) => (
              <Recent
                key={match._id}
                matchId={match._id}
                date={match.createdAt}
                homeTeamInitial={match.teamOne.name}
                homeTeamId={match.teamOne._id}
                awayTeamId={match.teamTwo._id}
                awayTeamInitial={match.teamTwo.name}
                awayTeamName={match.teamTwo?.name}
                homeTeamName={match.teamOne?.name}
                homeScore={match.teamOneScore}
                awayScore={match.teamTwoScore}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaScreen>

      {/* Location name modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#141414" : "#fff",
              borderRadius: 20,
              padding: 28,
              width: "100%",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 36,
                textTransform: "uppercase",
                textAlign: "center",
                color: isDark ? "#fff" : "#111",
              }}
            >
              {location?.name || "No Location"}
            </Text>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                borderRadius: 20,
                paddingHorizontal: 24,
                paddingVertical: 10,
              }}
            >
              <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
                Close
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
