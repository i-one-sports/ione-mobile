import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import BackIcon from "@/assets/svg/BackIcon";
import OpenIcon from "@/assets/svg/OpenIcon";
import PitchIcon from "@/assets/svg/PitchSvg";
import { router } from "expo-router";
import PlayerInfoCard from "./playerinfocard";
import TeamBoxes from "./teamboxes";

export default function CaptainJoinSession() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [showDetails, setShowDetails] = useState(false);

  const [activeTab, setActiveTab] = useState("lineups");

  return (
    <SafeAreaScreen>
      <ScrollView
        className="mb-[40px] h-full flex-1 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: 1,
        }}
      >
        <View className="flex flex-col gap-[31px]  ">
          <View className="mx-[32px] flex flex-col gap-[31px]">
            <View>
              <View className="flex flex-row items-center justify-between">
                <View>
                  <BackIcon />
                </View>

                <View>
                  <ThemedText
                    lightColor={theme.text}
                    darkColor={theme.text}
                    className="text-[20px]  font-[600]"
                  >
                    Set Of Legends
                  </ThemedText>
                </View>

                <TouchableOpacity
                  onPress={() => setShowDetails(true)}
                  activeOpacity={0.6}
                >
                  <OpenIcon />
                </TouchableOpacity>
              </View>

              <View className="mt-[5px] flex w-full flex-col items-center justify-center gap-[2px] text-center">
                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[13px] font-[400]  text-black"
                >
                  Tiger Sports Sangotedo, Lagos
                </ThemedText>
                <ThemedText
                  lightColor={theme.text}
                  darkColor={theme.text}
                  className="text-[13px] font-[400]  text-black"
                >
                  Tue, Mar 19
                </ThemedText>
              </View>

              <View className="mx-auto mt-[45px]">
                <TouchableOpacity
                  className="flex w-[100px] items-center justify-center rounded-[5px] bg-[#00FF94] p-[10px]"
                  onPress={() => router.push("/assigned")}
                >
                  <Text>assign sets</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="flex flex-row items-center justify-between border-b-[1px] border-t-[1px] border-[#5c5a5a8a] px-[31px] py-[21px]">
            <View className="flex flex-row gap-[17px]">
              <Pressable onPress={() => setActiveTab("lineups")}>
                <ThemedText
                  lightColor={activeTab === "lineups" ? "#000" : "#00000080"}
                  darkColor={activeTab === "lineups" ? "#FFF" : "#00000080"}
                  className={`py-2 text-[15px] ${activeTab === "lineups" ? "border-b-[3px] border-[#00FF94]" : ""} font-[500]`}
                >
                  Lineups
                </ThemedText>
              </Pressable>

              <Pressable onPress={() => setActiveTab("squad")}>
                <ThemedText
                  lightColor={activeTab === "squad" ? "#000" : "#00000080"}
                  darkColor={activeTab === "squad" ? "#FFF" : "#00000080"}
                  className={`py-2 text-[15px] ${activeTab === "squad" ? "border-b-[3px] border-[#00FF94]" : ""} font-[500]`}
                >
                  Squad List
                </ThemedText>
              </Pressable>
            </View>

            <View>
              <PitchIcon />
            </View>
          </View>

          <View className="">
            {/* ⭐ LINEUPS VIEW */}
            {activeTab === "squad" && (
              <View className=" flex flex-col gap-[20px]">
                {/* GOALKEEPER */}
                <View className="flex flex-col gap-[20px]">
                  <PlayerInfoCard name="David" />
                  <TeamBoxes
                    sets={[]}
                    selectedSet={null}
                    onSelectSet={function (setId: string | null): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </View>

                {/* MIDFIELDERS */}
                <View className="flex flex-col gap-[20px]">
                  <PlayerInfoCard name="Ayo" />
                  <TeamBoxes
                    sets={[]}
                    selectedSet={null}
                    onSelectSet={function (setId: string | null): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                  <PlayerInfoCard name="Bola" />
                  <TeamBoxes
                    sets={[]}
                    selectedSet={null}
                    onSelectSet={function (setId: string | null): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </View>

                {/* DEFENDERS */}
                <View className="flex flex-col gap-[20px]">
                  <PlayerInfoCard name="Chinedu" />
                  <TeamBoxes
                    sets={[]}
                    selectedSet={null}
                    onSelectSet={function (setId: string | null): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                  <PlayerInfoCard name="Umar" />
                  <TeamBoxes
                    sets={[]}
                    selectedSet={null}
                    onSelectSet={function (setId: string | null): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </View>
              </View>
            )}

            {/* ⭐ SQUAD LIST VIEW */}
            {activeTab === "lineups" && (
              <>
                {" "}
                <View className=" pr-[150px] items-start flex">
                  <TeamBoxes
                    sets={[]}
                    selectedSet={null}
                    onSelectSet={function (setId: string | null): void {
                      throw new Error("Function not implemented.");
                    }}
                  />{" "}
                </View>
                <View className=" flex mt-[30px] flex-col gap-[20px]">
                  {/* GOALKEEPER */}
                  <View className="flex flex-col gap-[20px]">
                    <Text className="mb-2 px-[32px] text-[16px] font-[700]">
                      Goalkeeper
                    </Text>
                    <PlayerInfoCard name="David" />
                  </View>

                  {/* MIDFIELDERS */}
                  <View className="flex flex-col gap-[20px]">
                    <Text className="mb-2 text-[16px] px-[32px] font-[700]">
                      Midfielders
                    </Text>
                    <PlayerInfoCard name="Ayo" />

                    <PlayerInfoCard name="Bola" />
                  </View>

                  {/* DEFENDERS */}
                  <View className="flex flex-col gap-[20px]">
                    <Text className="mb-2 text-[16px] px-[32px] font-[700]">
                      Defenders
                    </Text>
                    <PlayerInfoCard name="Chinedu" />

                    <PlayerInfoCard name="Umar" />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {showDetails && (
        <>
          <Pressable
            onPress={() => setShowDetails(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* DROPDOWN PANEL */}
          <View
            style={{
              position: "absolute",
              top: 250,
              left: 0,
              right: 0,
              zIndex: 300,
            }}
            className="rounded-[10px]  bg-[#F2F2F2] px-[31px] py-[40px] shadow-lg"
          >
            <View className="mb-[17px] flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]"> Duration: </Text>
              <Text className="text-[14px] font-[600] text-black">2 hours</Text>
            </View>

            <View className="mb-[17px] flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]">
                {" "}
                Duration per match:
              </Text>
              <Text className="text-[14px] font-[600] text-black">
                Golden Goal
              </Text>
            </View>

            <View className="flex flex-row justify-between">
              <Text className="text-[14px] text-[#2A2A2A]">
                {" "}
                Winning decider:
              </Text>
              <Text className="text-[14px] font-[600] text-black">
                Shootout
              </Text>
            </View>
          </View>
        </>
      )}
    </SafeAreaScreen>
  );
}
