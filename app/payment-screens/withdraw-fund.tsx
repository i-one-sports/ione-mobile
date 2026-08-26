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
import { Formik } from "formik";
import * as Yup from "yup";

import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import InputField from "@/components/InputField";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getWalletBalance,
  getWalletTransactions,
  withdrawFunds,
} from "@/api/paymentThunks";
import { clearPaymentState } from "@/redux/reducers/payment";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const validationSchema = Yup.object().shape({
  amount: Yup.string()
    .required("Amount is required")
    .test("valid-amount", "Minimum withdrawal is ₦100", (val) => {
      const num = parseInt((val || "").replace(/,/g, ""), 10);
      return !isNaN(num) && num >= 100;
    }),
  reason: Yup.string().required("Please provide a reason for withdrawal"),
});

export default function WithdrawFundScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accent = isDark ? "#00FF94" : "#00cc77";
  const dispatch = useAppDispatch();

  const { walletBalance, walletTransactions, loadingWithdraw, loadingBalance } =
    useAppSelector((s) => s.payment);

  const [timedOut, setTimedOut] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  useEffect(() => {
    dispatch(getWalletBalance());
    dispatch(getWalletTransactions({ page: 1, limit: 10 }));
    return () => {
      dispatch(clearPaymentState());
    };
  }, [dispatch]);

  const handleAmountInput = (text: string, setFieldValue: any) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setFieldValue(
      "amount",
      numeric ? parseInt(numeric, 10).toLocaleString() : "",
    );
  };

  const parsedAmount = (val: string) =>
    parseInt((val || "").replace(/,/g, ""), 10);

  const handleWithdraw = async (values: { amount: string; reason: string }) => {
    const num = parsedAmount(values.amount);
    const amountInKobo = num * 100;
    try {
      const result = await dispatch(
        withdrawFunds({ amount: amountInKobo, reason: values.reason }),
      ).unwrap();
      if (result.authorizationUrl) {
        await WebBrowser.openBrowserAsync(result.authorizationUrl);
      }
      setTimedOut(false);
      setAwaitingConfirmation(true);
      setTimeout(() => {
        setAwaitingConfirmation(false);
        setTimedOut(true);
        dispatch(getWalletBalance());
        dispatch(getWalletTransactions({ page: 1, limit: 10 }));
      }, 120000);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Withdrawal failed",
        text2: err?.msg || "Could not process withdrawal",
      });
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

  const cardBg = isDark ? "#111" : "#F9FAFB";
  const cardBorder = isDark ? "#222" : "#F0F0F0";
  const mutedColor = isDark ? "#666" : "#999";
  const inputBg = isDark ? "#181818" : "#F5F5F5";
  const inputColor = isDark ? "#fff" : "#111";

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
          Withdraw
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                ₦{((walletBalance?.balance ?? 0) / 100).toLocaleString()}
              </Text>
            )}
          </View>

          <Formik
            initialValues={{ amount: "", reason: "" }}
            validationSchema={validationSchema}
            onSubmit={handleWithdraw}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit: formikSubmit,
              setFieldValue,
              values,
              errors,
              touched,
            }) => {
              const num = parsedAmount(values.amount);
              const isValidAmount = !isNaN(num) && num >= 100;

              return (
                <>
                  {/* Amount input */}
                  <ThemedText
                    style={{ fontSize: 13, fontWeight: "600", marginBottom: 8 }}
                  >
                    Amount
                  </ThemedText>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: inputBg,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        touched.amount && errors.amount
                          ? "#FF4D4F"
                          : cardBorder,
                      paddingHorizontal: 16,
                      marginBottom: 6,
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
                      value={values.amount}
                      onChangeText={(text) =>
                        handleAmountInput(text, setFieldValue)
                      }
                      onBlur={handleBlur("amount")}
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
                  {touched.amount && errors.amount ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#FF4D4F",
                        marginBottom: 6,
                      }}
                    >
                      {errors.amount}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 12,
                        color: mutedColor,
                        marginBottom: 16,
                        lineHeight: 18,
                      }}
                    >
                      Amount must be ≤ wallet balance
                    </Text>
                  )}

                  {/* Quick select amounts */}
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 24,
                    }}
                  >
                    {QUICK_AMOUNTS.map((q) => {
                      const isSelected = num === q;
                      return (
                        <TouchableOpacity
                          key={q}
                          onPress={() =>
                            setFieldValue("amount", q.toLocaleString())
                          }
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
                              color: isSelected
                                ? "#000"
                                : isDark
                                  ? "#fff"
                                  : "#111",
                            }}
                          >
                            ₦{q.toLocaleString()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Reason */}
                  <InputField
                    label="Reason"
                    placeholder="e.g. Cash out for the month"
                    value={values.reason}
                    onChangeText={handleChange("reason")}
                    onBlur={handleBlur("reason")}
                    errorMessage={
                      touched.reason && errors.reason ? errors.reason : ""
                    }
                  />

                  <Text
                    style={{
                      fontSize: 12,
                      color: mutedColor,
                      textAlign: "center",
                      marginBottom: 20,
                      lineHeight: 18,
                    }}
                  >
                    {
                      "You'll be taken to Paystack to complete the withdrawal. Funds will be transferred to your linked bank account after confirmation."
                    }
                  </Text>

                  <CustomButton
                    primary
                    title={
                      loadingWithdraw
                        ? "Processing..."
                        : `Withdraw ₦${isValidAmount ? num.toLocaleString() : "0"}`
                    }
                    onPress={() => formikSubmit()}
                    loading={loadingWithdraw}
                    disabled={
                      !isValidAmount || loadingWithdraw || awaitingConfirmation
                    }
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
                          const isCredit =
                            tx.type === "credit" || tx.type === "fund";
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
                                  backgroundColor: isCredit
                                    ? "#0D2B1F"
                                    : "#2B0000",
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
                                  {new Date(tx.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    },
                                  )}
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
                                {tx.amount.toLocaleString()}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </>
              );
            }}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation overlay */}
      {(awaitingConfirmation || timedOut) && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#1A1A1A" : "#fff",
              borderRadius: 20,
              padding: 28,
              alignItems: "center",
              width: "100%",
              gap: 12,
            }}
          >
            {timedOut ? (
              <>
                <MaterialIcons
                  name="help-outline"
                  size={40}
                  color={mutedColor}
                />
                <ThemedText
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  Timed Out
                </ThemedText>
                <Text
                  style={{
                    fontSize: 13,
                    color: mutedColor,
                    textAlign: "center",
                  }}
                >
                  Could not confirm withdrawal status. Check your balance or try
                  again.
                </Text>
                <TouchableOpacity
                  onPress={handleCheckAgain}
                  style={{
                    backgroundColor: accent,
                    borderRadius: 10,
                    paddingVertical: 14,
                    paddingHorizontal: 32,
                    width: "100%",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <Text style={{ fontWeight: "600", color: "#000" }}>
                    Check Again
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={{ paddingVertical: 10 }}
                >
                  <Text style={{ color: mutedColor, fontSize: 13 }}>
                    Dismiss
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <ActivityIndicator color={accent} size="large" />
                <ThemedText style={{ fontSize: 18, fontWeight: "700" }}>
                  Confirming Withdrawal...
                </ThemedText>
                <Text
                  style={{
                    fontSize: 13,
                    color: mutedColor,
                    textAlign: "center",
                  }}
                >
                  Please wait while we confirm your withdrawal.
                </Text>
              </>
            )}
          </View>
        </View>
      )}
    </SafeAreaScreen>
  );
}
