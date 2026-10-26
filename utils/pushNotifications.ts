import {
  AuthorizationStatus,
  deleteToken,
  getAPNSToken,
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
 * iOS hands Firebase the APNs token asynchronously after registration;
 * getToken throws "No APNS token specified" if it isn't there yet.
 */
async function waitForApnsToken(timeoutMs = 10000): Promise<void> {
  if (Platform.OS !== "ios") return;
  const messaging = getMessaging();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await getAPNSToken(messaging)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
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
  await waitForApnsToken();
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

/**
 * Screens some notification types open instead of the session page.
 * The type is read from `data.type` (or inside `data.payload` as a fallback).
 */
export function extractNotificationTarget(
  message: RemoteMessage | null | undefined,
):
  | {
      pathname: "/match/referee-invite";
      params: { sessionId: string; refereeId: string };
    }
  | {
      pathname: "/match/take-whistle";
      params: { sessionId: string; matchId: string };
    }
  | {
      pathname: "/match/result-review";
      params: { sessionId: string; matchId: string };
    }
  | null {
  const raw = message?.data?.payload;
  let payload: any = null;
  if (typeof raw === "string") {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }
  const type = message?.data?.type ?? payload?.type;

  if (
    type === "REFEREE_INVITE" &&
    typeof payload?.sessionId === "string" &&
    typeof payload?.refereeId === "string"
  ) {
    return {
      pathname: "/match/referee-invite",
      params: { sessionId: payload.sessionId, refereeId: payload.refereeId },
    };
  }
  // Not sent by the backend yet — requested so a referee who's handed the
  // whistle hears about it without the app open.
  if (
    type === "MATCH_RESULT_REVIEW" &&
    typeof payload?.sessionId === "string" &&
    typeof payload?.matchId === "string"
  ) {
    return {
      pathname: "/match/result-review",
      params: { sessionId: payload.sessionId, matchId: payload.matchId },
    };
  }
  if (
    type === "REFEREE_ASSIGNED" &&
    typeof payload?.sessionId === "string" &&
    typeof payload?.matchId === "string"
  ) {
    return {
      pathname: "/match/take-whistle",
      params: { sessionId: payload.sessionId, matchId: payload.matchId },
    };
  }
  return null;
}

/** The notification's type, from `data.type` (or inside `data.payload`). */
export function notificationType(
  message: RemoteMessage | null | undefined,
): string | undefined {
  const raw = message?.data?.payload;
  if (typeof message?.data?.type === "string") return message.data.type;
  if (typeof raw !== "string") return undefined;
  try {
    return JSON.parse(raw)?.type;
  } catch {
    return undefined;
  }
}
