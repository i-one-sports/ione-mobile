import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import CustomCheckbox from "@/components/CustomCheckbox";
import TermsCheckbox from "@/components/ui/TermsCheckbox";
import { Icon } from "@/components/ui/Icon";
import { register } from "@/api/authThunks";
import { useAppDispatch } from "@/redux/store";
import { Entypo } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Toast } from "toastify-react-native";
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

const TIER_OPTIONS = ["Standard", "Premium", "Elite", "VIP"];
const PRICING_OPTIONS = ["Per Game", "Per Hour", "Per Month", "Per Session"];

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
    role: string;
    pitchName: string;
    location: string;
    email: string;
    phoneNumber: string;
    password: string;
  }>();

  const [pitchMax, setPitchMax] = useState("");
  const [pitchSize, setPitchSize] = useState("");
  const [timeFrame, setTimeFrame] = useState("");
  const [tier, setTier] = useState("");
  const [pricingOption, setPricingOption] = useState("");
  const [paymentPerHour, setPaymentPerHour] = useState("");
  const [paymentPerPerson, setPaymentPerPerson] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tierModalVisible, setTierModalVisible] = useState(false);
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!pitchMax.trim()) e.pitchMax = "Required";
    if (!pitchSize.trim()) e.pitchSize = "Required";
    if (!timeFrame.trim()) e.timeFrame = "Required";
    if (!tier) e.tier = "Required";
    if (!pricingOption) e.pricingOption = "Required";
    if (!paymentPerHour.trim()) e.paymentPerHour = "Required";
    if (!bank.trim()) e.bank = "Required";
    if (!accountNumber.trim()) e.accountNumber = "Required";
    if (!acceptedTerms) e.terms = "Please accept the Terms and Conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    const payload = {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      password: params.password,
      phoneNumber: params.phoneNumber,
      address: params.location,
      isOwner: true,
      pitchName: params.pitchName,
      role: params.role,
      pitchMax: Number(pitchMax),
      pitchSize,
      timeFrame,
      tier,
      pricingOption,
      paymentPerHour: Number(paymentPerHour),
      paymentPerPerson: Number(paymentPerPerson),
      bank,
      accountNumber,
      location: { type: "Point", coordinates: [0, 0] },
    };
    dispatch(register(payload as any))
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
        const msg = err?.msg?.message || err?.msg || "Registration failed";
        Toast.show({ type: "error", text1: "Error", text2: msg });
      })
      .finally(() => setLoading(false));
  };

  const chevronColor = isDark ? "#777" : "#aaa";

  return (
    <SafeAreaScreen
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
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
                  value={pitchMax}
                  onChangeText={setPitchMax}
                  keyboardType="numeric"
                  errorMessage={errors.pitchMax}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Pitch Size (M)"
                  placeholder="175m x 180m"
                  value={pitchSize}
                  onChangeText={setPitchSize}
                  errorMessage={errors.pitchSize}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Time Frame"
                  placeholder="9am – 12pm"
                  value={timeFrame}
                  onChangeText={setTimeFrame}
                  errorMessage={errors.timeFrame}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Tier"
                  selectPicker
                  placeholder="Select"
                  value={tier}
                  pickerPressed={() => setTierModalVisible(true)}
                  rightIcon={
                    <Entypo
                      name="chevron-down"
                      size={14}
                      color={chevronColor}
                    />
                  }
                  errorMessage={errors.tier}
                />
              </View>
            </View>
          </SectionCard>

          {/* Pricing */}
          <SectionCard title="Pricing" isDark={isDark}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Pricing Model"
                  selectPicker
                  placeholder="Select"
                  value={pricingOption}
                  pickerPressed={() => setPricingModalVisible(true)}
                  rightIcon={
                    <Entypo
                      name="chevron-down"
                      size={14}
                      color={chevronColor}
                    />
                  }
                  errorMessage={errors.pricingOption}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Per Hour (₦)"
                  placeholder="0.00"
                  value={paymentPerHour}
                  onChangeText={setPaymentPerHour}
                  keyboardType="numeric"
                  errorMessage={errors.paymentPerHour}
                />
              </View>
            </View>
            <InputField
              label="Per Person Monthly (₦)"
              placeholder="0.00"
              value={paymentPerPerson}
              onChangeText={setPaymentPerPerson}
              keyboardType="numeric"
            />
          </SectionCard>

          {/* Bank Details */}
          <SectionCard title="Company Account" isDark={isDark}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Bank"
                  placeholder="Bank Name"
                  value={bank}
                  onChangeText={setBank}
                  errorMessage={errors.bank}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Account No."
                  placeholder="22******54"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                  errorMessage={errors.accountNumber}
                />
              </View>
            </View>
          </SectionCard>

          {/* Terms error */}
          {errors.terms ? (
            <ThemedText
              style={{
                color: "#FF4D4F",
                fontSize: 12,
                marginBottom: 10,
                marginLeft: 2,
              }}
            >
              {errors.terms}
            </ThemedText>
          ) : null}

          {/* Checkboxes */}
          <View style={{ gap: 12, marginBottom: 28 }}>
            <TermsCheckbox
              checked={acceptedTerms}
              onToggle={() => setAcceptedTerms(!acceptedTerms)}
            />
            <CustomCheckbox
              checked={newsletter}
              onToggle={() => setNewsletter(!newsletter)}
              label="Receive Emails From Our Newsletter"
              required={false}
            />
          </View>

          {/* Buttons */}
          <View style={{ gap: 12 }}>
            <CustomButton
              primary
              title={loading ? "Creating Account..." : "Create An Account"}
              onPress={handleSubmit}
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
      </KeyboardAvoidingView>

      <DropdownModal
        visible={tierModalVisible}
        options={TIER_OPTIONS}
        onSelect={setTier}
        onClose={() => setTierModalVisible(false)}
        isDark={isDark}
      />
      <DropdownModal
        visible={pricingModalVisible}
        options={PRICING_OPTIONS}
        onSelect={setPricingOption}
        onClose={() => setPricingModalVisible(false)}
        isDark={isDark}
      />
    </SafeAreaScreen>
  );
}
