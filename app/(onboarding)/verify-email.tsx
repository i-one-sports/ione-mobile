import {
  View,
  TouchableWithoutFeedback,
  useColorScheme,
  ScrollView,
  TextInput,
} from "react-native";
import { Toast } from "toastify-react-native";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import Loader from "@/components/loader";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { Colors } from "@/constants/Colors";
import { Icon } from "@/components/ui/Icon";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { confirmEmail, sendEmail } from "@/api/authThunks";

export default function VerifyEmail() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [countdown, setCountdown] = useState(60);
  const { pendingVerificationEmail, loadingConfirmEmailOtp } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(60);
  };

  console.log("pending email", pendingVerificationEmail);
  // ✅ Updated working auto-focus handler
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

  // ✅ Backspace logic
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ Clear Code
  const clearCode = () => {
    setCode(["", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };
  console.log(pendingVerificationEmail);
  const handleVerify = async () => {
    try {
      await dispatch(
        confirmEmail({
          email: pendingVerificationEmail!,
          otp: Number(code.join("")),
        }),
      ).unwrap();

      Toast.show({
        type: "success",
        text1: "Email verified",
        text2: "Your account has been verified successfully. Please sign in.",
      });

      router.replace("/(onboarding)/signin"); // or your login route
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: err?.msg?.message || err?.msg || "Invalid verification code.",
      });
    }
  };

  const handleResendEmail = async () => {
    try {
      await dispatch(
        sendEmail({
          email: pendingVerificationEmail!,
        }),
      ).unwrap();

      startCountdown();

      Toast.show({
        type: "success",
        text1: "Verification code sent",
        text2: "Please check your email for the verification code",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Couldn't send verification code",
        text2: err?.msg?.message || err?.msg || "Please try again in a moment",
      });
    }
  };
  return (
    <SafeAreaScreen className="mt-[52px]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 21,
          paddingBottom: 40,
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        <View>
          <View className="mb-8 items-center">
            <Icon />
          </View>

          {/* Header */}
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
              A code has been sent to {pendingVerificationEmail}
            </ThemedText>
          </View>

          {/* ✅ FIXED OTP INPUTS */}
          <View className="mb-8 mt-6 flex flex-row justify-between px-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={{
                  height: 50,
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
                maxLength={1}
                editable={true}
                focusable={true}
                selectTextOnFocus
                blurOnSubmit={false}
              />
            ))}
          </View>
        </View>
        {/* Buttons */}
        <View className="">
          <View className="flex-1">
            <View className="flex flex-col gap-[10px]">
              <CustomButton
                primary
                title={loadingConfirmEmailOtp ? "Verifying..." : "Verify Code"}
                disabled={loadingConfirmEmailOtp}
                onPress={handleVerify}
                loading={loadingConfirmEmailOtp}
              />

              <View className="mt-3 items-center">
                <TouchableWithoutFeedback
                  onPress={countdown > 0 ? undefined : handleResendEmail}
                >
                  <View className="flex-row items-center">
                    <ThemedText
                      lightColor="#6C757D"
                      darkColor="#9BA1A6"
                      className="text-base"
                    >
                      Didn&apost receive any code?
                    </ThemedText>

                    <ThemedText
                      lightColor={countdown > 0 ? "#9CA3AF" : "#46BB1C"}
                      darkColor={countdown > 0 ? "#6B7280" : "#46BB1C"}
                      className="ml-1 text-base font-semibold"
                    >
                      {countdown > 0
                        ? `Resend code in ${countdown}s`
                        : "Resend code"}
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
