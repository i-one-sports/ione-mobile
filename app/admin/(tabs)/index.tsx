import {
  getLastMatches,
  getLocation,
  getSummary,
  getUpcomingSessions,
} from "@/api/ownerDashboardThunk";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
import LocationIcon from "@/assets/svg/LocationIcon";
import Recent from "@/components/Recent";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { setNotification } from "@/redux/reducers/ownerDashboard";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventSource from "react-native-sse";

export default function AdminHomeScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalNotificationVisible, setModalNotificationVisible] =
    useState<boolean>(false);
  const {
    dashboardSummary,
    loadingSummmary,
    location,
    lastMatches,
    loadingLocation,
    loadingLastMatches,
    errorLastMatches,
    errorLocation,
    errorSummary,
  } = useAppSelector((state) => state.ownerDashboard);
  const latestNotification = useAppSelector(
    (state) => state.ownerDashboard.latestNotification,
  );

  useEffect(() => {
    dispatch(getLocation());
    if (location?._id) {
      dispatch(getSummary(location._id));
      dispatch(getLastMatches(location?._id));
      dispatch(getUpcomingSessions(location._id));
    }
  }, [dispatch, location?._id]);

  useEffect(() => {
    let es: EventSource;

    const initSSE = async () => {
      const token = await SecureStore.getItemAsync("i-one");
      if (!token) return;

      es = new EventSource(
        `${process.env.EXPO_PUBLIC_API_URL}/notifications/stream`,
        {
          headers: {
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      es.addEventListener("message", (event) => {
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);
          dispatch(setNotification(data));
        } catch (err) {
          console.log("SSE parse error", err);
        }
      });

      es.addEventListener("error", (err) => {
        console.log("SSE error", err);
      });
    };

    initSSE();

    // Cleanup on unmount
    return () => {
      es?.close();
    };
  }, []);

  //   console.log("dashboardSummary in AdminHomeScreen:", dashboardSummary);
  //   console.log("getLocation error in AdminHomeScreen:", errorLocation);
  //   console.log("getLastMatches response in AdminHomeScreen:", lastMatches);
  //   console.log("getMatchDetails response in AdminHomeScreen:", matchDetails);

  const getPitchEmoji = (condition?: string) => {
    switch (condition) {
      case "excellent":
        return "🌟";
      case "good":
        return "🌤️";
      case "fair":
        return "🌥️";
      case "poor":
        return "😬";
      case "wet":
        return "💧";
      case "under_maintenance":
        return "🚧";
      default:
        return "❓";
    }
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={
          //   location?.pitchPhoto
          //     ? { uri: location.pitchPhoto }
          //     : require("../../../assets/images/adminHeader.png")
          require("../../../assets/images/adminHeader.png")
        }
        //
      >
        <SafeAreaView edges={["top"]}>
          <StatusBar style="auto" />
          <View className="px-[35px] pt-5 pb-6">
            <View className="flex flex-row items-center justify-between">
              <Text
                style={{ fontFamily: "Poppins_600SemiBold" }}
                className="text-white text-xs bg-[#FFFFFF33] rounded-[10px] p-[10px]"
              >
                Pitch Condition:{" "}
                {loadingSummmary
                  ? "loading.."
                  : dashboardSummary?.pitchCondition}
              </Text>
              <View className="flex flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => setModalNotificationVisible(true)}
                  className="bg-[#FFFFFF33] px-[10px] py-[9px] rounded-[10px]"
                >
                  <AdminNotificationIcon />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/admin/pitchcondition")}
                  className="bg-[#FFFFFF33] py-2 px-2 rounded-[10px]"
                >
                  <Text>{getPitchEmoji(dashboardSummary?.pitchCondition)}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="mt-[105px]">
              <View className="flex flex-row items-center gap-2 bg-[#FFFFFF33] self-start rounded-[10px] px-2 py-[10px]">
                <LocationIcon />
                <Text
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                  className="text-white text-xs"
                >
                  {loadingSummmary
                    ? "loading..."
                    : dashboardSummary?.address
                      ? dashboardSummary?.address
                      : "location not found"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                  className="text-white text-[50px] text-center uppercase"
                >
                  {loadingLocation
                    ? "loading..."
                    : location?.name
                      ? location.name
                      : "location error"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
      <SafeAreaScreen className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 35 }}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText
            style={{ fontFamily: "Poppins_600SemiBold" }}
            className="text-black text-[15px] mb-5"
          >
            Recents
          </ThemedText>
          {loadingLastMatches ? (
            <Text className="text-3xl text-black text-center">loading...</Text>
          ) : lastMatches.length == 0 ? (
            <Text className="text-black text-center">
              {errorLastMatches ? errorLastMatches : "no recent match 😕"}
            </Text>
          ) : (
            <View className="gap-4">
              {lastMatches.map((match) => (
                <Recent
                  matchId={match._id}
                  key={match._id}
                  date={match.createdAt}
                  //   type={match.session}
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
          )}
        </ScrollView>
        <Modal
          visible={modalVisible}
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 items-center justify-center px-2 bg-black/30">
            <View className="p-6 rounded-lg ">
              <Text
                style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                className="text-white text-[50px] text-center uppercase"
              >
                {loadingLocation
                  ? "loading..."
                  : location?.name
                    ? location.name
                    : "location error"}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="absolute right-4 top-4"
              >
                <Ionicons name="close" size={25} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={modalNotificationVisible}
          transparent
          onRequestClose={() => setModalNotificationVisible(false)}
        >
          <View className="flex-1 items-center justify-center px-2 bg-black/30">
            <View className="p-6 rounded-lg ">
              <Text
                style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                className="text-white text-[50px] text-center uppercase"
              >
                {latestNotification
                  ? latestNotification?.body || "New Notification"
                  : "No notification"}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setModalNotificationVisible(!modalNotificationVisible)
                }
                className="absolute right-4 top-4"
              >
                <Ionicons name="close" size={25} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaScreen>
    </View>
  );
}
