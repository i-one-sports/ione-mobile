import { getSummary } from "@/api/ownerDashboardThunk";
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
import React, { useEffect } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function AdminSettingsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const { location } = useAppSelector((state) => state.ownerDashboard);
  const { user } = useAppSelector((state) => state.auth);

  const openHours =
    location?.openingHour && location?.closingHour
      ? `${location.openingHour} – ${location.closingHour}`
      : "8am – 10pm";

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
            <AdminNotificationIcon />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <SettingsHeader
          firstName={user?.firstName ?? ""}
          lastName={user?.lastName ?? ""}
          email={user?.email ?? ""}
          nickname={user?.nickname}
        />

        {/* Pitch Management */}
        <SettingsSection title="Pitch">
          <SettingsRow
            icon="schedule"
            iconColor="#00FF94"
            label="Open Hours"
            rightElement={
              <ThemedText
                style={{ fontFamily: "Poppins_400Regular", fontSize: 13 }}
                lightColor="#999"
                darkColor="#666"
              >
                {openHours}
              </ThemedText>
            }
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
            icon="lock-outline"
            iconColor="#2196F3"
            label="Change Password"
            onPress={() => router.push("/admin/changepassword")}
          />
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
