import axiosInstance from "@/api/axios";
import { logOut } from "@/api/authThunks";
import store from "@/redux/store";

export const setupAxiosInterceptors = () => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      if (status === 401) {
        const isAuthenticated = store.getState().auth.isAuthenticated;
        // Only force logout if the user is currently authenticated
        // to avoid dispatching logOut() multiple times or after already logged out
        if (isAuthenticated) {
          store.dispatch(logOut());
        }
      }
      // 403 = authenticated but forbidden (e.g. unverified account) — do NOT logout

      return Promise.reject(error);
    },
  );
};
