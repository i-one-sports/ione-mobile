import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import MoneyIcon from "@/assets/svg/MoneyIcon";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getLocation,
  getLocationTransactions,
} from "@/api/ownerDashboardThunk";
import {
  BillingPagination,
  PaymentDateGroup,
  PaymentEntry,
  PaymentStatus,
} from "@/components/typings/apiResponse";

const PAGE_SIZE = 20;

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  COMPLETE: { label: "Complete", color: "#00C853" },
  PARTIAL: { label: "Partial", color: "#FFB800" },
  UNPAID: { label: "Unpaid", color: "#FF4444" },
};

function formatDate(date: string) {
  if (dayjs(date).isSame(dayjs(), "day")) return "Today";
  if (dayjs(date).isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return dayjs(date).format("ddd D MMM");
}

function formatPricing(pricingOption: string) {
  return pricingOption.charAt(0).toUpperCase() + pricingOption.slice(1);
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNPAID;
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
      <ThemedText
        lightColor={config.color}
        darkColor={config.color}
        style={{ fontFamily: "Poppins_500Medium", fontSize: 10 }}
      >
        {config.label}
      </ThemedText>
    </View>
  );
}

function TransactionRow({
  entry,
  isDark,
}: {
  entry: PaymentEntry;
  isDark: boolean;
}) {
  const shortfall = Math.max(entry.expectedTotal - entry.totalPaid, 0);

  return (
    <View
      style={{
        backgroundColor: isDark ? "#141414" : "#fff",
        borderWidth: 1,
        borderColor: isDark ? "#242424" : "#F1F1F1",
        borderRadius: 14,
        padding: 14,
        marginTop: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#00FF9433]">
          <MoneyIcon />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <ThemedText
            lightColor="#111"
            darkColor="#fff"
            numberOfLines={1}
            style={{ fontFamily: "Poppins_500Medium", fontSize: 15 }}
          >
            {entry.teamName}
          </ThemedText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 2,
            }}
          >
            <ThemedText
              lightColor="#7D7D7D"
              darkColor="#7D7D7D"
              style={{ fontFamily: "Poppins_300Light", fontSize: 12 }}
            >
              {dayjs(entry.sessionStartTime).format("h:mm A")}
            </ThemedText>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 2,
                backgroundColor: isDark ? "#FFFFFF66" : "#00000066",
              }}
            />
            <ThemedText
              lightColor="#7D7D7D"
              darkColor="#7D7D7D"
              style={{ fontFamily: "Poppins_300Light", fontSize: 12 }}
            >
              {formatPricing(entry.pricingOption)}
            </ThemedText>
          </View>
        </View>

        <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
          <ThemedText
            lightColor="#111"
            darkColor="#fff"
            style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14 }}
          >
            ₦{entry.totalPaid.toLocaleString()}
          </ThemedText>
          <View style={{ marginTop: 4 }}>
            <StatusBadge status={entry.paymentStatus} />
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#242424" : "#F1F1F1",
        }}
      >
        <ThemedText
          lightColor="#7D7D7D"
          darkColor="#7D7D7D"
          style={{ fontFamily: "Poppins_400Regular", fontSize: 12 }}
        >
          {entry.membersPaid}/{entry.teamSize} players paid · ₦
          {entry.paymentAmount.toLocaleString()} per player
        </ThemedText>
        {shortfall > 0 ? (
          <ThemedText
            lightColor="#FFB800"
            darkColor="#FFB800"
            style={{ fontFamily: "Poppins_500Medium", fontSize: 12 }}
          >
            ₦{shortfall.toLocaleString()} outstanding
          </ThemedText>
        ) : (
          <ThemedText
            lightColor="#00C853"
            darkColor="#00FF94"
            style={{ fontFamily: "Poppins_500Medium", fontSize: 12 }}
          >
            ₦{entry.expectedTotal.toLocaleString()} collected
          </ThemedText>
        )}
      </View>
    </View>
  );
}

