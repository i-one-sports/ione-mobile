import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  View,
} from "react-native";

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
            <ThemedText
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: s <= step ? "#000" : "#aaa",
              }}
            >
              {s}
            </ThemedText>
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

export default function AdminSignup() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [pitchName, setPitchName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!lastName.trim()) e.lastName = "Required";
    if (!role.trim()) e.role = "Required";
    if (!pitchName.trim()) e.pitchName = "Required";
    if (!location.trim()) e.location = "Required";
    if (!email.trim()) e.email = "Required";
    if (!phoneNumber.trim()) e.phoneNumber = "Required";
    if (!password.trim()) e.password = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    router.push({
      pathname: "/(onboarding)/admin-signup-2",
      params: {
        firstName,
        lastName,
        role,
        pitchName,
        location,
        email,
        phoneNumber,
        password,
      },
    });
  };

  const sectionBg = isDark ? "#111" : "#F9FAFB";
  const sectionBorder = isDark ? "#222" : "#F0F0F0";

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
            <StepBar step={1} />
          </View>

          {/* Personal Info section */}
          <View
            style={{
              backgroundColor: sectionBg,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: sectionBorder,
              padding: 16,
              gap: 4,
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
                marginBottom: 8,
              }}
            >
              Personal Info
            </ThemedText>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="First Name"
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName}
                  errorMessage={errors.firstName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                  errorMessage={errors.lastName}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Role"
                  placeholder="Manager"
                  value={role}
                  onChangeText={setRole}
                  errorMessage={errors.role}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Pitch Name"
                  placeholder="e.g. ST Arena"
                  value={pitchName}
                  onChangeText={setPitchName}
                  errorMessage={errors.pitchName}
                />
              </View>
            </View>

            <InputField
              label="Location"
              placeholder="N0 11, Trinity Estate, Awoyaya"
              value={location}
              onChangeText={setLocation}
              errorMessage={errors.location}
            />
          </View>

          {/* Account section */}
          <View
            style={{
              backgroundColor: sectionBg,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: sectionBorder,
              padding: 16,
              gap: 4,
              marginBottom: 24,
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
                marginBottom: 8,
              }}
            >
              Account Details
            </ThemedText>

            <InputField
              label="Email Address"
              placeholder="johndoe123@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              errorMessage={errors.email}
            />
            <InputField
              label="Phone Number"
              placeholder="0806774****"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              errorMessage={errors.phoneNumber}
            />
            <InputField
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChangeText={setPassword}
              password
              errorMessage={errors.password}
            />
          </View>

          <CustomButton
            primary
            title="Continue to Step 2"
            onPress={handleNext}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
