import { getLocation, getLocationTeamStatus } from "@/api/ownerDashboardThunk";
import SafeAreaScreen from "@/components/SafeAreaScreen";
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
  useColorScheme,
  View,
} from "react-native";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  COMPLETE: { label: "Complete", color: "#00C853" },
  PARTIAL: { label: "Partial", color: "#FFB800" },
  UNPAID: { label: "Unpaid", color: "#FF4444" },
  PENDING: { label: "Pending", color: "#CC8800" },
  PAID: { label: "Paid", color: "#00C853" },
  NOT_PAID: { label: "Not Paid", color: "#FF4444" },
};

const naira = (amount: number) => `₦${Number(amount ?? 0).toLocaleString()}`;

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const statusFor = (status: string) =>
  STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

function StatusBadge({ status }: { status: string }) {
  const config = statusFor(status);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: `${config.color}1A`,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: "flex-start",
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: config.color,
        }}
      />
      <Text
        style={{
          fontSize: 10,
          fontWeight: "800",
          color: config.color,
          letterSpacing: 0.2,
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}

function ProgressBar({
  pct,
  color,
  isDark,
}: {
  pct: number;
  color: string;
  isDark: boolean;
}) {
  return (
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
          backgroundColor: color,
          width: `${Math.min(Math.max(pct, 0), 100)}%` as `${number}%`,
        }}
      />
    </View>
  );
}

function PlayerRow({
  player,
  index,
  isDark,
}: {
  player: PlayerPaymentDetail;
  index: number;
  isDark: boolean;
}) {
  const primaryText = isDark ? "#FFF" : "#111";
  const mutedText = isDark ? "#666" : "#999";
  const subText = isDark ? "#AAA" : "#666";
  const divider = isDark ? "#242424" : "#F1F1F1";
  const config = statusFor(player.status);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 9,
        borderTopWidth: index === 0 ? 0 : 1,
        borderTopColor: divider,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: isDark ? "#242424" : "#F0F0F0",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: "700", color: subText }}>
          {index + 1}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: primaryText }}>
          Player {index + 1}
        </Text>
        <Text style={{ fontSize: 11, color: mutedText, marginTop: 1 }}>
          {player.paidAt
            ? `Paid at ${dayjs(player.paidAt).format("h:mm A")}`
            : "Awaiting payment"}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: player.amountPaid > 0 ? primaryText : mutedText,
        }}
      >
        {naira(player.amountPaid)}
      </Text>

      <View style={{ width: 58, alignItems: "flex-end" }}>
        <Text style={{ fontSize: 10, fontWeight: "700", color: config.color }}>
          {config.label}
        </Text>
      </View>
    </View>
  );
}

