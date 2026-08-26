import React, { useCallback, useEffect, useState } from "react";
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
import usePaymentPolling from "@/hooks/usePaymentPolling";
import { PaymentStatus } from "@/components/typings/payment";

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
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
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

  const fetchPaymentStatus = useCallback(async (): Promise<{
    status: PaymentStatus;
  } | null> => {
    if (!paymentReference) {
      return null;
    }

    const result = await dispatch(
      getWalletTransactions({
        page: 1,
        limit: 10,
      }),
    )
      .unwrap()
      .catch(() => null);

    if (!result) {
      return null;
    }

    const transaction = result.transactions.find(
      (tx) => tx.reference === paymentReference,
    );

    if (!transaction) {
      return { status: "PENDING" };
    }

    if (transaction.status === "SUCCESS") {
      return { status: "PAID" };
    }

    if (transaction.status === "FAILED") {
      return { status: "FAILED" };
    }

    return { status: "PENDING" };
  }, [dispatch, paymentReference]);

  const {
    status: polledStatus,
    timedOut: pollingTimedOut,
    stopPolling,
  } = usePaymentPolling({
    fetchFn: fetchPaymentStatus,
    enabled: awaitingConfirmation && !!paymentReference,

    onSuccess: () => {
      setAwaitingConfirmation(false);
      setTimedOut(false);
      setAmount("");
      setPaymentReference(null);

      dispatch(getWalletBalance());
      dispatch(
        getWalletTransactions({
          page: 1,
          limit: 10,
        }),
      );

      Toast.show({
        type: "success",
        text1: "Wallet funded",
        text2: "Your wallet has been funded successfully.",
      });
    },

    onFailure: () => {
      setAwaitingConfirmation(false);
    },

    onTimeout: () => {
      setAwaitingConfirmation(false);
      setTimedOut(true);

      // Refresh whatever the backend currently has.
      dispatch(getWalletBalance());
      dispatch(
        getWalletTransactions({
          page: 1,
          limit: 10,
        }),
      );
    },
  });

  /**
   * Start a new wallet funding payment.
   */
  const handleFund = async () => {
    if (!isValidAmount) {
      Toast.show({
        type: "error",
        text1: "Invalid amount",
        text2: "Enter a valid amount (minimum ₦100).",
      });

      return;
    }

    try {
      setTimedOut(false);

      const amountInKobo = parsedAmount * 100;

      const result = await dispatch(initWalletFund(amountInKobo)).unwrap();

      console.log("[wallet-fund] initWalletFund result:", result);

      setPaymentReference(result.reference);

      await WebBrowser.openBrowserAsync(result.authorizationUrl);

      setAwaitingConfirmation(true);
    } catch (err: any) {
      console.log(
        "[wallet-fund] initWalletFund error:",
        JSON.stringify(err, null, 2),
      );

      Toast.show({
        type: "error",
        text1: "Funding error",
        text2:
          err?.msg || err?.message || "Unable to initialize wallet funding.",
      });
    }
  };

  /**
   * Retry confirmation for the SAME payment reference.
   */
  const handleCheckAgain = () => {
    if (!paymentReference) {
      return;
    }

    setTimedOut(false);
    setAwaitingConfirmation(true);
  };

  /**
   * Dismiss the confirmation overlay.
   */
  const handleDismiss = () => {
    stopPolling();

    setAwaitingConfirmation(false);
    setTimedOut(false);
    setPaymentReference(null);

    dispatch(getWalletBalance());

    dispatch(
      getWalletTransactions({
        page: 1,
        limit: 10,
      }),
    );
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

  const showOverlay = awaitingConfirmation || timedOut || pollingTimedOut;

  /**
   * Your API returns uppercase transaction types:
   *
   * CREDIT
   * DEBIT
   */
  const txTypeIcon = (type: string) => {
    if (type === "CREDIT") {
      return "arrow-downward";
    }

    if (type === "DEBIT") {
      return "arrow-upward";
    }

    return "swap-horiz";
  };

  const txColor = (type: string) => (type === "CREDIT" ? accent : "#FF4444");

  return (
    <SafeAreaScreen
      style={{
        flex: 1,
        backgroundColor: isDark ? "#000" : "#fff",
      }}
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

        <ThemedText
          style={{
            fontSize: 17,
            fontWeight: "700",
          }}
        >
          Fund Wallet
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 40,
          }}
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
            <Text
              style={{
                color: mutedColor,
                fontSize: 12,
                marginBottom: 6,
              }}
            >
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
                ₦{((walletBalance?.balance ?? 0) / 100).toLocaleString()}
              </Text>
            )}

            {walletBalance?.ledgerBalance !== undefined && (
              <Text
                style={{
                  color: mutedColor,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Ledger: ₦{walletBalance.ledgerBalance.toLocaleString()}
              </Text>
            )}
          </View>

          {/* Amount input */}
          <ThemedText
            style={{
              fontSize: 13,
              fontWeight: "600",
              marginBottom: 8,
            }}
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
            <Text
              style={{
                color: mutedColor,
                fontSize: 18,
                marginRight: 6,
              }}
            >
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

          {/* Info */}
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
              "You'll be taken to Paystack to complete the payment. Funds will appear in your wallet once the payment is confirmed."
            }
          </Text>

          {/* Fund button */}
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
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  marginBottom: 12,
                }}
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
                  const isCredit = tx.type === "CREDIT";

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
                        {isCredit ? "+" : "-"}₦
                        {(tx.amount / 100).toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Payment confirmation overlay */}
      {showOverlay && (
        <PaymentPollingOverlay
          status={polledStatus}
          timedOut={timedOut || pollingTimedOut}
          polling={
            awaitingConfirmation &&
            !timedOut &&
            !pollingTimedOut &&
            polledStatus !== "PAID" &&
            polledStatus !== "FAILED"
          }
          isDark={isDark}
          accent={accent}
          onRetry={handleCheckAgain}
          onDismiss={handleDismiss}
        />
      )}
    </SafeAreaScreen>
  );
}
