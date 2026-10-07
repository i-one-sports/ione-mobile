import {
  AuthorizationStatus,
  deleteToken,
  getMessaging,
  getToken,
  registerDeviceForRemoteMessages,
  requestPermission,
  type RemoteMessage,
} from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

/**
 * Ask the OS for permission to show notifications.
 * iOS: Firebase's requestPermission (AUTHORIZED or PROVISIONAL count as granted).
 * Android 13+: runtime POST_NOTIFICATIONS. Older Android grants at install.
 */
export async function askNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "ios") {
    const status = await requestPermission(getMessaging());
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  }

  if (Platform.OS === "android" && Number(Platform.Version) >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
}

/**
 * Request permission and return this device's FCM token, or null if denied.
 * iOS needs an explicit APNs registration (separate from permission) before
 * getToken works; it's a no-op on Android.
 */
export async function getPushToken(): Promise<string | null> {
  const granted = await askNotificationPermission();
  if (!granted) return null;
  const messaging = getMessaging();
  await registerDeviceForRemoteMessages(messaging);
  return getToken(messaging);
}

/** Best-effort removal of this device's FCM token (used on logout). */
export async function deletePushToken(): Promise<void> {
  try {
    await deleteToken(getMessaging());
  } catch (err) {
    console.log("FCM deleteToken failed", err);
  }
}

/**
 * Pull the sessionId out of a notification. The backend sends it inside
 * `data.payload` as a JSON string (FCM data values must be strings).
 */
export function extractSessionIdFromMessage(
  message: RemoteMessage | null | undefined,
): string | null {
  const raw = message?.data?.payload;
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.sessionId === "string" ? parsed.sessionId : null;
  } catch {
    return null;
  }
}
