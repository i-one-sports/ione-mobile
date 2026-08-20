import React, { useEffect } from "react";
import { getMyWalletBalance } from "@/api/paymentThunks";
import { ThemedText } from "@/components/ThemedText";
import { WalletsHeader } from "@/components/admin/wallets/wallets-header";
import { SettingsRow } from "@/components/admin/settings/SettingsRow";
import { SettingsSection } from "@/components/admin/settings/SettingsSection";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { WalletHeaderSkeleton } from "@/components/admin/wallets/wallet-header-skeleton";
import { useAppDispatch, useAppSelector } from "@/redux/store";

import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function AdminWalletScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const screenBg = isDark ? "#000" : "#FAFAFA";

  const { myWalletBalance, loadingMyBalance } = useAppSelector(
    (s) => s.payment,
  );

  const paddingTop = Platform.OS === "ios" ? insets.top + 12 : 52;
  const paddingBottom = insets.bottom + 100;

  useEffect(() => {
    dispatch(getMyWalletBalance());
  }, [dispatch]);

  return (
    <View style={{ flex: 1, backgroundColor: screenBg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop,
          paddingBottom,
          paddingHorizontal: 20,
        }}
      >
        {/* Top bar */}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 32,
            marginBottom: 20,
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
            style={{ fontFamily: "Poppins_600SemiBold", fontSize: 17 }}
            lightColor="#000"
            darkColor="#fff"
          >
            Wallet
          </ThemedText>
        </View>

        {/* Wallet card */}

        {loadingMyBalance ? (
          <WalletHeaderSkeleton />
        ) : (
          <WalletsHeader
            availableBalance={myWalletBalance?.balance ?? 0}
            ledgerBalance={myWalletBalance?.ledgerBalance ?? 0}
            currency={myWalletBalance?.currency ?? ""}
            status={myWalletBalance?.status ?? ""}
          />
        )}

        {/* Wallet Management */}
        <SettingsSection title="Wallet details">
          <SettingsRow
            icon="account-balance"
            iconColor="#2196F3"
            label="Bank Accounts"
            onPress={() => router.push("/admin/bank-account")}
          />

          <SettingsRow
            icon="arrow-upward"
            iconColor="#F44336"
            label="Withdraw"
            onPress={() => router.push("/payment-screens/withdraw-fund")}
          />

          <SettingsRow
            icon="account-balance-wallet"
            iconColor="#00C853"
            label="Fund Wallet"
            onPress={() => router.push("/payment-screens/wallet-fund")}
          />

          <SettingsRow
            icon="receipt-long"
            iconColor="#7C4DFF"
            label="Ledger"
            onPress={() => router.push("/admin/ledger")}
          />

          <SettingsRow
            icon="swap-horiz"
            iconColor="#009688"
            label="Transactions"
            onPress={() => router.push("/admin/wallet-transactions")}
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}
