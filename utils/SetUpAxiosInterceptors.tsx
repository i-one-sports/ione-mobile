import axiosInstance, { uploadAxios } from "@/api/axios";
import { logOut } from "@/api/authThunks";
import store from "@/redux/store";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export const setupAxiosInterceptors = () => {
  // The native cookie jar drops session cookies when the app is killed, so
  // also send the token saved at login. This keeps users signed in across
  // launches instead of relying on the cookie alone.
  [axiosInstance, uploadAxios].forEach((instance) => {
    instance.interceptors.request.use(async (config) => {
      try {
        const token = await SecureStore.getItemAsync("i-one");
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Fall back to cookie auth if the keychain is unavailable.
      }
      return config;
    });
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      if (status === 401) {
        const isAuthenticated = store.getState().auth.isAuthenticated;
        // Only force logout if the user is currently authenticated
        // to avoid dispatching logOut() multiple times or after already logged out
        if (isAuthenticated) {
          // The login expired: sign out and ask to sign in again.
          store.dispatch(logOut());
          router.replace("/(onboarding)/signin");
        } else if (error.response) {
          // Guest mode: this route needs an account. Screens show the
          // rejection's message, so make it "Sign in to continue" instead
          // of the server's "Unauthorized".
          error.response.data = {
            ...(typeof error.response.data === "object"
              ? error.response.data
              : {}),
            error: undefined,
            message: "Sign in to continue",
          };
        }
      }
      // 403 = authenticated but forbidden (e.g. unverified account) — do NOT logout

      return Promise.reject(error);
    },
  );
};
