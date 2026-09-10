import { getLocation, getSessionByDate } from "@/api/ownerDashboardThunk";
import CustomDatePicker from "@/components/modals/CustomDatePicker";
import { DateStrip } from "@/components/sessions/DateStrip";
import { FixtureCard } from "@/components/admin/fixtures/fixture-card";
import { SessionSkeletonCard } from "@/components/sessions/SessionSkeletonCard";
import { FixturesHeader } from "@/components/admin/fixtures/fixtures-header";
import {
  DateItem,
  Match,
  ScheduleProps,
  SessionTab,
} from "@/components/sessions/types";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  SegmentedControl,
  SegmentedTab,
} from "@/components/ui/SegmentedControl";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const TABS: SegmentedTab<SessionTab>[] = [
  { key: "all", label: "All" },
  { key: "friendlies", label: "Friendly" },
  { key: "tournaments", label: "Tournament" },
  { key: "sets", label: "Sets" },
];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Schedule({
  initialTab = "all",
  title = "Match Schedule",
}: ScheduleProps = {}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [activeTab, setActiveTab] = useState<SessionTab>(initialTab);
  const [dates, setDates] = useState<DateItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { location, sessionByDate, loadingSessionByDate, errorSessionByDate } =
    useAppSelector((s) => s.ownerDashboard);

  const screenBg = isDark ? "#000" : "#FAFAFA";
  const mutedText = isDark ? "#555" : "#999";
  const primaryText = isDark ? "#FFF" : "#111";

  useEffect(() => {
    dispatch(getLocation());
  }, [dispatch]);

  useEffect(() => {
    if (!location?._id) return;
    const date = selectedDate ?? new Date();
    dispatch(
      getSessionByDate({
        locationId: location._id,
        date: formatDate(date),
      }),
    );
  }, [dispatch, location?._id, selectedDate]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setDates(
      Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return {
          id: d.getTime(),
          dateNumber: `${d.getDate()}`,
          dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
          isToday: i === 0,
        };
      }),
    );
  }, []);

  const formattedMatches: Match[] = useMemo(() => {
    if (!sessionByDate || sessionByDate.length === 0) return [];
    return sessionByDate.map((session: any) => {
      const captainName =
        session.captain?.nickname ||
        session.captain?.firstName ||
        session.captain?.username ||
        "Unknown";
      const hasJoined =
        session.members?.some(
          (m: any) => m._id === user?._id || m.userId === user?._id,
        ) ?? false;
      const startTime = session.startTime
        ? new Date(session.startTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "TBD";
      const minute =
        session.inProgress && session.startTime
          ? `${Math.max(0, Math.floor((Date.now() - new Date(session.startTime).getTime()) / 60000))}'`
          : "0'";
      return {
        sessionId: session._id,
        locationId: session.location?._id,
        captainName,
        locationName: session.location?.name || "Unknown Location",
        matchType: session.matchType || "friendly",
        time: startTime,
        minute,
        playerCount: session.members?.length || 0,
        maxPlayers: session.maxNumber || 0,
        paymentRequired: Boolean(session.paymentRequired),
        paymentStatus: session.paymentStatus,
        paymentAmount: session.paymentAmount || 0,
        allPaymentsCompleted: Boolean(session.allPaymentsCompleted),
        inProgress: Boolean(session.inProgress),
        finished: Boolean(session.finished),
        isFull: Boolean(session.isFull),
        joined: hasJoined,
        sessionData: session,
      };
    });
  }, [sessionByDate, user]);

  const filteredMatches = useMemo(() => {
    let list = formattedMatches;
    if (activeTab === "friendlies")
      list = list.filter((m) => m.matchType.toLowerCase() === "friendly");
    else if (activeTab === "tournaments")
      list = list.filter((m) => m.matchType.toLowerCase() === "tournament");
    else if (activeTab === "sets")
      list = list.filter((m) => m.matchType.toLowerCase() === "set");
    if (selectedDate) {
      list = list.filter((m) => {
        if (!m.sessionData?.startTime) return true;
        const d = new Date(m.sessionData.startTime);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      });
    }
    return list;
  }, [formattedMatches, activeTab, selectedDate]);

  const matchTypeForTab: Record<SessionTab, string> = {
    all: "",
    friendlies: "friendly",
    tournaments: "tournament",
    sets: "set",
  };

  const tabs = useMemo(
    () =>
      TABS.map((t) => ({
        ...t,
        count:
          t.key === "all"
            ? formattedMatches.length
            : formattedMatches.filter(
                (m) => m.matchType.toLowerCase() === matchTypeForTab[t.key],
              ).length,
      })),
    [formattedMatches],
  );

  const handleDatePress = (item: DateItem) => {
    const d = new Date(item.id);
    setSelectedDate((prev) => (prev?.getTime() === item.id ? null : d));
  };

  const handleRefresh = useCallback(async () => {
    if (!location?._id) return;
    setRefreshing(true);
    const date = selectedDate ?? new Date();
    await dispatch(
      getSessionByDate({
        locationId: location._id,
        date: formatDate(date),
      }),
    );
    setRefreshing(false);
  }, [dispatch, location?._id, selectedDate]);

  const showSkeletons = loadingSessionByDate || refreshing;

  return (
    <SafeAreaScreen style={{ backgroundColor: screenBg }}>
      <FixturesHeader
        title={title}
        isDark={isDark}
        onCalendarPress={() => setCalendarVisible(true)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00FF94"
            colors={["#00FF94"]}
          />
        }
      >
        <CustomDatePicker
          date={calendarDate}
          isVisible={isCalendarVisible}
          onClose={() => setCalendarVisible(false)}
          onChange={(d) => {
            setCalendarDate(d);
            setSelectedDate(d);
          }}
        />

        <View style={{ marginBottom: 20 }}>
          <DateStrip
            dates={dates}
            selectedDate={selectedDate}
            onDatePress={handleDatePress}
            isDark={isDark}
          />
        </View>

        <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
          <SegmentedControl
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isDark={isDark}
          />
        </View>

        {selectedDate && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 12, color: mutedText }}>
              {"Showing · "}
              <Text style={{ fontWeight: "700", color: primaryText }}>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </Text>
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
              <Text
                style={{ fontSize: 12, color: "#00CC77", fontWeight: "600" }}
              >
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ paddingHorizontal: 20 }}>
          {showSkeletons ? (
            [1, 2, 3].map((n) => (
              <SessionSkeletonCard key={n} isDark={isDark} />
            ))
          ) : errorSessionByDate ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <Ionicons name="wifi-outline" size={40} color={mutedText} />
              <Text
                style={{
                  color: mutedText,
                  marginTop: 12,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {errorSessionByDate}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (location?._id) {
                    const date = selectedDate ?? new Date();
                    dispatch(
                      getSessionByDate({
                        locationId: location._id,
                        date: formatDate(date),
                      }),
                    );
                  }
                }}
                style={{
                  marginTop: 16,
                  backgroundColor: "#00FF94",
                  borderRadius: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ fontWeight: "700", fontSize: 13 }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredMatches.length === 0 ? (
            <EmptyState
              icon="football-outline"
              title="No fixtures found"
              message={
                selectedDate
                  ? "No fixtures on this date. Try another day or clear the filter."
                  : ""
              }
              isDark={isDark}
            />
          ) : (
            filteredMatches.map((match, idx) => (
              <FixtureCard
                key={match.sessionId || idx}
                match={match}
                sessionData={match.sessionData}
                locationId={match.locationId}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
