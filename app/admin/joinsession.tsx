import BackIcon from "@/assets/svg/BackIcon";
import CloseIcon from "@/assets/svg/CloseIcon";
import DocumentIcon from "@/assets/svg/DocumentIcon";
import OpenIcon from "@/assets/svg/OpenIcon";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Player = {
  id: number;
  name: string;
  number: number;
};

export default function JoinSession() {
  const players: Player[] = [
    { id: 1, name: "Player Name", number: 7 },
    { id: 2, name: "Player Name", number: 10 },
    { id: 3, name: "Player Name", number: 4 },
    { id: 4, name: "Player Name", number: 11 },
    { id: 5, name: "Player Name", number: 9 },
    { id: 6, name: "Player Name", number: 3 },
    { id: 7, name: "Player Name", number: 6 },
    { id: 8, name: "Player Name", number: 2 },
  ];

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"lineups" | "squad list">(
    "lineups",
  );

  const [toggle, setToggle] = useState<boolean>(false);
  const { session } = useLocalSearchParams();

  const parsedSession = session ? JSON.parse(session as string) : null;

  console.log("Session ID:", parsedSession);

  const formattedDate = new Date(parsedSession.startTime).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  );

  const PlayerRow = ({ player }: { player: Player }) => {
    return (
      <View className="flex-row items-center gap-2 py-4 border-b border-[#6BF8BD] bg-[#EDFFF8] pl-4">
        <View className="flex-row items-center gap-4">
          <Text
            style={{ fontFamily: "Poppins_600SemiBold" }}
            className="text-base text-black"
          >
            {player.number}
          </Text>
          <View className="h-[43px] w-[43px] rounded-full bg-black items-center justify-center">
            <Text className="text-white text-lg">--</Text>
          </View>
        </View>

        <View>
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-sm text-black"
          >
            {player.name}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaScreen className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,

          flexGrow: 1,
        }}
      >
        <View className="py-6 px-[35px]">
          <View className="flex flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.push("/admin")}>
              <BackIcon />
            </TouchableOpacity>
            <Text
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-xl items-center text-black"
            >
              Set Of Legends
            </Text>
            <TouchableOpacity onPress={() => setToggle(!toggle)}>
              {toggle ? <CloseIcon /> : <OpenIcon />}
            </TouchableOpacity>
          </View>
          <View className="items-center mt-4">
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#2A2A2A] text-xs"
            >
              {parsedSession.location.name}, {parsedSession.location.address}
            </Text>
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#2A2A2A] text-xs"
            >
              {formattedDate}
            </Text>
          </View>

          {toggle ? (
            <View className="mt-4 gap-2 pt-12">
              <View className="flex-row justify-between">
                <Text style={{ fontFamily: "Poppins_400Regular" }}>
                  Duration:
                </Text>
                <Text style={{ fontFamily: "Poppins_600SemiBold" }}>
                  {parsedSession.timeDuration} mins
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ fontFamily: "Poppins_400Regular" }}>
                  Duration Per Match:
                </Text>
                <Text style={{ fontFamily: "Poppins_600SemiBold" }}>
                  {parsedSession.minsPerSet} mins
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ fontFamily: "Poppins_400Regular" }}>
                  Winning Decider:
                </Text>
                <Text style={{ fontFamily: "Poppins_600SemiBold" }}>
                  {parsedSession.winningDecider}
                </Text>
              </View>
            </View>
          ) : (
            <View className="items-center mt-6 gap-2">
              <TouchableOpacity className="bg-[#00FF94] rounded-[5px] px-2 py-[10px]">
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-black text-xs"
                >
                  Copy Session Link
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/joinsession")}
                className="bg-[#00FF94] rounded-[5px] px-2 py-[10px]"
              >
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-black text-xs"
                >
                  Join Session
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="border-[#EDEDED] border-t border-b py-5 flex flex-row justify-between items-center mt-[25px] mb-5">
            <View className="flex-row gap-[17px]">
              {(["lineups", "squad list"] as const).map((tab) => (
                <TouchableWithoutFeedback
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                >
                  <View>
                    <Text
                      style={{ fontFamily: "Poppins_600SemiBold" }}
                      className={`text-[15px] pb-2 ${activeTab === tab ? "text-black" : "text-[#929292]"}`}
                    >
                      {tab
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </Text>
                    {activeTab === tab && (
                      <View className="absolute bottom-[-20px] h-[2px] w-full bg-[#00FF94]" />
                    )}
                  </View>
                </TouchableWithoutFeedback>
              ))}
            </View>
            <DocumentIcon />
          </View>
          {activeTab === "squad list" && (
            <View className="mt-7">
              {players.map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
            </View>
          )}

          {activeTab === "lineups" && (
            <View className="mt-7">
              {players.map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
