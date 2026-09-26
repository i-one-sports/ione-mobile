import { getLocation, updatePricingOptions } from "@/api/ownerDashboardThunk";
import { useColorScheme } from "nativewind";
import { ThemedText } from "@/components/ThemedText";
import {
  PricingOptionType,
  PricingTier,
} from "@/components/typings/apiResponse";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Toast } from "toastify-react-native";
import CustomButton from "@/components/ui/CustomButton";

export default function AdminPricingOptionScreen() {
  const tier = [
    {
      id: 1,
      state: "Free",
    },
    {
      id: 2,
      state: "Paid",
    },
  ];
  const pricingOption = [
    {
      id: 1,
      state: "Monthly",
    },
    {
      id: 2,
      state: "Hourly",
    },
  ];
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [openTierDropdown, setOpenTierDropdown] = useState<boolean>(false);
  const [tierValue, setTierValue] = useState<PricingTier | null>(null);
  const [pricingOptionValue, setPricingOptionValue] =
    useState<PricingOptionType | null>(null);
  const [amount, setAmount] = useState<string>("");
  const dispatch = useAppDispatch();
  const { location, loadingPricingOptionData } = useAppSelector(
    (state) => state.ownerDashboard,
  );

  const screenBg = isDark ? "#000" : "#FAFAFA";

  useEffect(() => {
    dispatch(getLocation());
  }, [dispatch]);

  useEffect(() => {
    if (!location) return;

    setTierValue(location.tier || null);
    setPricingOptionValue(location.pricingOption || null);
  }, [location]);

  const handleUpdatePricingOptions = async () => {
    if (!location?._id || !tierValue) return;

    let payload;

    if (tierValue === "free") {
      payload = { tier: "free" };
    } else {
      if (!pricingOptionValue) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Select pricing option and enter amount",
        });
        return;
      }

      if (pricingOptionValue === "hourly") {
        payload = {
          tier: "paid",
          pricingOption: "hourly",
          paymentPerPersonHourly: Number(amount),
        };
      } else {
        payload = {
          tier: "paid",
          pricingOption: "monthly",
          paymentPerPersonMonthly: Number(amount),
        };
      }
    }

    try {
      await dispatch(
        updatePricingOptions({
          locationId: location._id,
          ...payload,
        }),
      ).unwrap();

      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.message || "Failed to update pricing",
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: screenBg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <View className="flex-1 px-[20px] pb-6 pt-16">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 32,
              marginBottom: 32,
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={22}
                color={isDark ? "#fff" : "#111"}
              />
            </TouchableOpacity>

            <ThemedText style={{ fontSize: 17, fontWeight: "700" }}>
              Pricing Options
            </ThemedText>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* Tier */}
            <TouchableOpacity
              onPress={() => setOpenTierDropdown(!openTierDropdown)}
            >
              <View
                style={{
                  borderColor: "#B2B2B2",
                  borderRadius: 5,
                }}
                className="h-14 flex-row items-center justify-between border px-[10px]"
              >
                <ThemedText darkColor="#FFFFFF" lightColor="#000000">
                  {tierValue || "Tier"}
                </ThemedText>

                <View className="rounded-[10px] bg-[#00000033] p-[5px] dark:bg-[#FFFFFF1A]">
                  <Ionicons
                    size={14}
                    color={isDark ? "#fff" : "#00000033"}
                    name={
                      openTierDropdown
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>

            {openTierDropdown && (
              <View className="mt-2 rounded-md bg-white shadow">
                {tier?.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setOpenTierDropdown(false);
                      setTierValue(
                        item.state.toLocaleLowerCase() as PricingTier,
                      );
                    }}
                    className="p-3"
                  >
                    <Text>{item.state}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Pricing option */}
            <TouchableOpacity
              onPress={() => {
                if (tierValue === "free") return;
                setOpenDropdown(!openDropdown);
              }}
              style={{
                opacity: tierValue === "free" ? 0.5 : 1,
              }}
              className="relative mt-12"
            >
              <View
                style={{
                  borderColor: "#B2B2B2",
                  borderRadius: 5,
                }}
                className="h-14 flex-row items-center justify-between border px-[10px]"
              >
                <ThemedText darkColor="#FFFFFF" lightColor="#000000">
                  {pricingOptionValue || "Pricing Options"}
                </ThemedText>

                <View className="rounded-[10px] bg-[#00000033] p-[5px] dark:bg-[#FFFFFF1A]">
                  <Ionicons
                    size={14}
                    color={isDark ? "#fff" : "#00000033"}
                    name={
                      openDropdown
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>

            {openDropdown && (
              <View className="mt-2 rounded-md bg-white shadow">
                {pricingOption?.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setOpenDropdown(false);
                      setPricingOptionValue(
                        item.state.toLocaleLowerCase() as PricingOptionType,
                      );
                    }}
                    className="p-3"
                  >
                    <Text>{item.state}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Amount */}
            <TextInput
              editable={tierValue !== "free"}
              style={{
                borderColor: "#B2B2B2",
                borderRadius: 5,
                opacity: tierValue === "free" ? 0.5 : 1,
              }}
              className="mt-12 h-14 rounded-md border bg-transparent px-[10px] text-black dark:text-white"
              onChangeText={setAmount}
              value={amount}
              placeholder="Enter Amount"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </ScrollView>

          {/* Update button */}
          <View className="mb-[42px] mt-4">
            <CustomButton
              primary
              title={loadingPricingOptionData ? "Updating..." : "Update"}
              onPress={handleUpdatePricingOptions}
              loading={loadingPricingOptionData}
              disabled={loadingPricingOptionData}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
