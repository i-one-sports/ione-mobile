import { submitVerification, uploadAvatar } from "@/api/authThunks";
import InputField from "@/components/InputField";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { SubmitVerificationPayload } from "@/components/typings/api";
import CustomButton from "@/components/ui/CustomButton";
import { Icon } from "@/components/ui/Icon";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MaterialIcons, Entypo, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

const ID_TYPES: {
  label: string;
  value: SubmitVerificationPayload["idType"];
}[] = [
  { label: "BVN", value: "BVN" },
  { label: "NIN", value: "NIN" },
  { label: "Driver's License", value: "DRIVERS_LICENSE" },
  { label: "International Passport", value: "PASSPORT" },
];

function SingleImageZone({
  label,
  sublabel,
  previewUri,
  uploading,
  onPress,
  isDark,
  accent,
}: {
  label: string;
  sublabel: string;
  previewUri: string | null;
  uploading: boolean;
  onPress: () => void;
  isDark: boolean;
  accent: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <ThemedText style={{ fontSize: 13, fontWeight: "600", marginBottom: 2 }}>
        {label}
      </ThemedText>
      <ThemedText
        lightColor="#999"
        darkColor="#666"
        style={{ fontSize: 11, marginBottom: 10 }}
      >
        {sublabel}
      </ThemedText>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        disabled={uploading}
        style={{
          borderWidth: previewUri ? 0 : 1.5,
          borderStyle: "dashed",
          borderColor: isDark ? "#333" : "#d5d5d5",
          borderRadius: 14,
          overflow: "hidden",
          backgroundColor: previewUri
            ? "transparent"
            : isDark
              ? "#0a0a0a"
              : "#FAFAFA",
          opacity: uploading ? 0.7 : 1,
        }}
      >
        {previewUri ? (
          <View>
            <Image
              source={{ uri: previewUri }}
              style={{ width: "100%", height: 160, borderRadius: 14 }}
              contentFit="cover"
            />
            {/* Uploading overlay */}
            {uploading && (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                }}
              >
                <ActivityIndicator color="#fff" size="small" />
                <Text style={{ color: "#fff", fontSize: 12, marginTop: 6 }}>
                  Uploading...
                </Text>
              </View>
            )}
            {/* Uploaded badge */}
            {!uploading && (
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: accent,
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="check" size={15} color="#000" />
              </View>
            )}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                paddingVertical: 6,
                paddingHorizontal: 12,
                backgroundColor: "rgba(0,0,0,0.45)",
                borderBottomLeftRadius: 14,
                borderBottomRightRadius: 14,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11 }}>
                Tap to replace
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              paddingVertical: 26,
              alignItems: "center",
              gap: 10,
            }}
          >
            {uploading ? (
              <ActivityIndicator color={accent} size="small" />
            ) : (
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="upload-cloud" size={22} color={accent} />
              </View>
            )}
            <View style={{ alignItems: "center", gap: 3 }}>
              <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
                {uploading ? "Uploading..." : "Tap to upload"}
              </ThemedText>
              {!uploading && (
                <ThemedText
                  lightColor="#bbb"
                  darkColor="#555"
                  style={{ fontSize: 11 }}
                >
                  JPEG or PNG · Max 5MB
                </ThemedText>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

function MultiImageZone({
  label,
  sublabel,
  previewUris,
  uploading,
  onPress,
  isDark,
  accent,
}: {
  label: string;
  sublabel: string;
  previewUris: string[];
  uploading: boolean;
  onPress: () => void;
  isDark: boolean;
  accent: string;
}) {
  const hasImages = previewUris.length > 0;

  return (
    <View style={{ marginBottom: 16 }}>
      <ThemedText style={{ fontSize: 13, fontWeight: "600", marginBottom: 2 }}>
        {label}
      </ThemedText>
      <ThemedText
        lightColor="#999"
        darkColor="#666"
        style={{ fontSize: 11, marginBottom: 10 }}
      >
        {sublabel}
      </ThemedText>

      {hasImages && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {previewUris.map((uri, i) => (
            <View
              key={i}
              style={{
                width: 90,
                height: 90,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <Image
                source={{ uri }}
                style={{ width: 90, height: 90 }}
                contentFit="cover"
              />
              {uploading && (
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator color="#fff" size="small" />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={uploading}
        style={{
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: hasImages ? accent : isDark ? "#333" : "#d5d5d5",
          borderRadius: 14,
          paddingVertical: 18,
          alignItems: "center",
          gap: 8,
          backgroundColor: hasImages
            ? `${accent}10`
            : isDark
              ? "#0a0a0a"
              : "#FAFAFA",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? (
          <ActivityIndicator color={accent} size="small" />
        ) : (
          <Feather
            name={hasImages ? "refresh-cw" : "upload-cloud"}
            size={20}
            color={accent}
          />
        )}
        <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
          {uploading
            ? "Uploading..."
            : hasImages
              ? `${previewUris.length} photo${previewUris.length > 1 ? "s" : ""} selected — tap to change`
              : "Tap to upload photos"}
        </ThemedText>
        {!hasImages && !uploading && (
          <ThemedText
            lightColor="#bbb"
            darkColor="#555"
            style={{ fontSize: 11 }}
          >
            Up to 5 photos
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function AdminOnboarding() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const accent = isDark ? "#00FF94" : "#00cc77";

  const [idType, setIdType] = useState<
    SubmitVerificationPayload["idType"] | ""
  >("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");

  // S3 URLs for submission
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [locationPictureUrls, setLocationPictureUrls] = useState<string[]>([]);

  // Local URIs for immediate preview
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [locationPreviews, setLocationPreviews] = useState<string[]>([]);

  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingLocation, setUploadingLocation] = useState(false);
  const [idTypeModalVisible, setIdTypeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const uploadImage = async (
    uri: string,
    mimeType?: string,
    fileName?: string,
  ): Promise<string> => {
    const result = await dispatch(
      uploadAvatar({
        file: {
          uri,
          type: mimeType || "image/jpeg",
          name: fileName || "upload.jpg",
        },
      }),
    ).unwrap();
    return result.avatar;
  };

  const pickAndUploadSingle = async (
    onPreview: (uri: string) => void,
    onUrl: (url: string) => void,
    setUploading: (v: boolean) => void,
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2: "Allow photo access to upload.",
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];

    // Show local preview immediately so the user sees something right away
    onPreview(asset.uri);
    setUploading(true);
    try {
      const url = await uploadImage(
        asset.uri,
        asset.type || "image/jpeg",
        asset.fileName || "upload.jpg",
      );
      onUrl(url);
      // Replace local file path with the confirmed S3 URL
      onPreview(url);
    } catch {
      onPreview(""); // clear on failure
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: "Could not upload image. Try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const pickAndUploadMultiple = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2: "Allow photo access to upload.",
      });
      return;
    }
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

    // Show local previews immediately
    const localUris = result.assets.map((a) => a.uri);
    setLocationPreviews(localUris);
    setUploadingLocation(true);
    try {
      const urls = await Promise.all(
        result.assets.map((a) =>
          uploadImage(
            a.uri,
            a.type || "image/jpeg",
            a.fileName || "upload.jpg",
          ),
        ),
      );
      setLocationPictureUrls(urls);
      // Replace local paths with confirmed S3 URLs
      setLocationPreviews(urls);
    } catch {
      setLocationPreviews([]);
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: "Could not upload one or more photos.",
      });
    } finally {
      setUploadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!idType || !idNumber || !address || !frontUrl || !backUrl) {
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
          frontUrl,
          backUrl,
          locationPictures: locationPictureUrls,
        }),
      ).unwrap();
      Toast.show({
        type: "success",
        text1: "Submitted!",
        text2: response.message || "Your documents are under review.",
      });
    } catch (err: any) {
      const message =
        err?.msg?.message || err?.msg || "Submission failed. Try again.";
      Toast.show({ type: "error", text1: "Error", text2: message });
    } finally {
      setLoading(false);
    }
  };

  const userId = user?.nickname || user?.email || "";
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
              value={userId}
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
              label="Address"
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
                  setFrontUrl,
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
                  setBackUrl,
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

      {/* ID Type modal */}
      <Modal
        visible={idTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIdTypeModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
          onPress={() => setIdTypeModalVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#fff",
              borderRadius: 16,
              overflow: "hidden",
            }}
            onPress={() => {}}
          >
            {ID_TYPES.map((opt, i) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setIdType(opt.value);
                  setIdTypeModalVisible(false);
                }}
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 20,
                  borderBottomWidth: i < ID_TYPES.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? "#2a2a2a" : "#f2f2f2",
                }}
              >
                <Text style={{ fontSize: 14, color: isDark ? "#fff" : "#111" }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaScreen>
  );
}
