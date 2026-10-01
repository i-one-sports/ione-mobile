/* eslint-disable react-hooks/exhaustive-deps */
import { Role } from "@/components/typings/apiResponse";
import "@/globals.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import store, { persistor, useAppSelector } from "@/redux/store";
import { setupAxiosInterceptors } from "@/utils/SetUpAxiosInterceptors";
import {
  setPendingSession,
  consumePendingSession,
} from "@/utils/pendingDeepLink";
import toastConfig from "@/utils/toast";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ToastManager from "toastify-react-native";

setupAxiosInterceptors();
SplashScreen.preventAutoHideAsync();

/** Extract a session ID from a deep-link URL, or return null. */
function extractSessionId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/sessions\/([^/?#]+)/);
  return match ? match[1] : null;
}

function AppNavigator() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated, isRegistered, isVerified } = useAppSelector(
    (state) => state.auth,
  );
  const splashHidden = useRef(false);
  // True after the first auth effect has run its router.replace().
  // Before this point it is not safe to call router.push() from a Linking event.
  const navigatorReady = useRef(false);
  // Mount timestamp — used to filter Android cold-start duplicate events.
  const mountTime = useRef(Date.now());
  // URL captured by getInitialURL — used to deduplicate Android's duplicate events.
  const initialUrl = useRef<string | null>(null);

  const hideSplash = () => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
  };

  /**
   * Handle custom-scheme deep links only (i-one://sessions/{id}).
   * Universal https links are handled by app/sessions/[sessionId].tsx
   * via Expo Router's file-based routing — no manual handling needed here.
   */
  const handleDeepLink = (url: string | null) => {
    if (!url || !url.startsWith("i-one://")) return;

    const sessionId = extractSessionId(url);
    if (!sessionId) return;

    const currentlyAuthenticated = store.getState().auth.isAuthenticated;

    if (navigatorReady.current && currentlyAuthenticated) {
      router.push({ pathname: "/joinsession", params: { sessionId } });
    } else {
      setPendingSession(sessionId);
      if (navigatorReady.current && !currentlyAuthenticated) {
        router.replace("/(onboarding)/signin");
      }
    }
  };

  // Cold-start via custom scheme only (i-one://sessions/{id}).
  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (!url || !url.startsWith("i-one://")) return;
        initialUrl.current = url;
        const sessionId = extractSessionId(url);
        if (sessionId) setPendingSession(sessionId);
      })
      .catch(() => {});
  }, []);

  // Warm-start listener — custom scheme only.
  // Deduplicates Android's cold-start duplicate events using mount time.
  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      const isEarlyDuplicate =
        url === initialUrl.current && Date.now() - mountTime.current < 2000;
      if (isEarlyDuplicate) return;
      handleDeepLink(url);
    });
    return () => sub.remove();
  }, []);

  // Auth-driven navigation — the single source of truth for routing.
  // Deferred via setTimeout(0) so the Stack is fully mounted before
  // any router.replace() fires.
  useEffect(() => {
    const navigate = () => {
      if (!isAuthenticated) {
        router.replace(isRegistered ? "/(onboarding)/signin" : "/(onboarding)");
        hideSplash();
        navigatorReady.current = true;
        return;
      }

      const navigateByRole = (role?: string) => {
        if (role === Role.ADMIN) {
          router.replace("/admin/(tabs)");
        } else if (role === Role.USER) {
          router.replace("/(tabs)");
        } else if (isRegistered && !isVerified) {
          router.replace("/(onboarding)/verify");
        } else {
          router.replace("/(onboarding)/signin");
        }
      };

      const storedRole = store.getState().auth.user?.role;
      navigateByRole(storedRole);
      hideSplash();
      navigatorReady.current = true;

      // Consume any pending deep-link session stored before login.
      const pending = consumePendingSession();
      if (pending) {
        setTimeout(() => {
          router.push({
            pathname: "/joinsession",
            params: { sessionId: pending },
          });
        }, 300);
      }
    };

    setTimeout(navigate, 0);
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? "#000" : "#fff" },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(onboarding)" />
      {/* <Stack.Screen name="admin" />
      <Stack.Screen name="joinsession" />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="captainjoinsession" />
      <Stack.Screen name="assigned" />
      <Stack.Screen name="reschedule-session" />
      <Stack.Screen name="payment-screens" />
      <Stack.Screen name="screens" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="allfixtures" />
      <Stack.Screen name="fixtureDetails" />
      <Stack.Screen name="tournamentdetail" />
      <Stack.Screen name="tournamentteam" />
      <Stack.Screen name="teamboxes" />
      <Stack.Screen name="view-assigned-set" /> */}
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView
          style={{
            flex: 1,
            backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
          }}
        >
          <BottomSheetModalProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <AppNavigator />
              <StatusBar style="auto" />
              <Toast
                config={toastConfig}
                position="top"
                topOffset={50}
                visibilityTime={4000}
                autoHide
              />
            </ThemeProvider>
            <ToastManager />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
