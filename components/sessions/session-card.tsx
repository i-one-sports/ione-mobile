import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SessionCardProps {
  match: any;
  sessionData?: any;
}

export function SessionCard({ match, sessionData }: SessionCardProps) {
  const session = sessionData ?? match.sessionData;

  const handlePress = () => {
    if (!match.sessionId) return;

    router.push({
      pathname: "/joinsession",
      params: {
        sessionId: match.sessionId,
        session: JSON.stringify(session),
      },
    });
  };

  const playerCount = match.playerCount ?? 0;
  const maxPlayers = match.maxPlayers ?? 0;

  const isLive = match.inProgress;
  const isFinished = match.finished;

  const isPaymentStage =
    match.paymentRequired &&
    match.isFull &&
    !match.allPaymentsCompleted &&
    !isLive &&
    !isFinished;

  const isWaitingForPlayers = !match.isFull && !isLive && !isFinished;

  const getStatus = () => {
    if (isFinished) {
      return {
        label: "Finished",
        color: "#929292",
        background: "#F1F1F1",
      };
    }

    if (isLive) {
      return {
        label: `LIVE ${match.minute}`,
        color: "#000",
        background: "#00FF94",
      };
    }

    if (isPaymentStage) {
      return {
        label: "Payment required",
        color: "#000",
        background: "#FFB800",
      };
    }

    if (isWaitingForPlayers) {
      return {
        label: "Waiting for players",
        color: "#555",
        background: "#EDEDED",
      };
    }

    return {
      label: "Ready",
      color: "#000",
      background: "#00FF94",
    };
  };

  const status = getStatus();

  const getActionLabel = () => {
    if (isFinished) return "VIEW";
    if (isLive) return "VIEW";

    if (match.joined) {
      if (isPaymentStage) return "PAY";
      return "JOINED";
    }

    return "JOIN";
  };

  const actionLabel = getActionLabel();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      className="mb-4 w-full overflow-hidden rounded-[10px] border border-[#E5E5E5] bg-white"
    >
      <View className="flex-row items-start justify-between px-4 pt-4">
        {/* Time + match type */}
        <View className="flex-1">
          <Text className="text-[15px] font-[700] text-black">
            {match.time}
          </Text>

          <Text className="mt-[2px] text-[12px] text-[#999]">
            {match.matchType
              ? match.matchType.charAt(0).toUpperCase() +
                match.matchType.slice(1)
              : "Friendly"}
          </Text>
        </View>

        {/* Status badge */}
        <View
          className="ml-3 rounded-full px-3 py-[5px]"
          style={{
            backgroundColor: status.background,
          }}
        >
          <Text
            className="text-[10px] font-[700]"
            style={{
              color: status.color,
            }}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View className="px-4 pt-4">
        <ThemedText
          lightColor="#111"
          darkColor="#fff"
          className="text-[17px] font-[700]"
        >
          {match.locationName}
        </ThemedText>

        <Text className="mt-1 text-[12px] text-[#929292]">
          Captain: {match.captainName}
        </Text>
      </View>

      <View className="mx-4 mt-4 flex-row items-center justify-between rounded-[8px] bg-[#F7F7F7] px-3 py-3">
        <View>
          <Text className="text-[11px] text-[#929292]">Players</Text>

          <Text className="mt-[2px] text-[15px] font-[700] text-black">
            {playerCount}
            {maxPlayers > 0 ? ` / ${maxPlayers}` : ""}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-[11px] text-[#929292]">Session</Text>

          <Text className="mt-[2px] text-[13px] font-[600] text-black">
            {match.matchType
              ? match.matchType.charAt(0).toUpperCase() +
                match.matchType.slice(1)
              : "Friendly"}
          </Text>
        </View>
      </View>

      {match.paymentRequired && (
        <View className="px-4 pt-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] text-[#929292]">Payment</Text>

            <Text className="text-[13px] font-[700] text-black">
              ₦{Number(match.paymentAmount ?? 0).toLocaleString()}
            </Text>
          </View>

          {isPaymentStage && (
            <Text className="mt-1 text-[11px] text-[#FF9900]">
              Session is full. Players can now complete payment.
            </Text>
          )}
        </View>
      )}

      <View className="mt-4 flex-row items-center justify-between border-t border-[#EEEEEE] px-4 py-3">
        <Text className="mr-3 flex-1 text-[11px] text-[#999]">
          {isFinished
            ? "Session completed"
            : isLive
              ? "Session currently in progress"
              : isPaymentStage
                ? "Waiting for payments"
                : `${maxPlayers > 0 ? maxPlayers - playerCount : 0} spots available`}
        </Text>

        <View
          className="rounded-[6px] px-4 py-2"
          style={{
            backgroundColor: actionLabel === "JOINED" ? "#EAEAEA" : "#00FF94",
          }}
        >
          <Text className="text-[11px] font-[800] text-black">
            {actionLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
