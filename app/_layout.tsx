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
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ToastManager from "toastify-react-native";

setupAxiosInterceptors();

function AppNavigator() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isRegistered, isVerified } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!user?._id) return;
    if (isAuthenticated && user.role === Role.ADMIN) {
      router.replace("/admin/(tabs)");
    } else if (isAuthenticated && user.role === Role.USER) {
      router.replace("/(tabs)");
    } else if (isRegistered && !isVerified) {
      router.replace("/(onboarding)/verify");
    } else if (isVerified && !isAuthenticated) {
      router.replace("/(onboarding)/signin");
    } else {
      router.replace("/(onboarding)");
    }
  }, [user, isRegistered, isVerified]);

  console.log("AUTH STATE:", {
    isAuthenticated,
    user,
  });

  useEffect(() => {
    console.log("Token exists, fetching user data...");
    dispatch(getUser())
      .unwrap()
      .then((response) => {
        console.log("User data fetched successfully", response);
      })
      .catch((err) => {
        const message = err?.msg?.message || err?.msg;
        console.error("Failed to fetch user data:", message);
      });
  }, [dispatch]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
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
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
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
