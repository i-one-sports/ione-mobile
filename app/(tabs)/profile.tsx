import ProfileSkeleton from "@/components/ProfileSkeleton";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import InputField from "@/components/InputField";
import Loader from "@/components/loader";
import { PlayerDetailsCard } from "@/components/profile/PlayerDetailsCard";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { getUser, updateProfile, uploadAvatar } from "@/api/authThunks";
import {
  convertHeightToFeet,
  formatDate,
  getPositionName,
} from "@/components/profile/utils";
import { logout } from "@/redux/reducers/auth";
import { persistor, useAppDispatch, useAppSelector } from "@/redux/store";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Toast } from "toastify-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { buildProfileUpdatePayload } from "@/utils/profileUpdate";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    nickname: user?.nickname || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    position: user?.position || "",
    height: user?.height?.toString() || "",
    dateOfBirth: user?.dateOfBirth || "",
  });
  const [saving, setSaving] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(!user);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatar || null,
  );

  const accent = isDark ? "#00FF94" : "#00cc77";

  React.useEffect(() => {
    if (user) {
      setAvatarUri(user.avatar || null);
      setFormValues({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        nickname: user.nickname || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        position: user.position || "",
        height: user.height?.toString() || "",
        dateOfBirth: user.dateOfBirth || "",
      });
      setIsProfileLoading(false);
    } else {
      setIsProfileLoading(true);
    }
  }, [user]);

  const formattedUserData = useMemo(() => {
    if (!user) return null;
    return {
      firstName: user.firstName || "Not set",
      lastName: user.lastName || "Not set",
      nickname: user.nickname || "Not set",
      dateOfBirth: formatDate(user.dateOfBirth || ""),
      height: convertHeightToFeet(user.height || 0),
      placeOfBirth: user.placeOfBirth || "Not set",
      position: getPositionName(user.position || ""),
      email: user.email || "Not set",
      phoneNumber: user.phoneNumber || "Not set",
      address: user.address || "Not set",
      isCaptain: user.isCaptain ? "Yes" : "No",
      isAdmin: user.isAdmin ? "Yes" : "No",
    };
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
    setIsProfileLoading(true);
    try {
      const payload = buildProfileUpdatePayload({
        firstName: formValues.firstName || undefined,
        lastName: formValues.lastName || undefined,
        nickname: formValues.nickname || undefined,
        phoneNumber: formValues.phoneNumber || undefined,
        address: formValues.address || undefined,
        position: formValues.position || undefined,
        height: formValues.height ? Number(formValues.height) : undefined,
        dateOfBirth: formValues.dateOfBirth || undefined,
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
      setIsProfileLoading(false);
    }
  };

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
              setIsLoggingOut(true);
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
              setIsLoggingOut(false);
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

  if (isLoggingOut) {
    return <Loader visible={isLoggingOut} />;
  }

  return (
    <>
      <Loader visible={isProfileLoading || saving} />
      <SafeAreaScreen className="flex-1">
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 35,
            paddingTop: 24,
            paddingBottom: 8,
          }}
        >
          <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
            Profile
          </ThemedText>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push("/stats")}
              style={{
                backgroundColor: `${accent}20`,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderWidth: 1,
                borderColor: `${accent}44`,
              }}
            >
              <ThemedText
                lightColor={accent}
                darkColor={accent}
                style={{ fontSize: 12, fontWeight: "600" }}
              >
                Stats
              </ThemedText>
            </TouchableOpacity>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TouchableOpacity
                onPress={() => setIsEditing((prev) => !prev)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isEditing ? "#DC262620" : `${accent}20`,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: isEditing ? "#DC262640" : `${accent}44`,
                }}
              >
                <MaterialIcons
                  name={isEditing ? "close" : "edit"}
                  size={17}
                  color={isEditing ? "#DC2626" : accent}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#DC262620",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#DC262640",
                }}
              >
                <MaterialIcons name="logout" size={17} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
        >
          {!user || !formattedUserData ? (
            <ProfileSkeleton />
          ) : (
            <>
              <ProfileCard
                avatar={avatarUri || user.avatar}
                nickname={user.nickname}
                firstName={user.firstName}
                data={formattedUserData}
                onAvatarPress={isEditing ? handlePickAvatar : undefined}
                uploadingAvatar={uploadingAvatar}
              />

              {isEditing ? (
                <View style={{ marginTop: 8, gap: 12 }}>
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
                  <InputField
                    label="Phone number"
                    value={formValues.phoneNumber}
                    onChangeText={(value) =>
                      setFormValues((prev) => ({ ...prev, phoneNumber: value }))
                    }
                    placeholder="Phone number"
                  />
                  <InputField
                    label="Address"
                    value={formValues.address}
                    onChangeText={(value) =>
                      setFormValues((prev) => ({ ...prev, address: value }))
                    }
                    placeholder="Address"
                  />
                  <InputField
                    label="Position"
                    value={formValues.position}
                    onChangeText={(value) =>
                      setFormValues((prev) => ({ ...prev, position: value }))
                    }
                    placeholder="Position"
                  />
                  <InputField
                    label="Height (cm)"
                    value={formValues.height}
                    keyboardType="numeric"
                    onChangeText={(value) =>
                      setFormValues((prev) => ({ ...prev, height: value }))
                    }
                    placeholder="Height in cm"
                  />
                  <InputField
                    label="Date of birth"
                    value={formValues.dateOfBirth}
                    placeholder="YYYY-MM-DD"
                    onChangeText={(value) =>
                      setFormValues((prev) => ({ ...prev, dateOfBirth: value }))
                    }
                  />
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    style={{
                      backgroundColor: accent,
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <ThemedText
                      lightColor="#000"
                      darkColor="#000"
                      style={{ fontSize: 15, fontWeight: "700" }}
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <PlayerDetailsCard data={formattedUserData} />
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaScreen>
    </>
  );
}
