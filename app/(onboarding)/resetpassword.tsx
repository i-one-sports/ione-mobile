 
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
 
 
 
import {
  Dimensions,
  View,
  useColorScheme,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import * as yup from "yup";
import * as React from "react";
import { Formik } from "formik";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import Loader from "@/components/loader";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { Colors } from "@/constants/Colors";
import { Icon } from "@/components/ui/Icon";
import { useAppDispatch } from "@/redux/store";
import { reset } from "@/api/authThunks";
import { Toast } from "toastify-react-native";

const { width } = Dimensions.get("screen");

const validationSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

export default function ResetPassword() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { bottom } = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; otp?: string }>();
  const dispatch = useAppDispatch();
  const email = params.email ?? "";
  const otp = params.otp ?? "";

  React.useEffect(() => {
    if (!email || !otp) {
      router.replace("/forgottenpassword");
    }
  }, [email, otp, router]);

  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!email || !otp) {
      Toast.show({
        type: "error",
        text1: "Missing information",
        text2: "Please re-start the password reset flow.",
      });
      router.replace("/forgottenpassword");
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(
        reset({
          email,
          otp,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      ).unwrap();

      Toast.show({
        type: "success",
        text1: response.message || "Password reset successful",
      });
      router.replace("/success");
    } catch (error: any) {
      const message =
        error?.msg?.message || error?.msg || "Unable to reset password";
      Toast.show({ type: "error", text1: "Error", text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaScreen className="mt-[52px]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 21,
          paddingBottom: bottom + 40,
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        <View>
          <View className="mb-8 items-center">
            <Icon />
          </View>

          <View className="mb-8 flex flex-col items-center gap-[5px]">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="mb-2 text-center text-[20px] font-[600]"
            >
              Reset Password
            </ThemedText>
            <ThemedText
              lightColor="#6C757D"
              darkColor="#9BA1A6"
              className="px-4 text-center text-base leading-6"
            >
              Your password must be different from your old password.
            </ThemedText>
          </View>

          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View className="mt-[20px] items-center">
                <InputField
                  password
                  required
                  label="Password"
                  autoCapitalize="none"
                  placeholder="Enter your password"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  errorMessage={
                    touched.password && errors.password ? errors.password : ""
                  }
                />
                <InputField
                  password
                  required
                  label="Confirm Password"
                  autoCapitalize="none"
                  placeholder="Confirm password"
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  errorMessage={
                    touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : ""
                  }
                />

                <View className="flex flex-col gap-[10px] mt-6 w-full">
                  <CustomButton
                    primary
                    title={loading ? "Saving..." : "Continue"}
                    onPress={() => handleSubmit()}
                    disabled={loading}
                  />
                  <TouchableOpacity
                    onPress={() => router.push("/signin")}
                    className="bg flex w-full items-center justify-center rounded-[6px] border-[1px] border-[#0C4D2E] py-[18px]"
                  >
                    <Text className="text-primaryDark">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
      <Loader visible={loading} />
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 130,
    height: 60,
  },
});
