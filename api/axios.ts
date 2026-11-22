import axios from "axios";
import { API_BASE_URL } from "@/constants/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 20000,
});

// No Content-Type default — Axios's XHR adapter then removes the header entirely
// for FormData, letting the native layer set the correct multipart boundary.
export const uploadAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

export default axiosInstance;
