import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import CustomCheckbox from "@/components/CustomCheckbox";
import TermsCheckbox from "@/components/ui/TermsCheckbox";
import { Icon } from "@/components/ui/Icon";
import GeolocationComponent from "@/components/GeoLocation";
import Loader from "@/components/loader";
import { registerOwner } from "@/api/authThunks";
import { useAppDispatch } from "@/redux/store";
import { Entypo } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Toast } from "toastify-react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const TIER_OPTIONS = ["free", "paid"];
const PRICING_OPTIONS = ["hourly", "daily", "monthly", "session"];

const schema = Yup.object({
  pitchMax: Yup.string().required("Required"),
  pitchSize: Yup.string().required("Required"),
  openingHour: Yup.string().required("Required"),
  closingHour: Yup.string().required("Required"),
  tier: Yup.string().required("Required"),
  pricingOption: Yup.string().required("Required"),
  paymentPerPersonHourly: Yup.string().required("Required"),
  bankCode: Yup.string().required("Required"),
  bankName: Yup.string().required("Required"),
  accountNumber: Yup.string().required("Required"),
  termsAccepted: Yup.boolean().oneOf(
    [true],
    "Please accept the Terms and Conditions",
  ),
});

function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 28,
      }}
    >
      {[1, 2].map((s, i) => (
        <View
          key={s}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: s <= step ? "#00FF94" : "transparent",
              borderWidth: 1.5,
              borderColor: s <= step ? "#00FF94" : "#ccc",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: s <= step ? "#000" : "#aaa",
              }}
            >
              {s}
            </Text>
          </View>
          {i === 0 && (
            <View
              style={{
                width: 32,
                height: 1.5,
                backgroundColor: step >= 2 ? "#00FF94" : "#ddd",
              }}
            />
          )}
        </View>
      ))}
      <ThemedText
        lightColor="#999"
        darkColor="#666"
        style={{ fontSize: 12, marginLeft: 4 }}
      >
        Step {step} of 2
      </ThemedText>
    </View>
  );
}