function TeamCard({ team, isDark }: { team: TeamPayment; isDark: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const cardBg = isDark ? "#111" : "#FFF";
  const cardBorder = isDark ? "#1E1E1E" : "#EFEFEF";
  const primaryText = isDark ? "#FFF" : "#111";
  const mutedText = isDark ? "#666" : "#999";

  const settled = team.shortfall === 0;
  const accent = settled ? "#00FF94" : "#FFB800";
  const paidPct =
    team.totalPlayers > 0 ? (team.playersPaid / team.totalPlayers) * 100 : 0;

  return (
    <View
      style={{
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: cardBorder,
        backgroundColor: cardBg,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <View style={{ height: 3, backgroundColor: accent }} />

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 14,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              marginRight: 10,
              fontSize: 15,
              fontWeight: "700",
              color: primaryText,
              letterSpacing: -0.2,
            }}
          >
            {team.teamName}
          </Text>
          <StatusBadge status={team.status} />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 16,
            marginTop: 8,
          }}
        >
          <Ionicons name="people-outline" size={13} color={mutedText} />
          <Text style={{ fontSize: 12, color: mutedText }}>
            {team.playersPaid}/{team.totalPlayers} players paid
            {team.playersUnpaid > 0
              ? ` · ${team.playersUnpaid} outstanding`
              : ""}
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 14,
          }}
        >
          <ProgressBar pct={paidPct} color={accent} isDark={isDark} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <View>
              <Text style={{ fontSize: 10, color: mutedText }}>Expected</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: primaryText,
                  marginTop: 2,
                }}
              >
                {naira(team.expectedTotal)}
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 10, color: mutedText }}>Collected</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: primaryText,
                  marginTop: 2,
                }}
              >
                {naira(team.totalPaid)}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 10, color: mutedText }}>Shortfall</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  marginTop: 2,
                  color: settled ? (isDark ? "#00FF94" : "#00A85A") : "#FF4444",
                }}
              >
                {settled ? "Settled" : naira(team.shortfall)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && team.playerDetails.length > 0 && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 14,
            borderTopWidth: 1,
            borderTopColor: cardBorder,
            paddingTop: 6,
          }}
        >
          {team.playerDetails.map((player, idx) => (
            <PlayerRow
              key={`${player.userId}-${idx}`}
              player={player}
              index={idx}
              isDark={isDark}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function TeamStatus() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();

  const params = useLocalSearchParams<{
    sessionId?: string | string[];
    locationId?: string | string[];
  }>();
  const sessionId = firstParam(params.sessionId);
  const paramLocationId = firstParam(params.locationId);

  const {
    locationTeamStatus: data,
    loadingLocationTeamStatus: loading,
    errorLocationTeamStatus: error,
  } = useAppSelector((s) => s.ownerDashboard);

  const [refreshing, setRefreshing] = useState(false);

  const screenBg = isDark ? "#000" : "#FAFAFA";
  const primaryText = isDark ? "#FFF" : "#111";
  const mutedText = isDark ? "#555" : "#999";
  const subText = isDark ? "#AAA" : "#666";
  const innerBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const divider = isDark ? "#1E1E1E" : "#F0F0F0";

  const locationId = paramLocationId;

  console.log(data);

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

  const grandPct =
    data && data.grandExpected > 0
      ? (data.grandPaid / data.grandExpected) * 100
      : 0;
  const teamsWithShortfall =
    data?.teams.filter((t) => t.shortfall > 0).length ?? 0;

  const showLoading = loading && !data;
  const showError = Boolean(error) && !data;

  return (
    <SafeAreaScreen style={{ backgroundColor: screenBg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 32,
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#fff" : "#111"}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "800",
            color: primaryText,
            letterSpacing: -0.2,
          }}
        >
          Team Payments
        </Text>
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
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 80,
            }}
          >
            <Ionicons name="receipt-outline" size={48} color={divider} />
            <Text
              style={{
                fontSize: 14,
                color: mutedText,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              No session selected
            </Text>
          </View>
        ) : showLoading ? (
          <ActivityIndicator
            size="large"
            color="#00FF94"
            style={{ marginTop: 100 }}
          />
        ) : showError ? (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 80,
              paddingHorizontal: 24,
            }}
          >
            <Ionicons name="wifi-outline" size={40} color={mutedText} />
            <Text
              style={{
                fontSize: 14,
                color: mutedText,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={() =>
                locationId &&
                sessionId &&
                dispatch(getLocationTeamStatus({ locationId, sessionId }))
              }
              style={{
                marginTop: 16,
                backgroundColor: "#00FF94",
                borderRadius: 10,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 13, color: "#000" }}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : data ? (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 14,
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
                <Ionicons name="calendar-outline" size={12} color={subText} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: primaryText,
                  }}
                >
                  {dayjs(data.sessionStartTime).format("ddd D MMM")}
                </Text>
              </View>

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
                <Ionicons name="time-outline" size={12} color={subText} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: primaryText,
                  }}
                >
                  {dayjs(data.sessionStartTime).format("h:mm A")} –{" "}
                  {dayjs(data.sessionStopTime).format("h:mm A")}
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
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: primaryText,
                  }}
                >
                  {data.pricingOption?.charAt(0).toUpperCase() +
                    data.pricingOption?.slice(1)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: innerBg,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ fontSize: 11, color: subText }}>₦</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: primaryText,
                  }}
                >
                  {Number(data.paymentAmount ?? 0).toLocaleString()}
                </Text>
                <Text style={{ fontSize: 11, color: subText }}>/ player</Text>
              </View>
            </View>

            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: divider,
                backgroundColor: isDark ? "#111" : "#FFF",
                padding: 16,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text style={{ fontSize: 11, color: mutedText }}>
                    Collected
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 6,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "800",
                        color: primaryText,
                        letterSpacing: -0.5,
                      }}
                    >
                      {naira(data.grandPaid)}
                    </Text>
                    <Text style={{ fontSize: 12, color: mutedText }}>
                      of {naira(data.grandExpected)} expected
                    </Text>
                  </View>
                </View>
                <StatusBadge status={data.sessionPaymentStatus} />
              </View>

              <View style={{ marginTop: 14 }}>
                <ProgressBar
                  pct={grandPct}
                  color={
                    data.allTeamsPaid || grandPct >= 100 ? "#00FF94" : "#FFB800"
                  }
                  isDark={isDark}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, color: mutedText }}>
                    {Math.round(grandPct)}% collected
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color:
                        data.shortfall > 0
                          ? "#FF4444"
                          : isDark
                            ? "#00FF94"
                            : "#00A85A",
                    }}
                  >
                    {data.shortfall > 0
                      ? `${naira(data.shortfall)} shortfall`
                      : "No shortfall"}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: data.allTeamsPaid
                  ? `${"#00C853"}33`
                  : `${"#FFB800"}33`,
                backgroundColor: data.allTeamsPaid
                  ? `${"#00C853"}14`
                  : `${"#FFB800"}14`,
                paddingHorizontal: 14,
                paddingVertical: 11,
                marginBottom: 18,
              }}
            >
              <Ionicons
                name={data.allTeamsPaid ? "checkmark-circle" : "alert-circle"}
                size={17}
                color={data.allTeamsPaid ? "#00C853" : "#CC8800"}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: "600",
                  color: data.allTeamsPaid ? "#00C853" : "#CC8800",
                }}
              >
                {data.allTeamsPaid
                  ? "Every team has fully paid for this session"
                  : `${teamsWithShortfall} team${teamsWithShortfall === 1 ? "" : "s"} still owe ${naira(data.shortfall)}`}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: primaryText,
                marginBottom: 10,
              }}
            >
              Teams ({data.teams.length})
            </Text>

            {data.teams.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 50 }}>
                <Ionicons
                  name="people-outline"
                  size={44}
                  color={isDark ? "#333" : "#ccc"}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: mutedText,
                    marginTop: 12,
                    textAlign: "center",
                  }}
                >
                  No teams in this session yet
                </Text>
              </View>
            ) : (
              data.teams.map((team) => (
                <TeamCard key={team.setId} team={team} isDark={isDark} />
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaScreen>
  );
}
