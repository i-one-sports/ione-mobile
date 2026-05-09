import { getSessionById } from "@/api/ownerDashboardThunk";
import BackIcon from "@/assets/svg/BackIcon";
import CloseIcon from "@/assets/svg/CloseIcon";
import DocumentIcon from "@/assets/svg/DocumentIcon";
import OpenIcon from "@/assets/svg/OpenIcon";
import { getInitials } from "@/components/Recent";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { Members } from "@/components/typings/apiResponse";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Player = {
  id: string;
  name: string;
  number: number;
  paymentStatus: string;
  avatar: string;
};

export default function JoinSession() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { sessionById, loadingSessionById, errorSessionById } = useAppSelector(
    (state) => state.ownerDashboard,
  );
  const [activeTab, setActiveTab] = useState<"lineups" | "squad list">(
    "lineups",
  );
  const [toggle, setToggle] = useState<boolean>(false);
  const { sessionId, sessionPreview } = useLocalSearchParams();
  const preview = sessionPreview ? JSON.parse(sessionPreview as string) : null;

  const formattedDate = new Date(preview.startTime).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  );

  useEffect(() => {
    if (sessionId) {
      dispatch(getSessionById(sessionId as string));
    }
  }, [sessionId]);

  const players =
    sessionById?.members?.map((member: Members, index: number) => ({
      id: member._id,
      name: `${member.firstName} ${member.lastName}`,
      number: index + 1,
      paymentStatus: member.paymentStatus,
      avatar: member.avatar,
    })) || [];

  const PlayerRow = ({ player }: { player: Player }) => {
    return (
      <View className="flex-row items-center justify-between py-4 border-b border-[#6BF8BD] bg-[#EDFFF8] px-4">
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-4">
            <Text
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-base text-black"
            >
              {player.number}
            </Text>

            <View className="h-[43px] w-[43px] rounded-full bg-black items-center justify-center">
              <Text className="text-white text-base">
                {player.avatar ?? getInitials(player.name)}
              </Text>
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

        <View className="bg-[#00FF94] px-[10px] py-2 rounded-[5px]">
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-xs text-black"
          >
            {player.paymentStatus}
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
            <TouchableOpacity
              onPress={() => router.push("/admin/(tabs)/fixtures")}
            >
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
              {preview?.location.name}, {preview?.location.address}
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
                  {preview?.timeDuration} mins
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ fontFamily: "Poppins_400Regular" }}>
                  Duration Per Match:
                </Text>
                <Text style={{ fontFamily: "Poppins_600SemiBold" }}>
                  {preview?.minsPerSet} mins
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ fontFamily: "Poppins_400Regular" }}>
                  Winning Decider:
                </Text>
                <Text style={{ fontFamily: "Poppins_600SemiBold" }}>
                  {preview?.winningDecider}
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
                      className={`text-[15px] pb-2 ${activeTab === tab ? "text-black dark:text-white" : "text-[#929292]"}`}
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