export default function AdminTransactionHistoryScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const {
    location,
    locationTransactions,
    billingPagination,
    loadingLocationTransactions: loading,
    errorLocationTransactions: error,
  } = useAppSelector((state) => state.ownerDashboard);

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<PaymentDateGroup[]>([]);

  const screenBg = isDark ? "#000" : "#FAFAFA";
  const paddingTop = Platform.OS === "ios" ? insets.top + 12 : 52;

  useEffect(() => {
    dispatch(getLocation());
  }, [dispatch]);

  useEffect(() => {
    if (!location?._id) return;
    setPage(1);
    setGroups([]);
    dispatch(
      getLocationTransactions({
        locationId: location._id,
        page: 1,
        limit: PAGE_SIZE,
      }),
    );
  }, [dispatch, location?._id]);

  // Reducer replaces state per request, so accumulate pages locally.
  // Merge by date in case a day spans a page boundary.
  useEffect(() => {
    if (locationTransactions.length === 0) return;
    setGroups((prev) => {
      if (page === 1 || prev.length === 0) return locationTransactions;
      const byDate = new Map(prev.map((g) => [g.date, g]));
      for (const group of locationTransactions) {
        const existing = byDate.get(group.date);
        if (!existing) {
          byDate.set(group.date, group);
          continue;
        }
        const seenIds = new Set(existing.entries.map((e) => e.setId));
        byDate.set(group.date, {
          date: existing.date,
          entries: [
            ...existing.entries,
            ...group.entries.filter((e) => !seenIds.has(e.setId)),
          ],
        });
      }
      return Array.from(byDate.values());
    });
  }, [locationTransactions, page]);

  const refetch = useCallback(
    async (nextPage: number) => {
      if (!location?._id) return;
      await dispatch(
        getLocationTransactions({
          locationId: location._id,
          page: nextPage,
          limit: PAGE_SIZE,
        }),
      );
    },
    [dispatch, location?._id],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch(1);
    setRefreshing(false);
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (loading || refreshing || !billingPagination) return;
    const pagination: BillingPagination = billingPagination;
    if (page >= pagination.totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    refetch(nextPage);
  }, [loading, refreshing, billingPagination, page, refetch]);

  const renderGroup = useCallback(
    ({ item }: { item: PaymentDateGroup }) => (
      <View style={{ marginTop: 8 }}>
        <ThemedText
          lightColor="#7D7D7D"
          darkColor="#7D7D7D"
          style={{ fontFamily: "Poppins_500Medium", fontSize: 13 }}
        >
          {formatDate(item.date)}
        </ThemedText>
        {item.entries.map((entry) => (
          <TransactionRow key={entry.setId} entry={entry} isDark={isDark} />
        ))}
      </View>
    ),
    [isDark],
  );

  return (
    <View style={{ flex: 1, backgroundColor: screenBg }}>
      <View
        style={{
          paddingTop,
          paddingBottom: 12,
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 32,
            marginBottom: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 4 }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#fff" : "#111"}
            />
          </TouchableOpacity>
          <ThemedText
            lightColor="#000"
            darkColor="#fff"
            style={{ fontFamily: "Poppins_600SemiBold", fontSize: 17 }}
          >
            Transaction History
          </ThemedText>
        </View>

        {billingPagination && (
          <ThemedText
            lightColor="#7D7D7D"
            darkColor="#7D7D7D"
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: 13,
              marginLeft: 62,
            }}
          >
            {billingPagination.total} transaction
            {billingPagination.total === 1 ? "" : "s"}
          </ThemedText>
        )}
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.date}
        renderItem={renderGroup}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF94"
            colors={["#00FF94"]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#00FF94"
              style={{ marginTop: 80 }}
            />
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 80,
                paddingHorizontal: 32,
              }}
            >
              <Ionicons
                name="receipt-outline"
                size={48}
                color={isDark ? "#333" : "#ccc"}
              />
              <ThemedText
                lightColor="#999"
                darkColor="#555"
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: 15,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                {error ?? "No transactions yet"}
              </ThemedText>
              {error && location?._id && (
                <TouchableOpacity
                  onPress={() => refetch(1)}
                  style={{
                    marginTop: 16,
                    backgroundColor: "#00FF9433",
                    borderRadius: 20,
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                  }}
                >
                  <ThemedText
                    lightColor="#00A85A"
                    darkColor="#00FF94"
                    style={{ fontFamily: "Poppins_500Medium", fontSize: 13 }}
                  >
                    Try Again
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )
        }
        ListFooterComponent={
          loading && groups.length > 0 ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#00FF94" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
