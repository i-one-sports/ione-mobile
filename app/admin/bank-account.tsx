import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Toast } from "toastify-react-native";
import { Formik } from "formik";
import * as Yup from "yup";

import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import InputField from "@/components/InputField";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getBankAccounts,
  getBanks,
  initBankAccount,
  deleteBankAccount,
  defaultBankAccount,
} from "@/api/paymentThunks";

const validationSchema = Yup.object().shape({
  bankName: Yup.string().required("Please select a bank"),
  bankCode: Yup.string().required("Please select a bank"),
  accountNumber: Yup.string()
    .required("Account number is required")
    .matches(/^\d{10}$/, "Must be 10 digits"),
});

export default function BankAccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accent = isDark ? "#00FF94" : "#00cc77";
  const dispatch = useAppDispatch();

  const {
    bankAccounts,
    banks,
    loadingBankAccounts,
    loadingBanks,
    loadingAddBank,
    loadingDeleteBank,
    loadingDefaultBank,
  } = useAppSelector((s) => s.payment);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [selectedBankName, setSelectedBankName] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const formikRef = React.useRef<any>(null);

  useEffect(() => {
    dispatch(getBankAccounts());
    dispatch(getBanks());
  }, [dispatch]);

  useEffect(() => {
    if (showAddModal) {
      setSelectedBankName("");
      formikRef.current?.resetForm();
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showBankPicker) setBankSearch("");
  }, [showBankPicker]);

  const cardBg = isDark ? "#111" : "#F9FAFB";
  const cardBorder = isDark ? "#222" : "#F0F0F0";
  const mutedColor = isDark ? "#666" : "#999";

  const handleAddBank = async (values: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
  }) => {
    try {
      await dispatch(
        initBankAccount({
          accountNumber: values.accountNumber,
          bankCode: values.bankCode,
          bankName: values.bankName,
        }),
      ).unwrap();
      Toast.show({ type: "success", text1: "Bank account added successfully" });
      setShowAddModal(false);
      setSelectedBankName("");
      dispatch(getBankAccounts());
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to add bank account",
        text2: err?.msg || "Please try again",
      });
    }
  };

  const handleDelete = (accountId: string) => {
    Alert.alert(
      "Delete Bank Account",
      "Are you sure you want to remove this bank account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteBankAccount(accountId)).unwrap();
              Toast.show({ type: "success", text1: "Bank account removed" });
              dispatch(getBankAccounts());
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Failed to delete",
                text2: err?.msg,
              });
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      await dispatch(defaultBankAccount(accountId)).unwrap();
      Toast.show({ type: "success", text1: "Default bank updated" });
      dispatch(getBankAccounts());
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to update",
        text2: err?.msg,
      });
    }
  };

  const maskAccount = (num: string) =>
    num.length > 4 ? "••••" + num.slice(-4) : num;

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
          Bank Accounts
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
          {/* Section title */}
          <ThemedText
            style={{ fontSize: 13, fontWeight: "600", marginBottom: 14 }}
            lightColor="#888"
            darkColor="#666"
          >
            SAVED ACCOUNTS
          </ThemedText>

          {loadingBankAccounts && !bankAccounts.length ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator color={accent} size="small" />
            </View>
          ) : bankAccounts.length === 0 ? (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: cardBorder,
                padding: 40,
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name="account-balance"
                size={40}
                color={mutedColor}
              />
              <ThemedText
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  marginTop: 14,
                  marginBottom: 4,
                }}
              >
                No bank accounts yet
              </ThemedText>
              <Text style={{ fontSize: 13, color: mutedColor }}>
                Add a bank account to receive withdrawals
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {bankAccounts.map((account, i) => (
                <View
                  key={account._id || i}
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: account.isDefault ? accent : cardBorder,
                    padding: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: isDark ? "#1A1A1A" : "#EDFFF8",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MaterialIcons
                          name="account-balance"
                          size={20}
                          color={accent}
                        />
                      </View>
                      <View>
                        <ThemedText style={{ fontSize: 15, fontWeight: "700" }}>
                          {account.bankName}
                        </ThemedText>
                        <Text
                          style={{
                            fontSize: 12,
                            color: mutedColor,
                            marginTop: 2,
                          }}
                        >
                          {maskAccount(account.accountNumber)}
                        </Text>
                      </View>
                    </View>
                    {account.isDefault && (
                      <View
                        style={{
                          backgroundColor: `${accent}20`,
                          borderRadius: 20,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: accent,
                          }}
                        >
                          Default
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      borderTopWidth: 1,
                      borderTopColor: cardBorder,
                      paddingTop: 12,
                      gap: 16,
                    }}
                  >
                    {!account.isDefault && (
                      <TouchableOpacity
                        onPress={() =>
                          account._id && handleSetDefault(account._id)
                        }
                        disabled={loadingDefaultBank}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <MaterialIcons
                          name="check-circle-outline"
                          size={16}
                          color={accent}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "500",
                            color: accent,
                          }}
                        >
                          Set as Default
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => account._id && handleDelete(account._id)}
                      disabled={loadingDeleteBank}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={16}
                        color="#FF4444"
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color: "#FF4444",
                        }}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Add button */}
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: isDark ? "#111" : "#F9FAFB",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: cardBorder,
              borderStyle: "dashed",
              paddingVertical: 18,
              marginTop: 16,
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={accent} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: accent }}>
              Add Bank Account
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Bank Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() => setShowAddModal(false)}
        >
          <Pressable
            style={{
              backgroundColor: isDark ? "#1A1A1A" : "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 20,
              paddingBottom: 40,
              paddingHorizontal: 20,
            }}
            onPress={() => {}}
          >
            {/* Modal handle */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: isDark ? "#333" : "#DDD",
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            <ThemedText
              style={{ fontSize: 18, fontWeight: "700", marginBottom: 20 }}
            >
              Add Bank Account
            </ThemedText>

            <Formik
              innerRef={formikRef}
              initialValues={{ bankName: "", bankCode: "", accountNumber: "" }}
              validationSchema={validationSchema}
              onSubmit={handleAddBank}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit: formikSubmit,
                setFieldValue,
                values,
                errors,
                touched,
              }) => (
                <>
                  <InputField
                    label="Bank"
                    selectPicker
                    placeholder="Select your bank"
                    value={values.bankName}
                    pickerPressed={() => setShowBankPicker(true)}
                    rightIcon={
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={mutedColor}
                      />
                    }
                    errorMessage={
                      touched.bankName && errors.bankName ? errors.bankName : ""
                    }
                  />

                  <InputField
                    label="Account Number"
                    placeholder="e.g. 0123456789"
                    keyboardType="numeric"
                    maxLength={10}
                    value={values.accountNumber}
                    onChangeText={handleChange("accountNumber")}
                    onBlur={handleBlur("accountNumber")}
                    errorMessage={
                      touched.accountNumber && errors.accountNumber
                        ? errors.accountNumber
                        : ""
                    }
                  />

                  <CustomButton
                    primary
                    title={loadingAddBank ? "Adding..." : "Add Account"}
                    onPress={() => formikSubmit()}
                    loading={loadingAddBank}
                    disabled={loadingAddBank}
                    style={{ marginTop: 8 }}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      setShowAddModal(false);
                      setSelectedBankName("");
                    }}
                    style={{ alignItems: "center", paddingVertical: 14 }}
                  >
                    <Text style={{ fontSize: 14, color: mutedColor }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bank Picker Modal */}
      <Modal
        visible={showBankPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBankPicker(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
          onPress={() => setShowBankPicker(false)}
        >
          <Pressable
            style={{
              backgroundColor: isDark ? "#1A1A1A" : "#fff",
              borderRadius: 16,
              maxHeight: "70%",
              overflow: "hidden",
            }}
            onPress={() => {}}
          >
            <View
              style={{
                padding: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: cardBorder,
              }}
            >
              <ThemedText
                style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}
              >
                Select Bank
              </ThemedText>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isDark ? "#222" : "#F5F5F5",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  height: 42,
                }}
              >
                <Ionicons name="search" size={16} color={mutedColor} />
                <TextInput
                  value={bankSearch}
                  onChangeText={setBankSearch}
                  placeholder="Search banks..."
                  placeholderTextColor={mutedColor}
                  autoFocus
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: isDark ? "#fff" : "#111",
                    marginLeft: 8,
                  }}
                />
                {bankSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setBankSearch("")}>
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={mutedColor}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {loadingBanks ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <ActivityIndicator color={accent} size="small" />
              </View>
            ) : (
              <FlatList
                data={banks.filter((b) =>
                  b.name.toLowerCase().includes(bankSearch.toLowerCase()),
                )}
                keyExtractor={(item) => item._id}
                renderItem={({ item: bank, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedBankName(bank.name);
                      formikRef.current?.setFieldValue("bankName", bank.name);
                      formikRef.current?.setFieldValue("bankCode", bank.code);
                      setShowBankPicker(false);
                    }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: isDark ? "#2a2a2a" : "#f2f2f2",
                      backgroundColor:
                        selectedBankName === bank.name
                          ? isDark
                            ? "#0D2B1F"
                            : "#EDFFF8"
                          : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: isDark ? "#fff" : "#111",
                      }}
                    >
                      {bank.name}
                    </Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 400 }}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaScreen>
  );
}
