import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Icon } from "@/components/ui/Icon";
import SectionCard from "@/components/ui/SectionCard";
import StepBar from "@/components/ui/StepBar";
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

export default function AdminSignup() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

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

              <View style={{ marginTop: 20, marginBottom: -8 }}>
                <StepBar step={1} />
              </View>

              <SectionCard title="Personal Info">
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
                      placeholder="Admin"
                      value="Admin"
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
              </SectionCard>

              <SectionCard title="Account Details" style={{ marginBottom: 24 }}>
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
              </SectionCard>

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
