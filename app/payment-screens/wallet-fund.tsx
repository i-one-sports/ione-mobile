import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Toast } from "toastify-react-native";

import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import PaymentPollingOverlay from "@/components/payment/PaymentPollingOverlay";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getWalletBalance,
  getWalletTransactions,
  initWalletFund,
} from "@/api/paymentThunks";
import { clearPaymentState } from "@/redux/reducers/payment";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

export default function WalletFundScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accent = isDark ? "#00FF94" : "#00cc77";
  const dispatch = useAppDispatch();

  const { walletBalance, walletTransactions, loadingInit, loadingBalance } =
    useAppSelector((s) => s.payment);

  const [amount, setAmount] = useState("");
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    dispatch(getWalletBalance());
    dispatch(getWalletTransactions({ page: 1, limit: 10 }));
    return () => {
      dispatch(clearPaymentState());
    };
  }, [dispatch]);

  const parsedAmount = parseInt(amount.replace(/,/g, ""), 10);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= 100;

  const handleFund = async () => {
    if (!isValidAmount) {
      Toast.show({ type: "error", text1: "Enter a valid amount (min ₦100)" });
      return;
    }
    try {
      const result = await dispatch(initWalletFund(parsedAmount)).unwrap();
      await WebBrowser.openBrowserAsync(result.authorizationUrl);
      setTimedOut(false);
      setAwaitingConfirmation(true);
      setTimeout(() => {
        setAwaitingConfirmation(false);
        setTimedOut(true);
        dispatch(getWalletBalance());
        dispatch(getWalletTransactions({ page: 1, limit: 10 }));
      }, 120000);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Funding error", text2: err?.msg });
    }
  };

  const handleCheckAgain = () => {
    setTimedOut(false);
    setAwaitingConfirmation(false);
    dispatch(getWalletBalance());
    dispatch(getWalletTransactions({ page: 1, limit: 10 }));
  };

  const handleDismiss = () => {
    setAwaitingConfirmation(false);
    setTimedOut(false);
    dispatch(getWalletBalance());
    dispatch(getWalletTransactions({ page: 1, limit: 10 }));
  };

  const handleAmountInput = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setAmount(numeric ? parseInt(numeric, 10).toLocaleString() : "");
  };

  const cardBg = isDark ? "#111" : "#F9FAFB";
  const cardBorder = isDark ? "#222" : "#F0F0F0";
  const mutedColor = isDark ? "#666" : "#999";
  const inputBg = isDark ? "#181818" : "#F5F5F5";
  const inputColor = isDark ? "#fff" : "#111";

  const showOverlay = awaitingConfirmation || timedOut;

  const txTypeIcon = (type: string) => {
    if (type === "credit" || type === "fund") return "arrow-downward";
    if (type === "debit" || type === "payment") return "arrow-upward";
    return "swap-horiz";
  };

  const txColor = (type: string) =>
    type === "credit" || type === "fund" ? accent : "#FF4444";

  return (
    <SafeAreaScreen
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          gap: 32,
          borderBottomWidth: 1,
          borderBottomColor: cardBorder,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#fff" : "#111"}
          />
        </TouchableOpacity>
        <ThemedText style={{ fontSize: 17, fontWeight: "700" }}>
          Fund Wallet
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Balance card */}
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: cardBorder,
              padding: 20,
              marginBottom: 24,
              alignItems: "center",
            }}
          >
            <Text style={{ color: mutedColor, fontSize: 12, marginBottom: 6 }}>
              Current Balance
            </Text>
            {loadingBalance && !walletBalance ? (
              <ActivityIndicator color={accent} size="small" />
            ) : (
              <Text
                style={{
                  color: isDark ? "#fff" : "#111",
                  fontSize: 28,
                  fontWeight: "800",
                }}
              >
                ₦{(walletBalance?.balance ?? 0).toLocaleString()}
              </Text>
            )}
            {walletBalance?.ledgerBalance !== undefined && (
              <Text style={{ color: mutedColor, fontSize: 12, marginTop: 4 }}>
                Ledger: ₦{walletBalance.ledgerBalance.toLocaleString()}
              </Text>
            )}
          </View>

          {/* Amount input */}
          <ThemedText
            style={{ fontSize: 13, fontWeight: "600", marginBottom: 8 }}
          >
            Amount to Add
          </ThemedText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: inputBg,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: cardBorder,
              paddingHorizontal: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: mutedColor, fontSize: 18, marginRight: 6 }}>
              ₦
            </Text>
            <TextInput
              value={amount}
              onChangeText={handleAmountInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={mutedColor}
              style={{
                flex: 1,
                fontSize: 22,
                fontWeight: "700",
                color: inputColor,
                paddingVertical: 14,
              }}
            />
          </View>

          {/* Quick select amounts */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 28,
            }}
          >
            {QUICK_AMOUNTS.map((q) => {
              const isSelected = parsedAmount === q;
              return (
                <TouchableOpacity
                  key={q}
                  onPress={() => setAmount(q.toLocaleString())}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isSelected ? accent : cardBg,
                    borderWidth: 1,
                    borderColor: isSelected ? accent : cardBorder,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: isSelected ? "#000" : isDark ? "#fff" : "#111",
                    }}
                  >
                    ₦{q.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text
            style={{
              fontSize: 12,
              color: mutedColor,
              textAlign: "center",
              marginBottom: 16,
              lineHeight: 18,
            }}
          >
            {
              "You'll be taken to Paystack to complete the payment. Funds will appear in your wallet within seconds after confirmation."
            }
          </Text>

          <CustomButton
            primary
            title={
              loadingInit
                ? "Opening Paystack..."
                : `Add ₦${isValidAmount ? parsedAmount.toLocaleString() : "0"}`
            }
            onPress={handleFund}
            loading={loadingInit}
            disabled={!isValidAmount || loadingInit || awaitingConfirmation}
          />

          {/* Transaction history */}
          {walletTransactions && walletTransactions.length > 0 && (
            <View style={{ marginTop: 32 }}>
              <ThemedText
                style={{ fontSize: 14, fontWeight: "700", marginBottom: 12 }}
              >
                Recent Transactions
              </ThemedText>
              <View
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  overflow: "hidden",
                }}
              >
                {walletTransactions.map((tx, i) => {
                  const isCredit = tx.type === "credit" || tx.type === "fund";
                  return (
                    <View
                      key={tx._id}
                      style={[
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          gap: 12,
                        },
                        i < walletTransactions.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: cardBorder,
                        },
                      ]}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: isCredit ? "#0D2B1F" : "#2B0000",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MaterialIcons
                          name={txTypeIcon(tx.type) as any}
                          size={18}
                          color={txColor(tx.type)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: isDark ? "#fff" : "#111",
                          }}
                          numberOfLines={1}
                        >
                          {tx.description || tx.type}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: mutedColor,
                            marginTop: 2,
                          }}
                        >
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: txColor(tx.type),
                        }}
                      >
                        {isCredit ? "+" : "-"}₦{tx.amount.toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {showOverlay && (
        <PaymentPollingOverlay
          status={null}
          timedOut={timedOut}
          polling={awaitingConfirmation && !timedOut}
          isDark={isDark}
          accent={accent}
          onRetry={handleCheckAgain}
          onDismiss={handleDismiss}
        />
      )}
    </SafeAreaScreen>
  );
}
