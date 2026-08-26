import React, { useEffect, useState } from "react";
import AdminNotificationIcon from "@/assets/svg/AdminNotificationIcon";
import { ThemedText } from "@/components/ThemedText";
import { SettingsHeader } from "@/components/admin/settings/SettingsHeader";
import { SettingsRow } from "@/components/admin/settings/SettingsRow";
import { SettingsSection } from "@/components/admin/settings/SettingsSection";
import { logout } from "@/redux/reducers/auth";
import { persistor, useAppDispatch, useAppSelector } from "@/redux/store";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";

import {
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import InputField from "@/components/InputField";
import { getUser, updateProfile, uploadAvatar } from "@/api/authThunks";
import { buildProfileUpdatePayload } from "@/utils/profileUpdate";
import CustomButton from "@/components/ui/CustomButton";

export default function AdminSettingsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const { location } = useAppSelector((state) => state.ownerDashboard);
  const { user } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatar || null,
  );
  const [formValues, setFormValues] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    nickname: user?.nickname || "",
  });

  useEffect(() => {
    if (user) {
      setAvatarUri(user.avatar || null);
      setFormValues({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        nickname: user.nickname || "",
      });
    }
  }, [user]);

  const handlePickAvatar = async () => {
    Alert.alert(
      "Choose image source",
      "Pick an image from your gallery or a file",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Gallery",
          onPress: async () => {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Toast.show({
                type: "error",
                text1: "Permission required",
                text2: "Gallery access is required to pick an image.",
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
              await uploadSelectedImage(
                result.assets[0].uri,
                result.assets[0].fileName || "avatar.jpg",
                result.assets[0].type || "image/jpeg",
              );
            }
          },
        },
        {
          text: "Files",
          onPress: async () => {
            const result = await (DocumentPicker as any).getDocumentAsync({
              type: ["image/*"],
              copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets?.[0]) {
              const asset = result.assets[0];
              await uploadSelectedImage(
                asset.uri,
                asset.name || "avatar.jpg",
                asset.mimeType || "image/jpeg",
              );
            }
          },
        },
      ],
    );
  };

  const uploadSelectedImage = async (
    uri: string,
    name: string,
    type: string,
  ) => {
    setUploadingAvatar(true);
    try {
      const response = await dispatch(
        uploadAvatar({
          file: { uri, type, name },
        }),
      ).unwrap();
      setAvatarUri(response.avatar);
      Toast.show({ type: "success", text1: "Image uploaded" });
    } catch (error: any) {
      const message =
        error?.msg?.message || error?.msg || "Unable to upload image";
      Toast.show({ type: "error", text1: "Error", text2: message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const payload = buildProfileUpdatePayload({
        firstName: formValues.firstName || undefined,
        lastName: formValues.lastName || undefined,
        nickname: formValues.nickname || undefined,
        avatar: avatarUri || undefined,
      });

      await dispatch(updateProfile(payload)).unwrap();
      await dispatch(getUser()).unwrap();
      Toast.show({ type: "success", text1: "Profile updated" });
      setIsEditing(false);
    } catch (error: any) {
      const message =
        error?.msg?.message || error?.msg || "Unable to update profile";
      Toast.show({ type: "error", text1: "Error", text2: message });
    } finally {
      setSaving(false);
    }
  };

  //   const openHours =
  //     location?.openingHour && location?.closingHour
  //       ? `${location.openingHour} – ${location.closingHour}`
  //       : "8am – 10pm";

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            try {
              dispatch(logout());
              router.replace("/(onboarding)/signin");
              SecureStore.deleteItemAsync("i-one").catch(() => {});
              SecureStore.deleteItemAsync("user-data").catch(() => {});
              persistor.purge().catch(() => {});
              Toast.show({
                type: "success",
                text1: "Logged out",
                text2: "See you soon!",
              });
            } catch {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please try again.",
              });
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This is permanent and cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {} },
      ],
      { cancelable: false },
    );
  };

  const paddingTop = Platform.OS === "ios" ? insets.top + 12 : 52;
  const paddingBottom = insets.bottom + 100;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#f5f5f5" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop,
          paddingBottom,
          paddingHorizontal: 20,
        }}
      >
        {/* Top bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <ThemedText
            style={{ fontFamily: "Poppins_600SemiBold", fontSize: 22 }}
            lightColor="#000"
            darkColor="#fff"
          >
            Settings
          </ThemedText>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={() => setIsEditing((prev) => !prev)}
              style={{
                backgroundColor: isEditing ? "#DC262620" : "#00FF943B",
                borderRadius: 10,
                width: 38,
                height: 38,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons
                name={isEditing ? "close" : "edit"}
                size={17}
                color={isEditing ? "#DC2626" : isDark ? "#00FF94" : "#00cc77"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.navigate("/admin/notification")}
              style={{
                backgroundColor: "#00FF943B",
                borderRadius: 10,
                width: 38,
                height: 38,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AdminNotificationIcon
                color={isDark ? "#FFFFFF" : "#2D264B"}
                dotColor="#03EA89"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile card */}
        <SettingsHeader
          firstName={user?.firstName ?? ""}
          lastName={user?.lastName ?? ""}
          email={user?.email ?? ""}
          nickname={user?.nickname}
          avatar={avatarUri ?? undefined}
          onAvatarPress={isEditing ? handlePickAvatar : undefined}
          uploadingAvatar={uploadingAvatar}
        />

        {isEditing && (
          <View style={{ marginBottom: 20, gap: 12 }}>
            <InputField
              label="First name"
              value={formValues.firstName}
              onChangeText={(value) =>
                setFormValues((prev) => ({ ...prev, firstName: value }))
              }
              placeholder="First name"
            />
            <InputField
              label="Last name"
              value={formValues.lastName}
              onChangeText={(value) =>
                setFormValues((prev) => ({ ...prev, lastName: value }))
              }
              placeholder="Last name"
            />
            <InputField
              label="Nickname"
              value={formValues.nickname}
              onChangeText={(value) =>
                setFormValues((prev) => ({ ...prev, nickname: value }))
              }
              placeholder="Nickname"
            />

            <CustomButton
              primary
              onPress={handleSave}
              disabled={saving}
              title={saving ? "Saving..." : "Save changes"}
            />
          </View>
        )}

        {/* Pitch Management */}
        <SettingsSection title="Pitch">
          <SettingsRow
            icon="schedule"
            iconColor="#00FF94"
            label="Open Hours"
            // rightElement={
            //   <ThemedText
            //     style={{ fontFamily: "Poppins_400Regular", fontSize: 13 }}
            //     lightColor="#999"
            //     darkColor="#666"
            //   >
            //     {openHours}
            //   </ThemedText>
            // }
            onPress={() => router.push("/admin/open-hours")}
          />
          <SettingsRow
            icon="grass"
            iconColor="#4CAF50"
            label="Pitch Condition"
            onPress={() => router.push("/admin/pitchcondition")}
          />
          <SettingsRow
            icon="attach-money"
            iconColor="#FF9800"
            label="Pricing Options"
            onPress={() => router.push("/admin/pricingoption")}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsRow
            icon="receipt-long"
            iconColor="#9C27B0"
            label="Transaction History"
            onPress={() => router.push("/admin/transactionhistory")}
          />
          <SettingsRow
            icon="notifications-none"
            iconColor="#FF5722"
            label="Notifications"
            onPress={() => router.navigate("/admin/notification")}
          />
          <SettingsRow
            icon="wallet"
            iconColor="#00C853"
            label="Wallets"
            onPress={() => router.navigate("/admin/wallets")}
          />
          <SettingsRow
            icon="lock-outline"
            iconColor="#2196F3"
            label="Change Password"
            onPress={() => router.push("/admin/changepassword")}
          />
        </SettingsSection>

        {/* Danger zone */}
        <SettingsSection title="Account Actions">
          <SettingsRow
            icon="logout"
            iconColor="#FF5252"
            label="Logout"
            onPress={handleLogout}
            showChevron={false}
          />
          <SettingsRow
            icon="delete-forever"
            iconColor="#FF1744"
            label="Delete Account"
            labelColor="#FF1744"
            onPress={handleDeleteAccount}
            showChevron={false}
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}
