import { Formik } from "formik";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import * as Yup from "yup";
import { register, uploadAvatar } from "@/api/authThunks";
import * as ImagePicker from "expo-image-picker";
import GeolocationComponent from "@/components/GeoLocation";
import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Icon } from "@/components/ui/Icon";
import SectionCard from "@/components/ui/SectionCard";
import DropdownModal from "@/components/ui/DropdownModal";
import CustomCheckbox from "@/components/CustomCheckbox";
import TermsCheckbox from "@/components/ui/TermsCheckbox";
import { useAppDispatch } from "@/redux/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Toast } from "toastify-react-native";
import CustomDatePicker from "@/components/modals/CustomDatePicker";
import { Image } from "expo-image";
import { Entypo, Ionicons } from "@expo/vector-icons";

const POSITIONS = ["GK", "DF", "MF", "ST"];

export default function SignUp() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(false);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [newsletter, setNewsletter] = React.useState(false);
  const [coordinates, setCoordinates] = React.useState<[number, number]>([
    0, 0,
  ]);
  const router = useRouter();
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = React.useState(false);
  const [isPositionModalVisible, setPositionModalVisible] =
    React.useState(false);
  const { owner } = useLocalSearchParams();
  const isOwner = owner === "true";
  const chevronColor = isDark ? "#777" : "#aaa";

  const handlePickAvatar = async (
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Required",
        text2: "Camera roll permissions are required to upload an avatar",
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUploadingAvatar(true);
      try {
        const response = await dispatch(
          uploadAvatar({
            file: {
              uri: asset.uri,
              type: asset.type || "image/jpeg",
              name: asset.fileName || "avatar.jpg",
            },
          }),
        ).unwrap();
        setFieldValue("avatar", response.avatar);
        setAvatarUri(response.avatar);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Avatar uploaded successfully",
        });
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.msg || "Failed to upload avatar",
        });
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const initialValues = {
    firstName: "",
    lastName: "",
    nickname: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    position: "",
    height: "",
    dateOfBirth: "",
    avatar: "",
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    nickname: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string()
      .required("Required")
      .matches(/^.*(?=.{6,})/, "Minimum 6 characters"),
    phoneNumber: Yup.string().required("Required"),
    address: Yup.string().required("Required"),
    position: Yup.string().required("Required"),
    height: Yup.number().typeError("Must be a number").required("Required"),
    dateOfBirth: Yup.string().required("Required"),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    if (!acceptedTerms) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please accept the Terms and Conditions to proceed.",
      });
      return;
    }
    if (coordinates[0] === 0 && coordinates[1] === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please get your location coordinates first",
      });
      return;
    }
    setLoading(true);
    dispatch(
      register({
        ...values,
        isOwner,
        location: { type: "Point", coordinates },
        height: Number(values.height),
      } as any),
    )
      .unwrap()
      .then((response) => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.message || "Account created successfully",
        });
        router.push("/(onboarding)/signin");
      })
      .catch((err) => {
        const message = err?.msg?.message || err?.msg || "Registration failed";
        Toast.show({ type: "error", text1: "Error", text2: message });
      })
      .finally(() => setLoading(false));
  };

  return (
    <SafeAreaScreen
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleSubmit: formikSubmit,
            values,
            errors,
            touched,
            handleBlur,
            setFieldValue,
            setFieldTouched,
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
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    marginTop: 28,
                    marginBottom: 24,
                  }}
                >
                  <View>
                    <ThemedText
                      lightColor="#999"
                      darkColor="#666"
                      style={{ fontSize: 12, marginBottom: 4 }}
                    >
                      Player Registration
                    </ThemedText>
                    <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
                      Create An Account
                    </ThemedText>
                  </View>
                  <Icon />
                </View>

                {/* Avatar */}
                <View style={{ alignItems: "center", marginBottom: 24 }}>
                  <TouchableOpacity
                    onPress={() => handlePickAvatar(setFieldValue)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: 44,
                        backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: avatarUri ? 2 : 1.5,
                        borderColor: avatarUri
                          ? "#00FF94"
                          : isDark
                            ? "#333"
                            : "#ddd",
                        overflow: "hidden",
                      }}
                    >
                      {avatarUri ? (
                        <Image
                          source={{ uri: avatarUri }}
                          style={{ width: "100%", height: "100%" }}
                        />
                      ) : (
                        <Ionicons
                          name="camera-outline"
                          size={28}
                          color={isDark ? "#555" : "#aaa"}
                        />
                      )}
                    </View>
                    <ThemedText
                      lightColor="#999"
                      darkColor="#666"
                      style={{
                        fontSize: 11,
                        textAlign: "center",
                        marginTop: 6,
                      }}
                    >
                      {uploadingAvatar
                        ? "Uploading..."
                        : avatarUri
                          ? "Photo uploaded"
                          : "Add photo"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Personal Info */}
                <SectionCard title="Personal Info">
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="First Name"
                        placeholder="John"
                        value={values.firstName}
                        onChangeText={handleChange("firstName")}
                        onBlur={handleBlur("firstName")}
                        errorMessage={
                          touched.firstName && errors.firstName
                            ? errors.firstName
                            : ""
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Last Name"
                        placeholder="Doe"
                        value={values.lastName}
                        onChangeText={handleChange("lastName")}
                        onBlur={handleBlur("lastName")}
                        errorMessage={
                          touched.lastName && errors.lastName
                            ? errors.lastName
                            : ""
                        }
                      />
                    </View>
                  </View>
                  <InputField
                    label="Nickname"
                    placeholder="e.g. jdoe10"
                    value={values.nickname}
                    onChangeText={handleChange("nickname")}
                    onBlur={handleBlur("nickname")}
                    errorMessage={
                      touched.nickname && errors.nickname ? errors.nickname : ""
                    }
                  />
                </SectionCard>

                {/* Player Details */}
                <SectionCard title="Player Details">
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Position"
                        selectPicker
                        placeholder="Select"
                        value={values.position}
                        pickerPressed={() => {
                          setFieldTouched("position", true);
                          setPositionModalVisible(true);
                        }}
                        rightIcon={
                          <Entypo
                            name="chevron-down"
                            size={14}
                            color={chevronColor}
                          />
                        }
                        errorMessage={
                          touched.position && errors.position
                            ? errors.position
                            : ""
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputField
                        label="Height (cm)"
                        placeholder="175"
                        keyboardType="numeric"
                        value={values.height}
                        onChangeText={handleChange("height")}
                        onBlur={handleBlur("height")}
                        errorMessage={
                          touched.height && errors.height ? errors.height : ""
                        }
                      />
                    </View>
                  </View>
                  <InputField
                    label="Date of Birth"
                    selectPicker
                    placeholder="Select date of birth"
                    value={values.dateOfBirth}
                    pickerPressed={() => {
                      setFieldTouched("dateOfBirth", true);
                      setDatePickerVisible(true);
                    }}
                    rightIcon={
                      <Entypo
                        name="chevron-down"
                        size={14}
                        color={chevronColor}
                      />
                    }
                    errorMessage={
                      touched.dateOfBirth && errors.dateOfBirth
                        ? errors.dateOfBirth
                        : ""
                    }
                  />
                </SectionCard>

                {/* Location */}
                <SectionCard title="Location">
                  <InputField
                    label="Address"
                    placeholder="No 11, Trinity Estate, Awoyaya"
                    value={values.address}
                    onChangeText={handleChange("address")}
                    onBlur={handleBlur("address")}
                    errorMessage={
                      touched.address && errors.address ? errors.address : ""
                    }
                  />
                  <GeolocationComponent
                    setCoordinates={setCoordinates}
                    label="Detect Location"
                  />
                </SectionCard>

                {/* Account Details */}
                <SectionCard title="Account Details">
                  <InputField
                    label="Email Address"
                    placeholder="johndoe@gmail.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    errorMessage={
                      touched.email && errors.email ? errors.email : ""
                    }
                  />
                  <InputField
                    label="Phone Number"
                    placeholder="0806774****"
                    keyboardType="phone-pad"
                    value={values.phoneNumber}
                    onChangeText={handleChange("phoneNumber")}
                    onBlur={handleBlur("phoneNumber")}
                    errorMessage={
                      touched.phoneNumber && errors.phoneNumber
                        ? errors.phoneNumber
                        : ""
                    }
                  />
                  <InputField
                    label="Password"
                    placeholder="••••••••••••"
                    password
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    errorMessage={
                      touched.password && errors.password ? errors.password : ""
                    }
                  />
                </SectionCard>

                {/* Checkboxes */}
                <View style={{ gap: 12, marginBottom: 28 }}>
                  <TermsCheckbox
                    checked={acceptedTerms}
                    onToggle={() => setAcceptedTerms(!acceptedTerms)}
                  />
                  <CustomCheckbox
                    checked={newsletter}
                    onToggle={() => setNewsletter(!newsletter)}
                    label="Receive Emails From Our Newsletter"
                    required={false}
                  />
                </View>

                <CustomButton
                  primary
                  title={loading ? "Creating Account..." : "Create An Account"}
                  onPress={() => formikSubmit()}
                  disabled={loading}
                  loading={loading}
                />
              </ScrollView>

              {/* Modals rendered outside ScrollView but inside Formik render prop */}
              <DropdownModal
                visible={isPositionModalVisible}
                options={POSITIONS}
                onSelect={(v) => setFieldValue("position", v)}
                onClose={() => setPositionModalVisible(false)}
              />
              <CustomDatePicker
                isVisible={isDatePickerVisible}
                date={
                  values.dateOfBirth ? new Date(values.dateOfBirth) : new Date()
                }
                onChange={(date: Date) => {
                  setDatePickerVisible(false);
                  setFieldValue(
                    "dateOfBirth",
                    date.toISOString().split("T")[0],
                  );
                }}
                onClose={() => setDatePickerVisible(false)}
                maximumDate={new Date()}
              />
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
