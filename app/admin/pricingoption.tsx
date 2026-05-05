import { getLocation, updatePricingOptions } from "@/api/ownerDashboardThunk";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
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
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Toast } from "toastify-react-native";

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

  useEffect(() => {
    dispatch(getLocation());
    if (location) {
      setTierValue(location.tier || null);
      setPricingOptionValue(location.pricingOption || null);
    }
  }, [dispatch, location?._id]);

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
      const res = await dispatch(
        updatePricingOptions({
          locationId: location._id,
          ...payload,
        }),
      ).unwrap();

      Toast.show({
        type: "success",
        text1: "Success",
        text2: res.message || "Updated successfully",
      });

      router.replace("/admin/(tabs)");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.message || "Failed to update pricing",
      });
    }
  };

  return (
    <View className="flex-1 dark:bg-black">
      <View className="pb-6 pt-16 px-[35px] flex-1">
        <View>
          <View className="flex flex-row items-center justify-between">
            <ThemedText
              darkColor="#FFFFFF"
              lightColor="#000000"
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-xl"
            >
              Pricing Options
            </ThemedText>
            <TouchableOpacity className="bg-[#00FF943B] rounded-[10px] w-[30px] h-[32px] items-center justify-center">
              <AdminNotificationIcon />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setOpenTierDropdown(!openTierDropdown)}
            className="mt-12 relative"
          >
            <View
              style={{ borderColor: "#B2B2B2", borderRadius: 5 }}
              className="flex-row px-[10px] border h-14 items-center justify-between"
            >
              <ThemedText darkColor="#FFFFFF" lightColor="#000000">
                {tierValue || "Tier"}
              </ThemedText>

              <View className="bg-[#00000033] dark:bg-[#FFFFFF1A]  rounded-[10px] p-[5px]">
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
            <View className="mt-2 bg-white rounded-md shadow">
              {tier?.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setOpenTierDropdown(false);
                    setTierValue(item.state.toLocaleLowerCase() as PricingTier);
                  }}
                  className="p-2"
                >
                  <Text>{item.state}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              if (tierValue === "free") return;
              setOpenDropdown(!openDropdown);
            }}
            style={{
              opacity: tierValue === "free" ? 0.5 : 1,
            }}
            className="mt-12 relative"
          >
            <View
              style={{ borderColor: "#B2B2B2", borderRadius: 5 }}
              className="flex-row px-[10px] border h-14 items-center justify-between"
            >
              <ThemedText darkColor="#FFFFFF" lightColor="#000000">
                {pricingOptionValue || "Pricing Options"}
              </ThemedText>

              <View className="bg-[#00000033] dark:bg-[#FFFFFF1A] rounded-[10px] p-[5px]">
                <Ionicons
                  size={14}
                  color={isDark ? "#fff" : "#00000033"}
                  name={
                    openDropdown ? "chevron-up-outline" : "chevron-down-outline"
                  }
                />
              </View>
            </View>
          </TouchableOpacity>

          {openDropdown && (
            <View className="mt-2 bg-white rounded-md shadow">
              {pricingOption?.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setOpenDropdown(false);
                    setPricingOptionValue(
                      item.state.toLocaleLowerCase() as PricingOptionType,
                    );
                  }}
                  className="p-2"
                >
                  <Text>{item.state}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInput
            editable={tierValue !== "free"}
            style={{
              borderColor: "#B2B2B2",
              borderRadius: 5,
              opacity: tierValue === "free" ? 0.5 : 1,
            }}
            className="mt-12 px-[10px] text-black dark:text-white rounded-md border h-14 bg-transparent"
            onChangeText={setAmount}
            value={amount}
            placeholder="Enter Amount"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        <View className="mt-auto mb-[42px]">
          <TouchableOpacity
            disabled={loadingPricingOptionData}
            onPress={handleUpdatePricingOptions}
          >
            <ThemedText
              darkColor="#FFFFFF"
              lightColor="#000000"
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-center py-5 text-[15px] bg-[#00FF94]"
            >
              {loadingPricingOptionData ? "Updating...." : "Update"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
