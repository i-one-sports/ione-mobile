import axiosInstance from "@/api/axios";
import { logout } from "@/redux/reducers/auth";
import store from "@/redux/store";

export const setupAxiosInterceptors = () => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      if (status === 401) {
        // 401 = token expired / invalid — force logout
        store.dispatch(logout());
      }
      // 403 = authenticated but forbidden (e.g. unverified account) — do NOT logout

      return Promise.reject(error);
    },
  );
};
