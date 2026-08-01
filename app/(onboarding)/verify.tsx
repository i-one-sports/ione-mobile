/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
 
 
 

import {
  Dimensions,
  View,
  TouchableWithoutFeedback,
  useColorScheme,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import * as React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import Loader from "@/components/loader";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { Colors } from "@/constants/Colors";
import { Icon } from "@/components/ui/Icon";
import { useAppDispatch } from "@/redux/store";
import { forgotPassword, verifyOtp } from "@/api/authThunks";
import { Toast } from "toastify-react-native";
import { maskEmail } from "@/utils/maskEmail";

const { width } = Dimensions.get("screen");

export default function Verify() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { bottom } = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(false);
  const [code, setCode] = React.useState(["", "", "", "", "", ""]);
  const inputRefs = React.useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const dispatch = useAppDispatch();
  const email = params.email ?? "";

  React.useEffect(() => {
    if (!email) {
      router.replace("/forgottenpassword");
    }
  }, [email, router]);

  const handleCodeChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, "");

    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);

    if (numericText && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join("");

    if (!email) {
      Toast.show({
        type: "error",
        text1: "Email missing",
        text2: "Please start from the forgot password screen.",
      });
      router.replace("/forgottenpassword");
      return;
    }

    if (otp.length < 6) {
      Toast.show({
        type: "error",
        text1: "Invalid code",
        text2: "Please enter the full verification code.",
      });
      return;
    }

    setLoading(true);
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();
      Toast.show({ type: "success", text1: "Code verified" });
      router.push({
        pathname: "/(onboarding)/resetpassword",
        params: { email, otp },
      });
    } catch (error: any) {
      const message =
        error?.msg?.message || error?.msg || "Unable to verify code";
      Toast.show({ type: "error", text1: "Error", text2: message });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      router.replace("/forgottenpassword");
      return;
    }
    setLoading(true);
    try {
      await dispatch(forgotPassword({ email })).unwrap();
      Toast.show({ type: "success", text1: "Verification code resent" });
      setCode(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const message =
        error?.msg?.message || error?.msg || "Unable to resend code";
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
              Enter Verification Code
            </ThemedText>

            <ThemedText
              lightColor="#6C757D"
              darkColor="#9BA1A6"
              className="px-4 text-center text-base leading-6"
            >
              A code has been sent to{" "}
              {email ? maskEmail(email) : "your email address"}
            </ThemedText>
          </View>

          <View className="mb-8 mt-6 flex flex-row justify-center gap-[10px] px-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={{
                  height: 60,
                  width: 50,
                  borderWidth: 1,
                  borderRadius: 10,
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: "700",
                  borderColor: code[index] ? "#00FF94" : "#D1D5DB",
                  backgroundColor: code[index] ? "#F0FFF4" : "#FFFFFF",
                  color: code[index] ? "#00FF94" : "#333",
                }}
                value={code[index]}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="oneTimeCode"
                maxLength={1}
                editable={!loading}
                autoFocus={index === 0}
              />
            ))}
          </View>
        </View>

        <View>
          <View className="flex-1">
            <View className="flex flex-col gap-[10px]">
              <CustomButton
                primary
                title={loading ? "Verifying..." : "Verify Code"}
                onPress={handleVerify}
                disabled={loading}
              />

              <View className="mt-3 items-center">
                <TouchableWithoutFeedback onPress={handleResend}>
                  <View className="flex-row items-center">
                    <ThemedText
                      lightColor="#6C757D"
                      darkColor="#9BA1A6"
                      className="text-base"
                    >
                      Didn't receive any code?
                    </ThemedText>
                    <ThemedText
                      lightColor="#46BB1C"
                      darkColor="#46BB1C"
                      className="ml-1 text-base font-semibold"
                    >
                      Resend code
                    </ThemedText>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
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
