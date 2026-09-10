import { getLocationTeamStatus } from "@/api/ownerDashboardThunk";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import {
  PlayerPaymentDetail,
  TeamPayment,
} from "@/components/typings/apiResponse";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  COMPLETE: { label: "Complete", color: "#00A85A" },
  PARTIAL: { label: "Partial", color: "#CC8800" },
  UNPAID: { label: "Unpaid", color: "#FF4444" },
  PENDING: { label: "Pending", color: "#CC8800" },
  PAID: { label: "Paid", color: "#00A85A" },
  NOT_PAID: { label: "Not Paid", color: "#FF4444" },
};

const naira = (amount: number) => `₦${Number(amount ?? 0).toLocaleString()}`;

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const statusFor = (status: string) =>
  STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

function StatusText({ status }: { status: string }) {
  const config = statusFor(status);
  return (
    <Text style={{ fontSize: 12, fontWeight: "600", color: config.color }}>
      {config.label}
    </Text>
  );
}

function PlayerRow({
  player,
  index,
}: {
  player: PlayerPaymentDetail;
  index: number;
}) {
  const config = statusFor(player.status);

  return (
    <View className="flex-row items-center justify-between border-t border-[#EDEDED] py-[10px] dark:border-[#242424]">
      <View className="flex-row items-center gap-[10px]">
        <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F0F0F0] dark:bg-[#1E1E1E]">
          <Text className="text-[10px] font-bold text-[#666] dark:text-[#AAA]">
            {index + 1}
          </Text>
        </View>
        <View>
          <ThemedText className="text-[12px] font-[500]">
            Player {index + 1}
          </ThemedText>
          <ThemedText className="text-[11px] text-gray-500">
            {player.paidAt
              ? `Paid at ${dayjs(player.paidAt).format("h:mm A")}`
              : "Awaiting payment"}
          </ThemedText>
        </View>
      </View>

      <View className="items-end gap-[2px]">
        <ThemedText className="text-[12px] font-[600]">
          {naira(player.amountPaid)}
        </ThemedText>
        <Text style={{ fontSize: 10, fontWeight: "600", color: config.color }}>
          {config.label}
        </Text>
      </View>
    </View>
  );
}

