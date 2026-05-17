import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  View,
} from "react-native";

const schema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  pitchName: Yup.string().required("Required"),
  address: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  phoneNumber: Yup.string().required("Required"),
  password: Yup.string().min(6, "Min 6 characters").required("Required"),
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
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            pitchName: "",
            address: "",
            email: "",
            phoneNumber: "",
            password: "",
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            router.push({
              pathname: "/(onboarding)/admin-signup-2",
              params: values,
            });
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
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
                <StepBar step={1} />
              </View>

              {/* Personal Info */}
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
                      value={values.firstName}
                      onChangeText={handleChange("firstName")}
                      onBlur={handleBlur("firstName")}
                      errorMessage={
                        touched.firstName ? errors.firstName : undefined
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Last Name"
                      placeholder="Doe"
                      value={values.lastName}
                      onChangeText={handleChange("lastName")}
                      onBlur={handleBlur("lastName")}
                      errorMessage={
                        touched.lastName ? errors.lastName : undefined
                      }
                    />
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Role"
                      placeholder="Manager"
                      value="Manager"
                      editable={false}
                      onChangeText={() => {}}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Pitch Name"
                      placeholder="e.g. ST Arena"
                      value={values.pitchName}
                      onChangeText={handleChange("pitchName")}
                      onBlur={handleBlur("pitchName")}
                      errorMessage={
                        touched.pitchName ? errors.pitchName : undefined
                      }
                    />
                  </View>
                </View>

                <InputField
                  label="Address"
                  placeholder="N0 11, Trinity Estate, Awoyaya"
                  value={values.address}
                  onChangeText={handleChange("address")}
                  onBlur={handleBlur("address")}
                  errorMessage={touched.address ? errors.address : undefined}
                />
              </View>

              {/* Account Details */}
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
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  errorMessage={touched.email ? errors.email : undefined}
                />
                <InputField
                  label="Phone Number"
                  placeholder="0806774****"
                  value={values.phoneNumber}
                  onChangeText={handleChange("phoneNumber")}
                  onBlur={handleBlur("phoneNumber")}
                  keyboardType="phone-pad"
                  errorMessage={
                    touched.phoneNumber ? errors.phoneNumber : undefined
                  }
                />
                <InputField
                  label="Password"
                  placeholder="••••••••••••"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  password
                  errorMessage={touched.password ? errors.password : undefined}
                />
              </View>

              <CustomButton
                primary
                title="Continue to Step 2"
                onPress={() => handleSubmit()}
              />
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
