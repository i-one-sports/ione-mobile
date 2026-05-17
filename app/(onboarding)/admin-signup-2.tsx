import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import CustomCheckbox from "@/components/CustomCheckbox";
import TermsCheckbox from "@/components/ui/TermsCheckbox";
import { Icon } from "@/components/ui/Icon";
import SectionCard from "@/components/ui/SectionCard";
import StepBar from "@/components/ui/StepBar";
import DropdownModal from "@/components/ui/DropdownModal";
import GeolocationComponent from "@/components/GeoLocation";
import Loader from "@/components/loader";
import { registerOwner } from "@/api/authThunks";
import { useAppDispatch } from "@/redux/store";
import { Entypo } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Toast } from "toastify-react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const TIER_OPTIONS = ["free", "paid"];
const PRICING_OPTIONS = ["hourly", "monthly"];

const schema = Yup.object({
  pitchMax: Yup.string().required("Required"),
  pitchSize: Yup.string().required("Required"),
  openingHour: Yup.string().required("Required"),
  closingHour: Yup.string().required("Required"),
  tier: Yup.string().required("Required"),
  pricingOption: Yup.string().when("tier", {
    is: "paid",
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  paymentPerPersonHourly: Yup.string().when("tier", {
    is: "paid",
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  bankCode: Yup.string().required("Required"),
  bankName: Yup.string().required("Required"),
  accountNumber: Yup.string().required("Required"),
  termsAccepted: Yup.boolean().oneOf(
    [true],
    "Please accept the Terms and Conditions",
  ),
});

export default function AdminSignup2() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    pitchName: string;
    address: string;
    email: string;
    phoneNumber: string;
    password: string;
  }>();

  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  const [tierModalVisible, setTierModalVisible] = useState(false);
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const chevronColor = isDark ? "#777" : "#aaa";

  return (
    <SafeAreaScreen
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      <Loader visible={loading} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <Formik
          initialValues={{
            pitchMax: "",
            pitchSize: "",
            openingHour: "",
            closingHour: "",
            tier: "",
            pricingOption: "",
            paymentPerPersonHourly: "",
            bankCode: "",
            bankName: "",
            accountNumber: "",
            termsAccepted: false,
            newsletterOptIn: false,
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            setLoading(true);
            const payload = {
              user: {
                firstName: params.firstName,
                lastName: params.lastName,
                email: params.email,
                phoneNumber: params.phoneNumber,
                password: params.password,
                role: "Admin",
              },
              location: {
                name: params.pitchName,
                address: params.address,
                openingHour: values.openingHour,
                closingHour: values.closingHour,
                pitchMax: values.pitchMax,
                pitchSize: values.pitchSize,
                tier: values.tier,
                pricingOption: values.pricingOption,
                paymentPerPersonHourly: Number(values.paymentPerPersonHourly),
                location: { coordinates },
              },
              payout: {
                bankCode: values.bankCode,
                bankName: values.bankName,
                accountNumber: values.accountNumber,
              },
              termsAccepted: values.termsAccepted,
              newsletterOptIn: values.newsletterOptIn,
            };
            dispatch(registerOwner(payload))
              .unwrap()
              .then((res) => {
                Toast.show({
                  type: "success",
                  text1: "Account created!",
                  text2: res.message || "Please sign in.",
                });
                router.replace("/(onboarding)/signin");
              })
              .catch((err) => {
                const msg =
                  err?.msg?.message || err?.msg || "Registration failed";
                Toast.show({ type: "error", text1: "Error", text2: msg });
              })
              .finally(() => setLoading(false));
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
          }) => (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingBottom: 48,
                }}
                keyboardShouldPersistTaps="handled"
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    marginTop: 28,
                    marginBottom: 6,
                  }}
                >
                  <View>
                    <ThemedText
                      lightColor="#999"
                      darkColor="#666"
                      style={{ fontSize: 12, marginBottom: 4 }}
                    >
                      Admin Registration
                    </ThemedText>
                    <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
                      Create An Account
                    </ThemedText>
                  </View>
                  <Icon />
                </View>

                <View style={{ marginTop: 20, marginBottom: -8 }}>
                  <StepBar step={2} />
                </View>

                <SectionCard title="Pitch Details">
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Max Players"
                        placeholder="5 x 5"
                        value={values.pitchMax}
                        onChangeText={handleChange("pitchMax")}
                        onBlur={handleBlur("pitchMax")}
                        errorMessage={
                          touched.pitchMax ? errors.pitchMax : undefined
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Pitch Size (M)"
                        placeholder="175m x 180m"
                        value={values.pitchSize}
                        onChangeText={handleChange("pitchSize")}
                        onBlur={handleBlur("pitchSize")}
                        errorMessage={
                          touched.pitchSize ? errors.pitchSize : undefined
                        }
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Opening Hour"
                        placeholder="09:00"
                        value={values.openingHour}
                        onChangeText={handleChange("openingHour")}
                        onBlur={handleBlur("openingHour")}
                        errorMessage={
                          touched.openingHour ? errors.openingHour : undefined
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Closing Hour"
                        placeholder="22:00"
                        value={values.closingHour}
                        onChangeText={handleChange("closingHour")}
                        onBlur={handleBlur("closingHour")}
                        errorMessage={
                          touched.closingHour ? errors.closingHour : undefined
                        }
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Tier"
                        selectPicker
                        placeholder="Select"
                        value={values.tier}
                        pickerPressed={() => setTierModalVisible(true)}
                        rightIcon={
                          <Entypo
                            name="chevron-down"
                            size={14}
                            color={chevronColor}
                          />
                        }
                        errorMessage={touched.tier ? errors.tier : undefined}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      {values.tier === "paid" && (
                        <InputField
                          label="Pricing Model"
                          selectPicker
                          placeholder="Select"
                          value={values.pricingOption}
                          pickerPressed={() => setPricingModalVisible(true)}
                          rightIcon={
                            <Entypo
                              name="chevron-down"
                              size={14}
                              color={chevronColor}
                            />
                          }
                          errorMessage={
                            touched.pricingOption
                              ? errors.pricingOption
                              : undefined
                          }
                        />
                      )}
                    </View>
                  </View>
                  {values.tier === "paid" && (
                    <InputField
                      label="Price per Person / Hour (₦)"
                      placeholder="2500"
                      value={values.paymentPerPersonHourly}
                      onChangeText={handleChange("paymentPerPersonHourly")}
                      onBlur={handleBlur("paymentPerPersonHourly")}
                      keyboardType="numeric"
                      errorMessage={
                        touched.paymentPerPersonHourly
                          ? errors.paymentPerPersonHourly
                          : undefined
                      }
                    />
                  )}
                </SectionCard>

                <SectionCard title="Location">
                  <GeolocationComponent
                    setCoordinates={setCoordinates}
                    label="Pitch Coordinates"
                  />
                </SectionCard>

                <SectionCard title="Company Account">
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Bank Name"
                        placeholder="GTBank"
                        value={values.bankName}
                        onChangeText={handleChange("bankName")}
                        onBlur={handleBlur("bankName")}
                        errorMessage={
                          touched.bankName ? errors.bankName : undefined
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Bank Code"
                        placeholder="058"
                        value={values.bankCode}
                        onChangeText={handleChange("bankCode")}
                        onBlur={handleBlur("bankCode")}
                        keyboardType="numeric"
                        errorMessage={
                          touched.bankCode ? errors.bankCode : undefined
                        }
                      />
                    </View>
                  </View>
                  <InputField
                    label="Account Number"
                    placeholder="0123456789"
                    value={values.accountNumber}
                    onChangeText={handleChange("accountNumber")}
                    onBlur={handleBlur("accountNumber")}
                    keyboardType="numeric"
                    errorMessage={
                      touched.accountNumber ? errors.accountNumber : undefined
                    }
                  />
                </SectionCard>

                {touched.termsAccepted && errors.termsAccepted ? (
                  <ThemedText
                    style={{
                      color: "#FF4D4F",
                      fontSize: 12,
                      marginBottom: 10,
                      marginLeft: 2,
                    }}
                  >
                    {errors.termsAccepted}
                  </ThemedText>
                ) : null}

                <View style={{ gap: 12, marginBottom: 28 }}>
                  <TermsCheckbox
                    checked={values.termsAccepted}
                    onToggle={() =>
                      setFieldValue("termsAccepted", !values.termsAccepted)
                    }
                  />
                  <CustomCheckbox
                    checked={values.newsletterOptIn}
                    onToggle={() =>
                      setFieldValue("newsletterOptIn", !values.newsletterOptIn)
                    }
                    label="Receive Emails From Our Newsletter"
                    required={false}
                  />
                </View>

                <View style={{ gap: 12 }}>
                  <CustomButton
                    primary
                    title="Create An Account"
                    onPress={() => handleSubmit()}
                    disabled={loading}
                    loading={loading}
                  />
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ alignItems: "center", paddingVertical: 12 }}
                  >
                    <ThemedText
                      lightColor="#999"
                      darkColor="#666"
                      style={{ fontSize: 13 }}
                    >
                      ← Back to Step 1
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <DropdownModal
                visible={tierModalVisible}
                options={TIER_OPTIONS}
                onSelect={(v) => setFieldValue("tier", v)}
                onClose={() => setTierModalVisible(false)}
              />
              <DropdownModal
                visible={pricingModalVisible}
                options={PRICING_OPTIONS}
                onSelect={(v) => setFieldValue("pricingOption", v)}
                onClose={() => setPricingModalVisible(false)}
              />
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
