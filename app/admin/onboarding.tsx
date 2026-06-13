import { submitVerification, uploadAvatar } from "@/api/authThunks";
import InputField from "@/components/InputField";
import IdTypeModal, { ID_TYPES } from "@/components/onboarding/IdTypeModal";
import MultiImageZone from "@/components/onboarding/MultiImageZone";
import SingleImageZone from "@/components/onboarding/SingleImageZone";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { SubmitVerificationPayload, ImageFile } from "@/components/typings/api";
import CustomButton from "@/components/ui/CustomButton";
import { Icon } from "@/components/ui/Icon";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Toast } from "toastify-react-native";
import { useRouter } from "expo-router";

export default function AdminOnboarding() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const accent = isDark ? "#00FF94" : "#00cc77";
  const router = useRouter();

  const [idType, setIdType] = useState<
    SubmitVerificationPayload["idType"] | ""
  >("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [idTypeModalVisible, setIdTypeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [frontFile, setFrontFile] = useState<ImageFile | null>(null);
  const [backFile, setBackFile] = useState<ImageFile | null>(null);
  const [locationFiles, setLocationFiles] = useState<ImageFile[]>([]);

  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [locationPreviews, setLocationPreviews] = useState<string[]>([]);

  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingLocation, setUploadingLocation] = useState(false);

  const uploadImage = (
    uri: string,
    mimeType?: string,
    fileName?: string,
  ): Promise<string> =>
    dispatch(
      uploadAvatar({
        file: {
          uri,
          type: mimeType || "image/jpeg",
          name: fileName || "upload.jpg",
        },
      }),
    )
      .unwrap()
      .then((response) => response.avatar)
      .catch((err) => {
        const message = err?.msg?.message || err?.msg;
        console.log("Upload Avatar error:", err);
        Toast.show({ type: "error", text1: message });
        throw err;
      });

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2: "Allow photo access to upload.",
      });
      return false;
    }
    return true;
  };

  const pickAndUploadSingle = async (
    setPreview: (uri: string) => void,
    setFile: (file: ImageFile) => void,
    setUploading: (v: boolean) => void,
  ) => {
    if (!(await requestPermission())) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const file: ImageFile = {
      uri: asset.uri,
      name: asset.fileName || "upload.jpg",
      type: asset.mimeType || "image/jpeg",
    };
    setPreview(asset.uri);

    setFile(file);
    setUploading(true);
    try {
      const url = await uploadImage(
        asset.uri,
        asset.mimeType || "image/jpeg",
        asset.fileName || "upload.jpg",
      );
    } catch {
      setPreview(""); // uploadImage already toasted the error
    } finally {
      setUploading(false);
    }
  };

  const pickAndUploadMultiple = async () => {
    if (!(await requestPermission())) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;
    if (result.assets.length > 5) {
      Toast.show({
        type: "error",
        text1: "Too many photos",
        text2: "Maximum 5 location pictures allowed.",
      });
      return;
    }
    const files: ImageFile[] = result?.assets.map((a) => ({
      uri: a.uri,
      name: a.fileName || "upload.jpg",
      type: a.mimeType || "image/jpeg",
    }));
    setLocationPreviews(result.assets.map((a) => a.uri));
    setLocationFiles(files);
    setUploadingLocation(true);
    try {
      const urls = await Promise.all(
        files.map((file) => uploadImage(file.uri, file.type, file.name)),
      );
      setLocationPreviews(urls);
    } catch {
      setLocationPreviews([]); // uploadImage already toasted the error
      setLocationFiles([]);
    } finally {
      setUploadingLocation(false);
    }
  };

  // const handleSubmit = async () => {
  //   if (!idType || !idNumber || !address || !frontUrl || !backUrl) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Incomplete",
  //       text2: "Please fill all fields and upload required documents.",
  //     });
  //     return;
  //   }
  //   setLoading(true);
  //   console.log("before dispatch");
  //   try {
  //     const response = await dispatch(
  //       submitVerification({
  //         idType,
  //         idNumber,
  //         address,
  //         frontPage: frontUrl,
  //         backPage: backUrl,
  //         locationPictures: locationPictureUrls,
  //       }),
  //     ).unwrap();
  //     console.log("after dispatch");
  //     console.log("response", response);
  //     Toast.show({
  //       type: "success",
  //       text1: "Submitted!",
  //       text2: response.message || "Your documents are under review.",
  //     });
  //     console.log("onboarding", response);
  //   } catch (err: any) {
  //     const message =
  //       err?.msg?.message || err?.msg || "Submission failed. Try again.";
  //     Toast.show({ type: "error", text1: "Error", text2: message });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //

  const handleSubmit = async () => {
    if (!idType || !idNumber || !address || !frontFile || !backFile) {
      Toast.show({
        type: "error",
        text1: "Incomplete",
        text2: "Please fill all fields and upload required documents.",
      });
      return;
    }
    setLoading(true);

    try {
      const response = await dispatch(
        submitVerification({
          idType,
          idNumber,
          address,
          frontPage: frontFile,
          backPage: backFile,
          locationPictures: locationFiles,
        }),
      ).unwrap();
      Toast.show({
        type: "success",
        text1: "Submitted!",
        text2: response.message || "Your documents are under review.",
      });
      router.replace({
        pathname: "/admin/(tabs)",
      });
    } catch (err: any) {
      const message =
        err?.msg?.message || err?.msg || "Submission failed. Try again.";

      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const sectionBg = isDark ? "#111" : "#F9FAFB";
  const sectionBorder = isDark ? "#222" : "#F0F0F0";
  const selectedIdLabel = ID_TYPES.find((t) => t.value === idType)?.label ?? "";

  return (
    <SafeAreaScreen
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
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
                Identity Verification
              </ThemedText>
              <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
                Verify Your Account
              </ThemedText>
            </View>
            <Icon />
          </View>

          {/* Info banner */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 12,
              backgroundColor: isDark ? "#0D2B1F" : "#EDFFF8",
              borderRadius: 12,
              padding: 14,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: isDark ? "#1a3d2b" : "#c8f5e2",
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: `${accent}20`,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1,
              }}
            >
              <MaterialIcons name="verified-user" size={17} color={accent} />
            </View>
            <ThemedText
              lightColor="#444"
              darkColor="#aaa"
              style={{ fontSize: 12, flex: 1, lineHeight: 19 }}
            >
              Account not verified. Please provide the documents below to verify
              your identity.
            </ThemedText>
          </View>

          {/* Identity section */}
          <View
            style={{
              backgroundColor: sectionBg,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: sectionBorder,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <ThemedText
              lightColor="#555"
              darkColor="#aaa"
              style={{
                fontSize: 11,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 12,
              }}
            >
              Identity Details
            </ThemedText>

            <InputField
              label="User ID"
              placeholder="Auto filled"
              value={user?.nickname || user?.email || ""}
              editable={false}
              onChangeText={() => {}}
            />
            <InputField
              label="ID Type"
              selectPicker
              placeholder="Select ID type"
              value={selectedIdLabel}
              pickerPressed={() => setIdTypeModalVisible(true)}
              rightIcon={
                <Entypo
                  name="chevron-down"
                  size={14}
                  color={isDark ? "#777" : "#aaa"}
                />
              }
            />
            <InputField
              label="ID Number"
              placeholder="567fg54dfgjki"
              value={idNumber}
              onChangeText={setIdNumber}
            />
            <InputField
              label="Admin Address"
              placeholder="2, tejuosho st, Lekki"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Documents section */}
          <View
            style={{
              backgroundColor: sectionBg,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: sectionBorder,
              padding: 16,
              marginBottom: 28,
            }}
          >
            <ThemedText
              lightColor="#555"
              darkColor="#aaa"
              style={{
                fontSize: 11,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 16,
              }}
            >
              Documents
            </ThemedText>

            <SingleImageZone
              label="ID Front Image"
              sublabel="Upload a clear photo of the front of your ID"
              previewUri={frontPreview}
              uploading={uploadingFront}
              onPress={() =>
                pickAndUploadSingle(
                  setFrontPreview,
                  setFrontFile,
                  setUploadingFront,
                )
              }
              isDark={isDark}
              accent={accent}
            />
            <SingleImageZone
              label="ID Back Image"
              sublabel="Upload a clear photo of the back of your ID"
              previewUri={backPreview}
              uploading={uploadingBack}
              onPress={() =>
                pickAndUploadSingle(
                  setBackPreview,
                  setBackFile,
                  setUploadingBack,
                )
              }
              isDark={isDark}
              accent={accent}
            />
            <MultiImageZone
              label="Location Pictures"
              sublabel="House frontage, street view, user holding ID (max 5)"
              previewUris={locationPreviews}
              uploading={uploadingLocation}
              onPress={pickAndUploadMultiple}
              isDark={isDark}
              accent={accent}
            />
          </View>

          <CustomButton
            primary
            title={loading ? "Submitting..." : "Submit Verification"}
            onPress={handleSubmit}
            disabled={
              loading || uploadingFront || uploadingBack || uploadingLocation
            }
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <IdTypeModal
        visible={idTypeModalVisible}
        onClose={() => setIdTypeModalVisible(false)}
        onSelect={setIdType}
        isDark={isDark}
      />
    </SafeAreaScreen>
  );
}
