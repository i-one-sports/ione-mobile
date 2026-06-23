import { changePassword } from "@/api/ownerDashboardThunk";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
import InputField from "@/components/InputField";
import { ThemedText } from "@/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Formik } from "formik";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import * as yup from "yup";
import { Toast } from "toastify-react-native";
import { useRouter } from "expo-router";

type ChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function AdminChangePasswordScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const handleInputFocus = (yPosition: number) => {
    scrollViewRef.current?.scrollTo({ y: yPosition, animated: true });
  };
  const { loadingChangePassword } = useAppSelector(
    (state) => state.ownerDashboard,
  );
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
      router.replace("/admin/(tabs)");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.message || "Failed to update pitch condition",
      });
    }
  };
  return (
    <View className="flex-1 dark:bg-black">
      <View className="pb-6 pt-16 px-[35px] flex-1">
        <View>
          <View className="flex flex-row items-center justify-between">
            <ThemedText
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-xl"
              darkColor="#FFFFFF"
              lightColor="#000000"
            >
              Change Password
            </ThemedText>
            <TouchableOpacity className="bg-[#00FF943B] rounded-[10px] w-[30px] h-[32px] items-center justify-center">
              <AdminNotificationIcon />
            </TouchableOpacity>
          </View>
        </View>

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
                <TouchableOpacity
                  disabled={loadingChangePassword}
                  onPress={() => handleSubmit()}
                >
                  <ThemedText
                    style={{ fontFamily: "Poppins_500Medium" }}
                    className="text-[#000000] text-center py-5 text-[15px] bg-[#00FF94]"
                  >
                    Confirm Password
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </View>
    </View>
  );
}
