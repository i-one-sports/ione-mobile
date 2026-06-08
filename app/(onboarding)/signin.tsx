import { Formik } from "formik";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import * as yup from "yup";
import { login } from "@/api/authThunks";
import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Icon } from "@/components/ui/Icon";
import { useAppDispatch } from "@/redux/store";
import { useRouter } from "expo-router";
import { Toast } from "toastify-react-native";

type SigninInput = {
  email: string;
  password: string;
};

const signinValidationSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(5, "Password must be at least 6 characters"),
});

export default function SignIn() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const initialValues: SigninInput = { email: "", password: "" };

  const handleSubmit = async (values: SigninInput) => {
    setLoading(true);
    dispatch(login(values))
      .unwrap()
      .then((response) => {
        Toast.show({
          type: "success",
          text1: response.message || "Login successful",
        });
        // Keep loading=true — AppNavigator reads role from getUser() and routes to the
        // correct dashboard. This component unmounts on navigation; no need to reset.
      })
      .catch((err) => {
        setLoading(false);
        const message = err?.msg?.message || err?.msg || "Login failed";
        Toast.show({ type: "error", text1: "Error", text2: message });
      });
  };

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
          initialValues={initialValues}
          validationSchema={signinValidationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleSubmit: formikSubmit,
            values,
            errors,
            touched,
            handleBlur,
          }) => (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: 48,
                flexGrow: 1,
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
                  marginBottom: 40,
                }}
              >
                <View>
                  <ThemedText
                    lightColor="#999"
                    darkColor="#666"
                    style={{ fontSize: 12, marginBottom: 4 }}
                  >
                    Welcome Back
                  </ThemedText>
                  <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
                    Sign In
                  </ThemedText>
                </View>
                <Icon />
              </View>

              {/* Credentials card */}
              <View
                style={{
                  backgroundColor: isDark ? "#111" : "#F9FAFB",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isDark ? "#222" : "#F0F0F0",
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <InputField
                  label="Email Address"
                  placeholder="johndoe@gmail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  errorMessage={
                    touched.email && errors.email ? errors.email : ""
                  }
                />
                <InputField
                  password
                  label="Password"
                  placeholder="••••••••••••"
                  autoCapitalize="none"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  errorMessage={
                    touched.password && errors.password ? errors.password : ""
                  }
                />
              </View>

              {/* Forgot password */}
              <View style={{ alignItems: "flex-end", marginBottom: 32 }}>
                <TouchableOpacity
                  onPress={() => router.push("/forgottenpassword")}
                  hitSlop={8}
                >
                  <ThemedText
                    lightColor="#46BB1C"
                    darkColor="#00FF94"
                    style={{ fontSize: 13, fontWeight: "500" }}
                  >
                    Forgot Password?
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View className="">
                <CustomButton
                  primary
                  title={loading ? "Signing In..." : "Sign In"}
                  onPress={() => formikSubmit()}
                  disabled={loading}
                  loading={loading}
                />
              </View>

              {/* Sign up link */}
              <View style={{ alignItems: "center", marginTop: 28 }}>
                <TouchableOpacity
                  onPress={() => router.push("/(onboarding)/role")}
                  hitSlop={8}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ThemedText
                      lightColor="#6C757D"
                      darkColor="#9BA1A6"
                      style={{ fontSize: 14 }}
                    >
                      &apos;Don&apos;t have an account?{" "}
                    </ThemedText>
                    <ThemedText
                      lightColor="#46BB1C"
                      darkColor="#00FF94"
                      style={{ fontSize: 14, fontWeight: "600" }}
                    >
                      Sign Up
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
