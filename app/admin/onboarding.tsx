import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import { Icon } from "@/components/ui/Icon";
import CustomButton from "@/components/ui/CustomButton";
import InputField from "@/components/InputField";
import { useAppSelector } from "@/redux/store";
import { MaterialIcons, Entypo, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

const ID_TYPES = ["BVN", "NIN", "Driver's License", "International Passport"];

function UploadZone({
  label,
  sublabel,
  count,
  uploaded,
  onPress,
  isDark,
  accent,
}: {
  label: string;
  sublabel: string;
  count?: number;
  uploaded: boolean;
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
        activeOpacity={0.7}
        style={{
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: uploaded ? accent : isDark ? "#333" : "#d5d5d5",
          borderRadius: 14,
          paddingVertical: 26,
          alignItems: "center",
          gap: 10,
          backgroundColor: uploaded
            ? `${accent}10`
            : isDark
              ? "#0a0a0a"
              : "#FAFAFA",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: uploaded
              ? `${accent}20`
              : isDark
                ? "#1a1a1a"
                : "#f0f0f0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {uploaded ? (
            <MaterialIcons name="check-circle" size={22} color={accent} />
          ) : (
            <Feather name="upload-cloud" size={22} color={accent} />
          )}
        </View>
        <View style={{ alignItems: "center", gap: 3 }}>
          <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
            {uploaded
              ? count && count > 1
                ? `${count} photos selected`
                : "File uploaded"
              : `Tap to upload`}
          </ThemedText>
          {!uploaded && (
            <ThemedText
              lightColor="#bbb"
              darkColor="#555"
              style={{ fontSize: 11 }}
            >
              JPEG, PNG or PDF · Max 5MB
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function AdminOnboarding() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAppSelector((state) => state.auth);
  const accent = isDark ? "#00FF94" : "#00cc77";

  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [locationPhotos, setLocationPhotos] = useState<string[]>([]);
  const [idTypeModalVisible, setIdTypeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickSingleImage = async (onPicked: (uri: string) => void) => {
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
    if (!result.canceled && result.assets[0]) onPicked(result.assets[0].uri);
  };

  const pickMultipleImages = async () => {
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
    if (!result.canceled) setLocationPhotos(result.assets.map((a) => a.uri));
  };

  const handleSubmit = () => {
    if (!idType || !idNumber || !address || !idFront || !idBack) {
      Toast.show({
        type: "error",
        text1: "Incomplete",
        text2: "Please fill all fields and upload required documents.",
      });
      return;
    }
    setLoading(true);
    // TODO: wire to backend verification endpoint
    setTimeout(() => {
      setLoading(false);
      Toast.show({
        type: "success",
        text1: "Submitted!",
        text2: "Your documents are under review.",
      });
    }, 1500);
  };

  const userId = user?.nickname || user?.email || "john_doe_223";
  const sectionBg = isDark ? "#111" : "#F9FAFB";
  const sectionBorder = isDark ? "#222" : "#F0F0F0";

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
              value={idType}
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

            <UploadZone
              label="ID Front Image"
              sublabel="Upload a clear photo of the front of your ID"
              uploaded={!!idFront}
              onPress={() => pickSingleImage(setIdFront)}
              isDark={isDark}
              accent={accent}
            />

            <UploadZone
              label="ID Back Image"
              sublabel="Upload a clear photo of the back of your ID"
              uploaded={!!idBack}
              onPress={() => pickSingleImage(setIdBack)}
              isDark={isDark}
              accent={accent}
            />

            <UploadZone
              label="Location Pictures"
              sublabel="House frontage, street view, user holding ID"
              uploaded={locationPhotos.length > 0}
              count={locationPhotos.length}
              onPress={pickMultipleImages}
              isDark={isDark}
              accent={accent}
            />
          </View>

          <CustomButton
            primary
            title={loading ? "Submitting..." : "Submit Verification"}
            onPress={handleSubmit}
            disabled={loading}
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
                key={opt}
                onPress={() => {
                  setIdType(opt);
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
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaScreen>
  );
}
