 
 
 
 
 
 
 
import {
  Dimensions,
  View,
  useColorScheme,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import * as yup from "yup";
import * as React from "react";
import { Formik } from "formik";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Loader from "@/components/loader";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import InputField from "@/components/InputField";
import { useRouter } from "expo-router";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { Colors } from "@/constants/Colors";
import { Icon } from "@/components/ui/Icon";
import { useAppDispatch } from "@/redux/store";
import { forgotPassword } from "@/api/authThunks";
import { Toast } from "toastify-react-native";

const { height } = Dimensions.get("screen");

const validationSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgottenPassword() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { bottom } = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      await dispatch(forgotPassword({ email: values.email })).unwrap();
      Toast.show({
        type: "success",
        text1: "Verification code sent",
      });
      router.push({
        pathname: "/(onboarding)/verify",
        params: { email: values.email },
      });
    } catch (error: any) {
      const message =
        error?.msg?.message || error?.msg || "Unable to send code";
      Toast.show({ type: "error", text1: "Error", text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaScreen className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 21,
          paddingBottom: bottom + 20,
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        <View className="w-full items-center mt-[3%]">
          <View className="mb-8 items-center">
            <Icon />
          </View>

          <View className="mb-8 flex flex-col items-center gap-[5px]">
            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="mb-2 text-center text-[20px] font-[600]"
            >
              Forgotten Password?
            </ThemedText>
            <ThemedText
              lightColor="#6C757D"
              darkColor="#9BA1A6"
              className="px-4 text-center text-base leading-6"
            >
              Enter your email to reset password
            </ThemedText>
          </View>

          <Image
            source={require("@/assets/images/thinking.png")}
            resizeMode="contain"
            className="w-[100%] mt-[3%]"
            style={{ height: height * 0.4 }}
          />
        </View>

        <View>
          <Formik
            initialValues={{ email: "" }}
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
              <View className="flex-1">
                <InputField
                  required
                  label="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  errorMessage={
                    touched.email && errors.email ? errors.email : ""
                  }
                />

                <View className="flex flex-col gap-[10px] mt-6">
                  <CustomButton
                    primary
                    title={loading ? "Sending..." : "Get Code"}
                    onPress={() => handleSubmit()}
                    disabled={loading}
                  />
                  <TouchableOpacity
                    onPress={() => router.push("/signin")}
                    className="flex w-full items-center justify-center rounded-[6px] border-[1px] border-[#0C4D2E] py-[18px]"
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
