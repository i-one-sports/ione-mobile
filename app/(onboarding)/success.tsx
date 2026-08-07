 
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
 
 
 
import {
  Dimensions,
  View,
  TouchableWithoutFeedback,
  useColorScheme,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import * as yup from "yup";
import * as React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Loader from "@/components/loader";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import InputField from "@/components/InputField";
import { useRouter } from "expo-router";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { Colors } from "@/constants/Colors";
import { Icon } from "@/components/ui/Icon";

const REDIRECT_DELAY_MS = 5000;

const { width } = Dimensions.get("screen");

export default function Success() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { bottom } = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/signin");
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaScreen className="mt-[52px]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 21,
          paddingBottom: 40,
          justifyContent: "center",
        }}
      >
        <View className="mb-8 items-center">
          <Icon />
        </View>

        {/* Header */}
        <View className="mb-8 mt-[127px] flex flex-col  items-center gap-[5px]">
          <Image
            source={require("@/assets/images/success1.png")}
            className="h-[274px] items-center px-8 max-w-[315px]"
            resizeMode="contain"
          />
        </View>

        <View className="mt-[30px] flex flex-col gap-[15px]">
          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="mb-2 text-center text-[20px] font-[600]"
          >
            Password Reset Successfully
          </ThemedText>
          <ThemedText
            lightColor="#6C757D"
            darkColor="#9BA1A6"
            className="px-4 text-center text-[12px] leading-6"
          >
            Redirecting...
          </ThemedText>
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