function TeamCard({ team }: { team: TeamPayment }) {
  const [open, setOpen] = useState(false);

  const settled = team.shortfall === 0;

  return (
    <View className="mb-[12px] rounded-[10px] border-[1px] border-[#EDEDED] bg-white dark:border-[#242424] dark:bg-[#111]">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen((prev) => !prev)}
        className="p-[14px]"
      >
        <View className="flex-row items-center justify-between">
          <ThemedText
            numberOfLines={1}
            className="mr-[10px] flex-1 text-[15px] font-[600]"
          >
            {team.teamName}
          </ThemedText>
          <StatusText status={team.status} />
        </View>

        <ThemedText className="mt-[6px] text-[11px] text-gray-500">
          {team.playersPaid}/{team.totalPlayers} players paid •{" "}
          {naira(team.totalPaid)} of {naira(team.expectedTotal)}
        </ThemedText>

        {!settled && (
          <Text className="mt-[3px] text-[11px] font-[600] text-[#FF4444]">
            {naira(team.shortfall)} outstanding
          </Text>
        )}

        {team.playerDetails.length > 0 && (
          <ThemedText className="mt-[8px] text-[11px] text-primary">
            {open ? "Hide players" : "View players"}
          </ThemedText>
        )}
      </TouchableOpacity>

      {open && team.playerDetails.length > 0 && (
        <View className="border-t border-[#EDEDED] px-[14px] pb-[6px] dark:border-[#242424]">
          {team.playerDetails.map((player, idx) => (
            <PlayerRow
              key={`${player.userId}-${idx}`}
              player={player}
              index={idx}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function TeamStatus() {
  const dispatch = useAppDispatch();

  const params = useLocalSearchParams<{
    sessionId?: string | string[];
    locationId?: string | string[];
  }>();
  const sessionId = firstParam(params.sessionId);
  const locationId = firstParam(params.locationId);

  const {
    locationTeamStatus: data,
    loadingLocationTeamStatus: loading,
    errorLocationTeamStatus: error,
  } = useAppSelector((s) => s.ownerDashboard);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!locationId || !sessionId) return;
    dispatch(getLocationTeamStatus({ locationId, sessionId }));
  }, [dispatch, locationId, sessionId]);

  const onRefresh = useCallback(async () => {
    if (!locationId || !sessionId) return;
    setRefreshing(true);
    await dispatch(getLocationTeamStatus({ locationId, sessionId }));
    setRefreshing(false);
  }, [dispatch, locationId, sessionId]);

  const teamsWithShortfall =
    data?.teams.filter((t) => t.shortfall > 0).length ?? 0;

  const showLoading = loading && !data;
  const showError = Boolean(error) && !data;

  console.log(data, "location team status");
  console.log(sessionId, "sessionId status");
  console.log(locationId, "location team status");

  return (
    <SafeAreaScreen>
      {/* Header */}
      <View className="flex-row items-center gap-[32px] px-[20px] pb-[12px] pt-[40px]">
        <TouchableOpacity onPress={() => router.back()} className="p-[4px]">
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <ThemedText className="text-[20px] font-[600]">
          Team Payments
        </ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 60,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF94"
            colors={["#00FF94"]}
          />
        }
      >
        {!sessionId ? (
          <View className="flex-1 items-center justify-center py-[80px]">
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <ThemedText className="mt-[12px] text-center text-[14px] text-gray-500">
              No session selected
            </ThemedText>
          </View>
        ) : showLoading ? (
          <ActivityIndicator
            size="large"
            color="#00FF94"
            style={{ marginTop: 100 }}
          />
        ) : showError ? (
          <View className="items-center px-[24px] py-[80px]">
            <Ionicons name="wifi-outline" size={40} color="#999" />
            <ThemedText className="mt-[12px] text-center text-[14px] text-gray-500">
              {error}
            </ThemedText>
            <TouchableOpacity
              onPress={() =>
                locationId &&
                sessionId &&
                dispatch(getLocationTeamStatus({ locationId, sessionId }))
              }
              className="mt-[16px] rounded-[5px] bg-primary px-[20px] py-[10px]"
            >
              <Text className="text-[13px] font-[600] text-black">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : data ? (
          <>
            {/* Session details */}
            <View className="rounded-[10px] border-[1px] border-[#43B75D] bg-[#ECF8EF] p-[16px]">
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] font-[600] text-[#0C4D2E]">
                  {dayjs(data.sessionStartTime).format("ddd D MMM")}
                </Text>
                <Text className="text-[11px] text-[#6D717F]">
                  {dayjs(data.sessionStartTime).format("h:mm A")} –{" "}
                  {dayjs(data.sessionStopTime).format("h:mm A")}
                </Text>
              </View>

              <Text className="mt-[2px] text-[11px] text-[#6D717F]">
                {data.pricingOption
                  ? `${data.pricingOption.charAt(0).toUpperCase()}${data.pricingOption.slice(1)}`
                  : ""}
                {data.paymentAmount
                  ? ` • ${naira(data.paymentAmount)} per player`
                  : ""}
              </Text>
            </View>

            {/* Collection summary */}
            <View className="mt-[16px] rounded-[10px] border-[1px] border-[#5c5a5a8a] p-[16px]">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-[24px] font-bold text-black dark:text-white">
                    {naira(data.grandPaid)}
                  </Text>
                  <Text className="text-[11px] text-[#6D717F]">
                    collected of {naira(data.grandExpected)} expected
                  </Text>
                </View>
                <StatusText status={data.sessionPaymentStatus} />
              </View>

              {[
                {
                  label: "Teams",
                  value: `${data.teams.length}`,
                },
                {
                  label: "Players paid",
                  value: `${data.teams.reduce(
                    (sum, t) => sum + t.playersPaid,
                    0,
                  )} of ${data.teams.reduce(
                    (sum, t) => sum + t.totalPlayers,
                    0,
                  )}`,
                },
                {
                  label: "Outstanding",
                  value:
                    data.shortfall > 0
                      ? naira(data.shortfall)
                      : "Nothing outstanding",
                  danger: data.shortfall > 0,
                },
              ].map((row, i) => (
                <View
                  key={i}
                  className="mb-[12px] mt-[4px] flex-row justify-between last:mb-0"
                >
                  <Text className="text-[13px] text-[#2A2A2A] dark:text-[#9BA1A6]">
                    {row.label}
                  </Text>
                  <Text
                    className={`text-[13px] font-[600] ${
                      row.danger
                        ? "text-[#FF4444]"
                        : "text-black dark:text-white"
                    }`}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Outstanding note */}
            <View
              className={`mt-[14px] flex-row items-center gap-[8px] rounded-[10px] border-[1px] p-[12px] ${
                data.allTeamsPaid
                  ? "border-[#43B75D] bg-[#ECF8EF]"
                  : "border-[#E0B341] bg-[#FFF7E0]"
              }`}
            >
              <Ionicons
                name={data.allTeamsPaid ? "checkmark-circle" : "alert-circle"}
                size={17}
                color={data.allTeamsPaid ? "#00A85A" : "#B8860B"}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: "500",
                  color: data.allTeamsPaid ? "#00A85A" : "#8A6508",
                }}
              >
                {data.allTeamsPaid
                  ? "All teams have fully paid for this session"
                  : `${naira(data.shortfall)} is still due from ${teamsWithShortfall} team${
                      teamsWithShortfall === 1 ? "" : "s"
                    }`}
              </Text>
            </View>

            {/* Teams list */}
            <View className="mb-[14px] mt-[25px] border-y border-[#5c5a5a8a] py-[14px]">
              <ThemedText className="text-[15px] font-[500]">
                Teams ({data.teams.length})
              </ThemedText>
            </View>

            {data.teams.length === 0 ? (
              <View className="items-center py-[50px]">
                <Ionicons name="people-outline" size={44} color="#ccc" />
                <ThemedText className="mt-[12px] text-center text-[13px] text-gray-500">
                  No teams in this session yet
                </ThemedText>
              </View>
            ) : (
              data.teams.map((team) => (
                <TeamCard key={team.setId} team={team} />
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaScreen>
  );
}
