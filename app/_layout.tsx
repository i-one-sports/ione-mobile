/* eslint-disable react-hooks/exhaustive-deps */
import { getUser } from "@/api/authThunks";
import { Role } from "@/components/typings/apiResponse";
import "@/globals.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import store, {
  persistor,
  useAppDispatch,
  useAppSelector,
} from "@/redux/store";
import { setupAxiosInterceptors } from "@/utils/SetUpAxiosInterceptors";
import toastConfig from "@/utils/toast";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
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

function AppNavigator() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated, isRegistered, isVerified } = useAppSelector(
    (state) => state.auth,
  );
  const splashHidden = useRef(false);

  const hideSplash = () => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // New device / never registered → show welcome screen.
      // Returning user who logged out → go straight to sign-in.
      router.replace(isRegistered ? "/(onboarding)/signin" : "/(onboarding)");
      hideSplash();
      return;
    }

    // Fetch full user profile — route based on the fresh response,
    // never on stale Redux state, to avoid role-mismatch flash.
    dispatch(getUser())
      .unwrap()
      .then((userData: any) => {
        if (userData?.role === Role.ADMIN) {
          router.replace("/admin/(tabs)");
        } else if (userData?.role === Role.USER) {
          router.replace("/(tabs)");
        } else if (isRegistered && !isVerified) {
          router.replace("/(onboarding)/verify");
        } else {
          router.replace("/(onboarding)/signin");
        }
      })
      .catch(() => {
        router.replace("/(onboarding)/signin");
      })
      .finally(hideSplash);
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
