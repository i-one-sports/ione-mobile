import { changePassword } from "@/api/ownerDashboardThunk";
import InputField from "@/components/InputField";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Formik } from "formik";
import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as yup from "yup";
import { Toast } from "toastify-react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/ui/CustomButton";

type ChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function AdminChangePasswordScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const dispatch = useAppDispatch();
  const router = useRouter();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const handleInputFocus = (yPosition: number) => {
    scrollViewRef.current?.scrollTo({ y: yPosition, animated: true });
  };
  const { loadingChangePassword } = useAppSelector(
    (state) => state.ownerDashboard,
  );

  const screenBg = isDark ? "#000" : "#FAFAFA";

  const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };
  const changePasswordValidationSchema = yup.object().shape({
    newPassword: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });
  const handleSubmit = async (values: ChangePasswordInput) => {
    const payload = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword,
    };
    try {
      const res = await dispatch(changePassword(payload)).unwrap();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: res.message,
      });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.message || "Failed to update pitch condition",
      });
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: screenBg }}>
      <View className="pb-6 pt-16 px-[20px] flex-1">
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 32,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#fff" : "#111"}
            />
          </TouchableOpacity>
          <ThemedText
            style={{ fontFamily: "Poppins_600SemiBold", fontSize: 17 }}
            lightColor="#000"
            darkColor="#fff"
          >
            Change Password
          </ThemedText>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={changePasswordValidationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              touched,
              handleBlur,
              setFieldValue,
            }) => (
              <View className="flex-1">
                <View className="mt-12">
                  <InputField
                    password
                    required
                    label="Old Password"
                    autoCapitalize="none"
                    placeholder="Old Password"
                    value={values.oldPassword}
                    onChangeText={handleChange("oldPassword")}
                    onBlur={handleBlur("oldPassword")}
                    onFocus={() => handleInputFocus(100)}
                    errorMessage={
                      touched.oldPassword && errors.oldPassword
                        ? errors.oldPassword
                        : ""
                    }
                  />
                  <InputField
                    password
                    required
                    label="New Password"
                    autoCapitalize="none"
                    placeholder="New Password"
                    value={values.newPassword}
                    onChangeText={handleChange("newPassword")}
                    onBlur={handleBlur("newPassword")}
                    onFocus={() => handleInputFocus(100)}
                    errorMessage={
                      touched.newPassword && errors.newPassword
                        ? errors.newPassword
                        : ""
                    }
                  />
                  <InputField
                    password
                    required
                    label="Confirm New Password"
                    autoCapitalize="none"
                    value={values.confirmNewPassword}
                    placeholder="Confirm New Password"
                    onChangeText={handleChange("confirmNewPassword")}
                    onBlur={handleBlur("confirmNewPassword")}
                    onFocus={() => handleInputFocus(100)}
                    errorMessage={
                      touched.confirmNewPassword && errors.confirmNewPassword
                        ? errors.confirmNewPassword
                        : ""
                    }
                  />
                </View>
                <View className="mt-auto mb-[42px]">
                  <CustomButton
                    primary
                    title={
                      loadingChangePassword ? "Updating..." : "Confirm Password"
                    }
                    disabled={loadingChangePassword}
                    onPress={() => handleSubmit()}
                  />
                </View>
              </View>
            )}
          </Formik>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
