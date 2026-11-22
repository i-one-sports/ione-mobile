import { formatKoboAsNaira, koboToNaira, nairaToKobo } from "@/utils/currency";
import {
  getLocation,
  getOwnerMonthlyPasses,
  updateMonthlyPassSales,
  updatePricingOptions,
} from "@/api/ownerDashboardThunk";
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
  ActivityIndicator,
  Alert,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Toast } from "toastify-react-native";
import CustomButton from "@/components/ui/CustomButton";

type SegmentOption<T extends string> = { value: T; label: string };

const TIER_OPTIONS: SegmentOption<PricingTier>[] = [
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

const PRICING_OPTIONS: SegmentOption<PricingOptionType>[] = [
  { value: "hourly", label: "Hourly" },
  { value: "monthly", label: "Monthly" },
];

function Segmented<T extends string>({
  options,
  value,
  onChange,
  isDark,
}: {
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: isDark ? "#1C1C1E" : "#EEF1F0",
        borderRadius: 12,
        padding: 4,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 9,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected
                ? isDark
                  ? "#3A3A3C"
                  : "#FFFFFF"
                : "transparent",
              shadowColor: "#000",
              shadowOpacity: selected ? 0.08 : 0,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
              elevation: selected ? 2 : 0,
            }}
          >
            <ThemedText
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: selected ? (isDark ? "#FFFFFF" : "#000000") : "#7C8483",
              }}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AdminPricingOptionScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [tierValue, setTierValue] = useState<PricingTier | null>(null);
  const [pricingOptionValue, setPricingOptionValue] =
    useState<PricingOptionType | null>(null);
  const [amount, setAmount] = useState<string>("");
  const dispatch = useAppDispatch();
  const {
    location,
    loadingPricingOptionData,
    monthlyPasses,
    loadingMonthlyPassSales,
  } = useAppSelector((state) => state.ownerDashboard);

  const screenBg = isDark ? "#000" : "#FFFFFF";
  const mutedColor = isDark ? "#9CA3AF" : "#7C8483";
  const inputBorder = isDark ? "#3A3A3C" : "#E2E5E4";

  useEffect(() => {
    dispatch(getLocation());
  }, [dispatch]);

  useEffect(() => {
    if (location?._id) {
      dispatch(getOwnerMonthlyPasses({ locationId: location._id }));
    }
  }, [dispatch, location?._id]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // When the last sold pass (active or queued) ends; the owner summary has
  // no field for it, so take the latest endsAt from its pass list.
  const lastPassEndsAt = monthlyPasses?.passes.reduce<string | null>(
    (latest, pass) =>
      (pass.state === "ACTIVE" || pass.state === "QUEUED") &&
      (!latest || pass.endsAt > latest)
        ? pass.endsAt
        : latest,
    null,
  );

  const setPassSalesPaused = async (locationId: string, paused: boolean) => {
    try {
      const res = await dispatch(
        updateMonthlyPassSales({ locationId, paused }),
      ).unwrap();
      if (!paused) {
        Toast.show({
          type: "success",
          text1: "Pass sales resumed",
          text2: "Players can buy and renew passes again.",
        });
        return;
      }
      Toast.show({
        type: "success",
        text1: "Pass sales paused",
        text2: res.lastPassEndsAt
          ? `You can switch to hourly after ${formatDate(res.lastPassEndsAt)}.`
          : "You can switch to hourly now.",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          err?.msg ||
          (paused
            ? "Failed to pause pass sales"
            : "Failed to resume pass sales"),
      });
    }
  };

  // Stored price in naira for an option; the API keeps hourly and monthly
  // separately, in kobo. Hourly is the whole-pitch price; older locations may
  // only have the legacy per-person field.
  const storedPriceFor = (option: PricingOptionType | null) => {
    const kobo =
      option === "hourly"
        ? (location?.pricePerHour ?? location?.paymentPerPersonHourly)
        : option === "monthly"
          ? location?.paymentPerPersonMonthly
          : undefined;
    return kobo != null ? koboToNaira(kobo) : undefined;
  };

  useEffect(() => {
    if (!location) return;

    setTierValue(location.tier || null);
    setPricingOptionValue(location.pricingOption || null);
    const kobo =
      location.pricingOption === "hourly"
        ? (location.pricePerHour ?? location.paymentPerPersonHourly)
        : location.paymentPerPersonMonthly;
    setAmount(kobo != null ? String(koboToNaira(kobo)) : "");
  }, [location]);

  const handleSelectPricingOption = (option: PricingOptionType) => {
    setPricingOptionValue(option);
    const price = storedPriceFor(option);
    setAmount(price != null ? String(price) : "");
  };

  const handleUpdatePricingOptions = async () => {
    if (!location?._id || !tierValue) return;

    let payload;

    if (tierValue === "free") {
      payload = { tier: "free" };
    } else {
      if (!pricingOptionValue || !Number(amount)) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Select how players pay and enter a price",
        });
        return;
      }

      if (pricingOptionValue === "hourly") {
        payload = {
          tier: "paid",
          pricingOption: "hourly",
          pricePerHour: nairaToKobo(Number(amount)),
        };
      } else {
        payload = {
          tier: "paid",
          pricingOption: "monthly",
          paymentPerPersonMonthly: nairaToKobo(Number(amount)),
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
      const msg: string = typeof err?.msg === "string" ? err.msg : "";
      if (msg.toLowerCase().includes("bank account")) {
        router.replace("/admin/bank-account");
        return;
      }
      // Can't go hourly while monthly passes are running.
      if (err?.details?.code === "PASSES_ACTIVE") {
        const locationId = location._id;
        const salesPaused = monthlyPasses?.salesPaused;
        Alert.alert(
          "Passes still running",
          msg ||
            "Monthly passes are still running at this pitch. Pause pass sales, then switch to hourly after the last one ends.",
          salesPaused
            ? [{ text: "OK" }]
            : [
                { text: "Not now", style: "cancel" },
                {
                  text: "Pause pass sales",
                  onPress: () => setPassSalesPaused(locationId, true),
                },
              ],
        );
        return;
      }
      Toast.show({
        type: "error",
        text1: "Error",
        text2: msg || "Failed to update pricing",
      });
    }
  };

  const isPaid = tierValue === "paid";
  const isMonthly = pricingOptionValue === "monthly";

  return (
    <View style={{ flex: 1, backgroundColor: screenBg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <View className="flex-1 px-[20px] pb-6 pt-16">
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ position: "absolute", left: 0 }}
              hitSlop={10}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDark ? "#fff" : "#111"}
              />
            </TouchableOpacity>

            <ThemedText style={{ fontSize: 20, fontWeight: "700" }}>
              Pricing
            </ThemedText>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Pitch type */}
            <ThemedText
              style={{ fontSize: 14, color: mutedColor, marginBottom: 10 }}
            >
              Pitch type
            </ThemedText>
            <Segmented
              options={TIER_OPTIONS}
              value={tierValue}
              onChange={setTierValue}
              isDark={isDark}
            />

            {isPaid && (
              <>
                {/* How players pay */}
                <ThemedText
                  style={{
                    fontSize: 14,
                    color: mutedColor,
                    marginTop: 24,
                    marginBottom: 10,
                  }}
                >
                  How players pay
                </ThemedText>
                <Segmented
                  options={PRICING_OPTIONS}
                  value={pricingOptionValue}
                  onChange={handleSelectPricingOption}
                  isDark={isDark}
                />
                <ThemedText
                  style={{
                    fontSize: 12,
                    lineHeight: 18,
                    color: mutedColor,
                    marginTop: 10,
                  }}
                >
                  Pick one. Hourly: players split the pitch price each game.
                  Monthly: every player needs a 30-day pass to play here.
                </ThemedText>

                {pricingOptionValue && (
                  <>
                    <ThemedText
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        marginTop: 28,
                      }}
                    >
                      {isMonthly ? "Monthly pass" : "Hourly price"}
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 14,
                        color: mutedColor,
                        marginTop: 16,
                        marginBottom: 10,
                      }}
                    >
                      {isMonthly
                        ? "Price per player"
                        : "Price per hour (whole pitch)"}
                    </ThemedText>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        height: 56,
                        borderWidth: 1.5,
                        borderColor: inputBorder,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                      }}
                    >
                      <ThemedText style={{ fontSize: 16 }}>₦</ThemedText>
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 16,
                          paddingHorizontal: 2,
                          color: isDark ? "#fff" : "#000",
                        }}
                        onChangeText={(text) =>
                          setAmount(text.replace(/[^0-9]/g, ""))
                        }
                        value={amount ? Number(amount).toLocaleString() : ""}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                      />
                      <ThemedText style={{ fontSize: 16 }}>
                        {isMonthly ? "/ 30 days" : "/ hour"}
                      </ThemedText>
                    </View>

                    {isMonthly && monthlyPasses && (
                      <View
                        style={{
                          marginTop: 16,
                          borderRadius: 14,
                          paddingHorizontal: 20,
                          backgroundColor: isDark ? "#0F2A1E" : "#EBF8F1",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingVertical: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: isDark ? "#1F4030" : "#D5E9DE",
                          }}
                        >
                          <ThemedText
                            style={{ fontSize: 15, color: mutedColor }}
                          >
                            Active passes
                          </ThemedText>
                          <ThemedText
                            style={{ fontSize: 15, fontWeight: "700" }}
                          >
                            {monthlyPasses.activeCount}{" "}
                            {monthlyPasses.activeCount === 1
                              ? "player"
                              : "players"}
                          </ThemedText>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingVertical: 16,
                          }}
                        >
                          <ThemedText
                            style={{ fontSize: 15, fontWeight: "700" }}
                          >
                            Pass income
                          </ThemedText>
                          <ThemedText
                            style={{
                              fontSize: 15,
                              fontWeight: "700",
                              color: "#16A34A",
                            }}
                          >
                            {formatKoboAsNaira(monthlyPasses.revenue)}
                          </ThemedText>
                        </View>
                      </View>
                    )}

                    {/* Sell monthly passes (pause / resume). Only for a pitch
                        that is monthly now, not one being switched to it. */}
                    {isMonthly &&
                      monthlyPasses &&
                      location?.pricingOption === "monthly" && (
                        <View style={{ marginTop: 20 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <ThemedText
                              style={{ fontSize: 15, fontWeight: "700" }}
                            >
                              Sell monthly passes
                            </ThemedText>
                            {loadingMonthlyPassSales ? (
                              <ActivityIndicator color="#00FF94" />
                            ) : (
                              <Switch
                                value={!monthlyPasses.salesPaused}
                                onValueChange={(selling) =>
                                  setPassSalesPaused(location._id, !selling)
                                }
                                trackColor={{
                                  false: isDark ? "#3A3A3C" : "#E2E5E4",
                                  true: "#00FF94",
                                }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor={
                                  isDark ? "#3A3A3C" : "#E2E5E4"
                                }
                              />
                            )}
                          </View>
                          <ThemedText
                            style={{
                              fontSize: 12,
                              lineHeight: 18,
                              color: monthlyPasses.salesPaused
                                ? "#D97706"
                                : mutedColor,
                              marginTop: 6,
                            }}
                          >
                            {monthlyPasses.salesPaused
                              ? `Paused. Players can't buy or renew passes here.${
                                  lastPassEndsAt
                                    ? ` The last pass ends ${formatDate(lastPassEndsAt)}; you can switch to hourly after that.`
                                    : " No passes are running, so you can switch to hourly now."
                                }`
                              : `Turn off to stop new passes and renewals. Passes already sold stay valid${
                                  lastPassEndsAt
                                    ? ` until ${formatDate(lastPassEndsAt)}`
                                    : ""
                                }.`}
                          </ThemedText>
                        </View>
                      )}

                    <ThemedText
                      style={{
                        fontSize: 12,
                        lineHeight: 18,
                        color: mutedColor,
                        marginTop: 10,
                      }}
                    >
                      {isMonthly
                        ? "A new price applies to new passes and renewals. Players with a pass keep what they paid for."
                        : "Players in each game split this price between them."}
                    </ThemedText>
                  </>
                )}
              </>
            )}

            {/* Save button */}
            <View style={{ marginTop: 28 }}>
              <CustomButton
                primary
                title="Save pricing"
                titleStyle={{ color: "#000", fontWeight: "700", fontSize: 17 }}
                onPress={handleUpdatePricingOptions}
                loading={loadingPricingOptionData}
                disabled={loadingPricingOptionData}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