function DropdownModal({
  visible,
  options,
  onSelect,
  onClose,
  isDark,
}: {
  visible: boolean;
  options: string[];
  onSelect: (v: string) => void;
  onClose: () => void;
  isDark: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: isDark ? "#1a1a1a" : "#fff",
            borderRadius: 16,
            overflow: "hidden",
          }}
          onPress={() => {}}
        >
          {options.map((opt, i) => (
            <TouchableOpacity
              key={opt}
              onPress={() => {
                onSelect(opt);
                onClose();
              }}
              style={{
                paddingVertical: 15,
                paddingHorizontal: 20,
                borderBottomWidth: i < options.length - 1 ? 1 : 0,
                borderBottomColor: isDark ? "#2a2a2a" : "#f2f2f2",
              }}
            >
              <Text style={{ fontSize: 14, color: isDark ? "#fff" : "#111" }}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SectionCard({
  title,
  children,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: isDark ? "#111" : "#F9FAFB",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: isDark ? "#222" : "#F0F0F0",
        padding: 16,
        marginBottom: 16,
      }}
    >
      <ThemedText
        lightColor="#555"
        darkColor="#aaa"
        style={{
          fontSize: 11,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 12,
        }}
      >
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

export default function AdminSignup2() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    pitchName: string;
    address: string;
    email: string;
    phoneNumber: string;
    password: string;
  }>();

  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  const [tierModalVisible, setTierModalVisible] = useState(false);
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const chevronColor = isDark ? "#777" : "#aaa";

  return (
    <SafeAreaScreen
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      <Loader visible={loading} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <Formik
          initialValues={{
            pitchMax: "",
            pitchSize: "",
            openingHour: "",
            closingHour: "",
            tier: "",
            pricingOption: "",
            paymentPerPersonHourly: "",
            bankCode: "",
            bankName: "",
            accountNumber: "",
            termsAccepted: false,
            newsletterOptIn: false,
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            setLoading(true);
            const payload = {
              user: {
                firstName: params.firstName,
                lastName: params.lastName,
                email: params.email,
                phoneNumber: params.phoneNumber,
                password: params.password,
                role: "Manager",
              },
              location: {
                name: params.pitchName,
                address: params.address,
                openingHour: values.openingHour,
                closingHour: values.closingHour,
                pitchMax: values.pitchMax,
                pitchSize: values.pitchSize,
                tier: values.tier,
                pricingOption: values.pricingOption,
                paymentPerPersonHourly: Number(values.paymentPerPersonHourly),
                location: { coordinates },
              },
              payout: {
                bankCode: values.bankCode,
                bankName: values.bankName,
                accountNumber: values.accountNumber,
              },
              termsAccepted: values.termsAccepted,
              newsletterOptIn: values.newsletterOptIn,
            };
            dispatch(registerOwner(payload))
              .unwrap()
              .then((res) => {
                Toast.show({
                  type: "success",
                  text1: "Account created!",
                  text2: res.message || "Please sign in.",
                });
                router.replace("/(onboarding)/signin");
              })
              .catch((err) => {
                const msg =
                  err?.msg?.message || err?.msg || "Registration failed";
                Toast.show({ type: "error", text1: "Error", text2: msg });
              })
              .finally(() => setLoading(false));
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
          }) => (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingBottom: 48,
                }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    marginTop: 28,
                    marginBottom: 6,
                  }}
                >
                  <View>
                    <ThemedText
                      lightColor="#999"
                      darkColor="#666"
                      style={{ fontSize: 12, marginBottom: 4 }}
                    >
                      Admin Registration
                    </ThemedText>
                    <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
                      Create An Account
                    </ThemedText>
                  </View>
                  <Icon />
                </View>

                <View style={{ marginTop: 20 }}>
                  <StepBar step={2} />
                </View>

                {/* Pitch Details */}
                <SectionCard title="Pitch Details" isDark={isDark}>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Max Players"
                        placeholder="5 x 5"
                        value={values.pitchMax}
                        onChangeText={handleChange("pitchMax")}
                        onBlur={handleBlur("pitchMax")}
                        errorMessage={
                          touched.pitchMax ? errors.pitchMax : undefined
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Pitch Size (M)"
                        placeholder="175m x 180m"
                        value={values.pitchSize}
                        onChangeText={handleChange("pitchSize")}
                        onBlur={handleBlur("pitchSize")}
                        errorMessage={
                          touched.pitchSize ? errors.pitchSize : undefined
                        }
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Opening Hour"
                        placeholder="09:00"
                        value={values.openingHour}
                        onChangeText={handleChange("openingHour")}
                        onBlur={handleBlur("openingHour")}
                        errorMessage={
                          touched.openingHour ? errors.openingHour : undefined
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Closing Hour"
                        placeholder="22:00"
                        value={values.closingHour}
                        onChangeText={handleChange("closingHour")}
                        onBlur={handleBlur("closingHour")}
                        errorMessage={
                          touched.closingHour ? errors.closingHour : undefined
                        }
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Tier"
                        selectPicker
                        placeholder="Select"
                        value={values.tier}
                        pickerPressed={() => setTierModalVisible(true)}
                        rightIcon={
                          <Entypo
                            name="chevron-down"
                            size={14}
                            color={chevronColor}
                          />
                        }
                        errorMessage={touched.tier ? errors.tier : undefined}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Pricing Model"
                        selectPicker
                        placeholder="Select"
                        value={values.pricingOption}
                        pickerPressed={() => setPricingModalVisible(true)}
                        rightIcon={
                          <Entypo
                            name="chevron-down"
                            size={14}
                            color={chevronColor}
                          />
                        }
                        errorMessage={
                          touched.pricingOption
                            ? errors.pricingOption
                            : undefined
                        }
                      />
                    </View>
                  </View>
                  <InputField
                    label="Price per Person / Hour (₦)"
                    placeholder="2500"
                    value={values.paymentPerPersonHourly}
                    onChangeText={handleChange("paymentPerPersonHourly")}
                    onBlur={handleBlur("paymentPerPersonHourly")}
                    keyboardType="numeric"
                    errorMessage={
                      touched.paymentPerPersonHourly
                        ? errors.paymentPerPersonHourly
                        : undefined
                    }
                  />
                </SectionCard>

                {/* Location */}
                <SectionCard title="Location" isDark={isDark}>
                  <GeolocationComponent
                    setCoordinates={setCoordinates}
                    label="Pitch Coordinates"
                  />
                </SectionCard>

                {/* Bank Details */}
                <SectionCard title="Company Account" isDark={isDark}>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Bank Name"
                        placeholder="GTBank"
                        value={values.bankName}
                        onChangeText={handleChange("bankName")}
                        onBlur={handleBlur("bankName")}
                        errorMessage={
                          touched.bankName ? errors.bankName : undefined
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Bank Code"
                        placeholder="058"
                        value={values.bankCode}
                        onChangeText={handleChange("bankCode")}
                        onBlur={handleBlur("bankCode")}
                        keyboardType="numeric"
                        errorMessage={
                          touched.bankCode ? errors.bankCode : undefined
                        }
                      />
                    </View>
                  </View>
                  <InputField
                    label="Account Number"
                    placeholder="0123456789"
                    value={values.accountNumber}
                    onChangeText={handleChange("accountNumber")}
                    onBlur={handleBlur("accountNumber")}
                    keyboardType="numeric"
                    errorMessage={
                      touched.accountNumber ? errors.accountNumber : undefined
                    }
                  />
                </SectionCard>

                {/* Terms error */}
                {touched.termsAccepted && errors.termsAccepted ? (
                  <ThemedText
                    style={{
                      color: "#FF4D4F",
                      fontSize: 12,
                      marginBottom: 10,
                      marginLeft: 2,
                    }}
                  >
                    {errors.termsAccepted}
                  </ThemedText>
                ) : null}

                {/* Checkboxes */}
                <View style={{ gap: 12, marginBottom: 28 }}>
                  <TermsCheckbox
                    checked={values.termsAccepted}
                    onToggle={() =>
                      setFieldValue("termsAccepted", !values.termsAccepted)
                    }
                  />
                  <CustomCheckbox
                    checked={values.newsletterOptIn}
                    onToggle={() =>
                      setFieldValue("newsletterOptIn", !values.newsletterOptIn)
                    }
                    label="Receive Emails From Our Newsletter"
                    required={false}
                  />
                </View>

                {/* Buttons */}
                <View style={{ gap: 12 }}>
                  <CustomButton
                    primary
                    title="Create An Account"
                    onPress={() => handleSubmit()}
                    disabled={loading}
                    loading={loading}
                  />
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ alignItems: "center", paddingVertical: 12 }}
                  >
                    <ThemedText
                      lightColor="#999"
                      darkColor="#666"
                      style={{ fontSize: 13 }}
                    >
                      ← Back to Step 1
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <DropdownModal
                visible={tierModalVisible}
                options={TIER_OPTIONS}
                onSelect={(v) => setFieldValue("tier", v)}
                onClose={() => setTierModalVisible(false)}
                isDark={isDark}
              />
              <DropdownModal
                visible={pricingModalVisible}
                options={PRICING_OPTIONS}
                onSelect={(v) => setFieldValue("pricingOption", v)}
                onClose={() => setPricingModalVisible(false)}
                isDark={isDark}
              />
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
