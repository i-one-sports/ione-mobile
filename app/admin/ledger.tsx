import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { ThemedText } from "@/components/ThemedText";
import {
  SegmentedControl,
  SegmentedTab,
} from "@/components/ui/SegmentedControl";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getWalletLedger } from "@/api/paymentThunks";
import { LedgerEntry } from "@/components/typings/payment";

type TabKey = "ALL" | "CREDIT" | "DEBIT";

const TABS: SegmentedTab<TabKey>[] = [
  { key: "ALL", label: "All" },
  { key: "CREDIT", label: "Credits" },
  { key: "DEBIT", label: "Debits" },
];

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

function formatReason(reason: string) {
  return reason
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export default function LedgerScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const { walletLedger, walletLedgerPagination, loadingWalletLedger } =
    useAppSelector((s) => s.payment);

  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [allEntries, setAllEntries] = useState<LedgerEntry[]>([]);

  const screenBg = isDark ? "#000" : "#FAFAFA";
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "#242424" : "#F1F1F1";
  const paddingTop = Platform.OS === "ios" ? insets.top + 12 : 52;

  const fetchLedger = useCallback(
    (p: number, type?: string) => {
      dispatch(getWalletLedger({ page: p, limit: 50, type }));
    },
    [dispatch],
  );

  useEffect(() => {
    setAllEntries([]);
    setPage(1);
    const type = activeTab === "ALL" ? undefined : activeTab;
    fetchLedger(1, type);
  }, [activeTab, fetchLedger]);

  useEffect(() => {
    if (walletLedger.length > 0) {
      setAllEntries((prev) =>
        page === 1 ? walletLedger : [...prev, ...walletLedger],
      );
    }
  }, [walletLedger, page]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const type = activeTab === "ALL" ? undefined : activeTab;
    await dispatch(getWalletLedger({ page: 1, limit: 50, type }));
    setPage(1);
    setRefreshing(false);
  }, [activeTab, dispatch]);

  const loadMore = useCallback(() => {
    if (loadingWalletLedger) return;
    if (walletLedgerPagination && page < walletLedgerPagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      const type = activeTab === "ALL" ? undefined : activeTab;
      fetchLedger(nextPage, type);
    }
  }, [
    loadingWalletLedger,
    walletLedgerPagination,
    page,
    activeTab,
    fetchLedger,
  ]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const renderItem = useCallback(
    ({ item }: { item: LedgerEntry }) => {
      const isCredit = item.type === "CREDIT";
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: cardBorder,
            borderRadius: 14,
            padding: 16,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              flex: 1,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isCredit ? "#D4F5E9" : "#FFE8E8",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={isCredit ? "arrow-down" : "arrow-up"}
                size={18}
                color={isCredit ? "#00C853" : "#FF4444"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText
                lightColor="#111"
                darkColor="#fff"
                style={{ fontFamily: "Poppins_500Medium", fontSize: 14 }}
                numberOfLines={1}
              >
                {formatReason(item.reason)}
              </ThemedText>
              <ThemedText
                lightColor="#888"
                darkColor="#666"
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {dayjs(item.createdAt).format("D MMM, h:mm A")}
              </ThemedText>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <ThemedText
              lightColor={isCredit ? "#00C853" : "#FF4444"}
              darkColor={isCredit ? "#00FF94" : "#FF6B6B"}
              style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14 }}
            >
              {isCredit ? "+" : "-"}
              {formatCurrency(item.amount)}
            </ThemedText>
            <ThemedText
              lightColor="#aaa"
              darkColor="#555"
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Bal: {formatCurrency(item.balanceAfter)}
            </ThemedText>
          </View>
        </View>
      );
    },
    [cardBg, cardBorder],
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
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 32,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#fff" : "#111"}
            />
          </TouchableOpacity>
          <ThemedText
            style={{ fontFamily: "Poppins_600SemiBold", fontSize: 17 }}
            lightColor="#000"
            darkColor="#fff"
          >
            Ledger
          </ThemedText>
        </View>

        {/* Tabs */}
        <SegmentedControl
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isDark={isDark}
        />
      </View>

      {/* List */}
      <FlatList
        data={allEntries}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 80,
          paddingTop: 8,
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
          !loadingWalletLedger ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 80,
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
                }}
              >
                No ledger entries
              </ThemedText>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingWalletLedger ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#00FF94" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
