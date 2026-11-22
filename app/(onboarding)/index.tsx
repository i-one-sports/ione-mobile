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
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { useRouter } from "expo-router";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { Colors } from "@/constants/Colors";
import { Icon } from "@/components/ui/Icon";

const { height, width } = Dimensions.get("screen");

export default function SignUp() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaScreen className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 21,
          paddingBottom: 20,
          justifyContent: "space-between",
        }}
      >
        {/* Top Section - Minimal spacing */}
        <View className="w-full items-center mt-[3%]">
          <Icon />

          <Image
            source={require("@/assets/images/goal.png")}
            resizeMode="contain"
            className="w-[100%] mt-[3%]"
            style={{ height: height * 0.5 }}
          />

          <ThemedText
            lightColor={theme.text}
            darkColor={theme.text}
            className="mt-[3%] text-center text-[17px] font-[300] px-[5%]"
          >
            The easy way to organize teams, schedule games, track stats, and
            find local 5-a-side venues!
          </ThemedText>
        </View>

        {/* Bottom Buttons */}
        <View className="flex flex-col gap-[20px]">
          <CustomButton
            primary
            title="Create an Account"
            onPress={() => router.push("/role")}
          />

          <TouchableOpacity
            onPress={() => router.push("/signin")}
            className="flex w-full items-center justify-center rounded-[6px] border border-[#0C4D2E] py-[18px]"
          >
            <Text className="text-primaryDark">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            className="items-center py-[6px]"
          >
            <Text className="text-[#6C757D] underline">
              Browse without an account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
