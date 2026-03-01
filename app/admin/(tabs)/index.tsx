import {
  getLastMatches,
  getLocation,
  getSummary,
} from "@/api/ownerDashboardThunk";
import LocationIcon from "@/assets/svg/LocationIcon";
import SettingsIcon from "@/assets/svg/SettingsIcon";
import Recent from "@/components/Recent";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const matches = [
  {
    id: 1,
    date: "2/7/25",
    type: "Friendly Match",
    home: "TN",
    homeName: "Team Name",
    away: "TN",
    awayName: "Team Name",
    homeScore: 1,
    awayScore: 4,
  },
  {
    id: 2,
    date: "15/3/25",
    type: "Kings League",
    home: "TN",
    homeName: "Team Name",
    away: "TN",
    awayName: "Team Name",
    homeScore: 1,
    awayScore: 4,
  },
  {
    id: 3,
    date: "2/7/25",
    type: "Friendly Match",
    home: "TN",
    homeName: "Team Name",
    away: "TN",
    awayName: "Team Name",
    homeScore: 1,
    awayScore: 4,
  },
];

export default function AdminHomeScreen() {
  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const {
    dashboardSummary,
    location,
    recentData,
    errorLastMatches,
    errorLocation,
    errorSummary,
  } = useAppSelector((state) => state.ownerDashboard);

  useEffect(() => {
    dispatch(getLocation());
    if (location?._id) {
      dispatch(getSummary(location._id));
      dispatch(getLastMatches(location?._id));
    }
  }, [dispatch, location?._id]);

  //   console.log("dashboardSummary in AdminHomeScreen:", dashboardSummary);
  //   console.log("getLocation error in AdminHomeScreen:", errorLocation);
  //   console.log("getLocation response in AdminHomeScreen:", location);
  //   console.log("getLastMatches response in AdminHomeScreen:", recentData);

  return (
    <View className="flex-1">
      <ImageBackground
        source={
          location?.pitchPhoto
            ? { uri: location.pitchPhoto }
            : require("@/assets/images/adminHeader.png")
        }
      >
        <SafeAreaView edges={["top"]}>
          <StatusBar style="auto" />
          <View className="px-[35px] pt-5 pb-6">
            <View className="flex flex-row items-center justify-between">
              <Text
                style={{ fontFamily: "Poppins_600SemiBold" }}
                className="text-white text-xs bg-[#FFFFFF33] rounded-[10px] p-[10px]"
              >
                Pitch Condition: {dashboardSummary?.pitchCondition}
              </Text>
              <View className="flex flex-row items-center gap-2">
                <TouchableOpacity className="bg-[#FFFFFF33] py-2 px-2 rounded-[10px]">
                  <SettingsIcon width={16} height={16} color="#2D264B" />
                </TouchableOpacity>

                <TouchableOpacity className="bg-[#FFFFFF33] py-2 px-2 rounded-[10px]">
                  <Text>
                    {dashboardSummary?.pitchCondition === "Good" ? (
                      <Text>🌤️</Text>
                    ) : (
                      <Text>🌨️</Text>
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="mt-[105px]">
              <View className="flex flex-row items-center gap-2 bg-[#FFFFFF33] self-start rounded-[10px] px-2 py-[10px]">
                <LocationIcon />
                <Text>
                  {dashboardSummary?.address ? (
                    <Text
                      style={{ fontFamily: "Poppins_600SemiBold" }}
                      className="text-white text-xs "
                    >
                      {dashboardSummary?.address}
                    </Text>
                  ) : (
                    "location not found"
                  )}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                  className="text-white text-[50px] text-center uppercase"
                >
                  {location?.name}
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

          <View className="gap-4">
            {matches.map((match) => (
              <Recent
                key={match.id}
                date={match.date}
                type={match.type}
                homeTeam={match.home}
                awayTeam={match.away}
                awayTeamName={match.awayName}
                homeTeamName={match.homeName}
                homeScore={match.homeScore}
                awayScore={match.awayScore}
              />
            ))}
          </View>
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
                {location?.name}
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
      </SafeAreaScreen>
    </View>
  );
}
