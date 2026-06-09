import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 20000,
});

// No Content-Type default — Axios's XHR adapter then removes the header entirely
// for FormData, letting the native layer set the correct multipart boundary.
export const uploadAxios = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30000,
});

export default axiosInstance;
