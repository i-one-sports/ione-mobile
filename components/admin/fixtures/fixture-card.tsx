import React from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface FixtureCardProps {
  match: any;
  sessionData?: any;
  locationId?: string | null;
}

export function FixtureCard({
  match,
  sessionData,
  locationId,
}: FixtureCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const session = sessionData ?? match.sessionData;

  const handlePress = () => {
    // if (!match.sessionId) return;
    // if (
    //   match.paymentRequired &&
    //   match.isFull &&
    //   !match.allPaymentsCompleted &&
    //   !match.inProgress &&
    //   !match.finished
    // ) {
    router.push({
      pathname: "/admin/team-status",
      params: {
        sessionId: match.sessionId,
        locationId: match.locationId,
      },
    });

    // router.push({
    //   pathname: "/joinsession",
    //   params: { sessionId: match.sessionId, session: JSON.stringify(session) },
    // });
  };

  const playerCount = match.playerCount ?? 0;
  const maxPlayers = match.maxPlayers ?? 0;
  const fillPct = maxPlayers > 0 ? Math.min(playerCount / maxPlayers, 1) : 0;

  const isLive = match.inProgress;
  const isFinished = match.finished;
  const isFull = match.isFull;
  const isPaymentStage =
    match.paymentRequired &&
    isFull &&
    !match.allPaymentsCompleted &&
    !isLive &&
    !isFinished;

  const cardBg = isDark ? "#111" : "#FFF";
  const cardBorder = isDark ? "#1E1E1E" : "#EFEFEF";
  const innerBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const primaryText = isDark ? "#FFF" : "#111";
  const mutedText = isDark ? "#666" : "#999";
  const subText = isDark ? "#AAA" : "#666";
  const divider = isDark ? "#1E1E1E" : "#F0F0F0";

  const statusConfig = (() => {
    if (isFinished)
      return {
        label: "Finished",
        color: "#888",
        bg: isDark ? "#1A1A1A" : "#F0F0F0",
        dot: false,
      };
    if (isLive)
      return { label: "LIVE", color: "#000", bg: "#00FF94", dot: true };
    if (isPaymentStage)
      return {
        label: "Payment Pending",
        color: "#7A4F00",
        bg: "#FFE082",
        dot: false,
      };
    if (isFull)
      return { label: "Full", color: subText, bg: innerBg, dot: false };
    return {
      label: "Open",
      color: "#005C34",
      bg: isDark ? "#0D2B1F" : "#D4FFF0",
      dot: false,
    };
  })();

  const actionLabel = (() => {
    if (isFinished) {
      return "View Summary";
    }

    if (isLive) {
      return "Manage";
    }

    if (match.paymentRequired && match.isFull && !match.allPaymentsCompleted) {
      return "View Payments";
    }

    return "Manage Fixture";
  })();

  const actionStyle = (() => {
    if (actionLabel === "View Summary") {
      return {
        bg: isDark ? "#0D2B1F" : "#E8FFF4",
        color: "#00CC77",
      };
    }

    if (actionLabel === "View Payments") {
      return {
        bg: "#FFB800",
        color: "#000",
      };
    }

    return {
      bg: "#00FF94",
      color: "#000",
    };
  })();

  const fillBarColor =
    fillPct >= 1
      ? isPaymentStage
        ? "#FFB800"
        : "#00FF94"
      : fillPct > 0.6
        ? "#FFB800"
        : "#00FF94";

  const matchTypeLabel = match.matchType
    ? match.matchType.charAt(0).toUpperCase() + match.matchType.slice(1)
    : "Friendly";

  const spotsLeft = maxPlayers - playerCount;

  const footerNote = (() => {
    if (isFinished) return "Session completed";
    if (isLive) return `Match in progress · ${match.minute}`;
    if (isPaymentStage) return "Waiting for all payments";
    if (isFull) return "Session is full";
    return `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} remaining`;
  })();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      style={{
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: cardBorder,
        backgroundColor: cardBg,
        shadowColor: "#000",
        shadowOpacity: isDark ? 0 : 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        overflow: "hidden",
      }}
    >
      {/* Live accent bar */}
      {isLive && (
        <View
          style={{ height: 3, backgroundColor: "#00FF94", width: "100%" }}
        />
      )}

      {/* Header: location + status */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: primaryText,
              letterSpacing: -0.2,
            }}
          >
            {match.locationName}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 3,
            }}
          >
            <Ionicons name="person-outline" size={11} color={mutedText} />
            <Text style={{ fontSize: 12, color: mutedText }}>
              {match.captainName}
            </Text>
          </View>
        </View>

        {/* Status badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: statusConfig.bg,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          {statusConfig.dot && (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: statusConfig.color,
              }}
            />
          )}
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View
        style={{ height: 1, backgroundColor: divider, marginHorizontal: 16 }}
      />

      {/* Info chips row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 4,
          flexWrap: "wrap",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: innerBg,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Ionicons name="time-outline" size={12} color={mutedText} />
          <Text style={{ fontSize: 12, fontWeight: "600", color: primaryText }}>
            {match.time}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: innerBg,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: primaryText }}>
            {matchTypeLabel}
          </Text>
        </View>

        {match.paymentRequired && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: isPaymentStage
                ? isDark
                  ? "#2A1A00"
                  : "#FFF8E0"
                : innerBg,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: mutedText }}>₦</Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: isPaymentStage ? "#CC8800" : primaryText,
              }}
            >
              {Number(match.paymentAmount ?? 0).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Players fill bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 7,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="people-outline" size={13} color={subText} />
            <Text style={{ fontSize: 11, color: subText }}>Players</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: "700", color: primaryText }}>
            {playerCount}
            {maxPlayers > 0 ? ` / ${maxPlayers}` : ""}
          </Text>
        </View>

        {maxPlayers > 0 && (
          <View
            style={{
              height: 5,
              borderRadius: 3,
              backgroundColor: isDark ? "#242424" : "#EBEBEB",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 5,
                borderRadius: 3,
                backgroundColor: fillBarColor,
                width: `${Math.round(fillPct * 100)}%`,
              }}
            />
          </View>
        )}
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderTopWidth: 1,
          borderTopColor: divider,
          marginTop: 14,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{ fontSize: 11, color: mutedText, flex: 1, marginRight: 10 }}
        >
          {footerNote}
        </Text>

        <View
          style={{
            borderRadius: 10,
            paddingHorizontal: 18,
            paddingVertical: 9,
            backgroundColor: actionStyle.bg,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "800",
              color: actionStyle.color,
            }}
          >
            {actionLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
