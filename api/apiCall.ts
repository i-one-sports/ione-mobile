import { ErrorResponse, RejectValue } from "@/components/typings/api";
import { AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";

interface ErrorPayload {
  response: {
    data: {
      error: string;
      message: string;
      token: string;
      user: null;
    };
    status: number;
  };
  config?: {
    baseURL?: string;
    data?: unknown;
    headers?: unknown;
    method?: string;
    params?: unknown;
    url?: string;
  };
}

type RejectedWithValue = {
  rejectWithValue(rejectValue: RejectValue): { payload: RejectValue };
};

const SENSITIVE_FIELD =
  /authorization|cookie|token|password|otp|secret|api[-_]?key|cvv/i;

function redactSensitiveValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveValues);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        SENSITIVE_FIELD.test(key)
          ? "[REDACTED]"
          : redactSensitiveValues(nested),
      ]),
    );
  }

  return value;
}

function requestUrl(config?: ErrorPayload["config"]): string | null {
  const baseURL = config?.baseURL;
  const url = config?.url;

  if (!url) return baseURL ?? null;
  if (/^https?:\/\//i.test(url) || !baseURL) return url;

  return `${baseURL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}

function requestBody(data: unknown): unknown {
  if (data === undefined || data === null || data === "") return null;
  if (typeof data !== "string") return redactSensitiveValues(data);

  try {
    return redactSensitiveValues(JSON.parse(data));
  } catch {
    return "[non-JSON request body omitted]";
  }
}

function requestHeaders(headers: unknown): unknown {
  const serializableHeaders =
    headers &&
    typeof headers === "object" &&
    "toJSON" in headers &&
    typeof (headers as { toJSON?: unknown }).toJSON === "function"
      ? (headers as { toJSON: () => unknown }).toJSON()
      : headers;

  return redactSensitiveValues(serializableHeaders);
}

function logFailedRequest(error: ErrorPayload) {
  const config = error.config;
  if (!config) return;

  console.log(
    "📤 [apiCall] request that failed:",
    JSON.stringify(
      {
        method: config?.method?.toUpperCase() ?? null,
        url: requestUrl(config),
        params: redactSensitiveValues(config?.params) ?? null,
        body: requestBody(config?.data),
        headers: requestHeaders(config?.headers) ?? null,
      },
      null,
      2,
    ),
  );
}

async function apiCall(
  asyncFn: Promise<AxiosResponse>,
  thunkAPI: RejectedWithValue,
  route?: string,
) {
  try {
    const { data } = await asyncFn;
    // console.log('dataaaaa', data);

    if (route === "auth") {
      const { token, user } = data;
      const key = "i-one";

      // Store token as string
      if (token) {
        await SecureStore.setItemAsync(key, token);
      }

      // Store user object as JSON string
      if (user) {
        await SecureStore.setItemAsync("user-data", JSON.stringify(user));
      }

      // Note: localStorage doesn't exist in React Native
      // If you need web support, use Platform check:
      // if (Platform.OS === 'web') {
      //   localStorage.setItem(key, token);
      //   localStorage.setItem('user-data', JSON.stringify(user));
      // }
    }

    return data;
  } catch (err) {
    const error = err as ErrorPayload;
    logFailedRequest(error);

    if (!error?.response) {
      console.log("data", error);
      return thunkAPI.rejectWithValue({ msg: "Network Error", status: 500 });
    }
    if (error?.response?.status === 500) {
      console.log(
        "🔴 [apiCall] 500 Server Error — raw response:",
        JSON.stringify(error?.response?.data, null, 2),
      );
      const rawMsg: string =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Server error";
      // Backend sometimes wraps a downstream 4xx as a 500 — surface the status code
      const serverMsg = /request failed with status code \d+/i.test(rawMsg)
        ? `Server rejected the request (${rawMsg.match(/\d+/)?.[0] ?? "400"}). Please try again or contact support.`
        : rawMsg;
      return thunkAPI.rejectWithValue({ msg: serverMsg, status: 500 });
    }
    const responseData = error.response.data;
    console.log(
      `🔴 [apiCall] ${error?.response?.status} Error — raw response:`,
      JSON.stringify(responseData, null, 2),
    );
    const errorMsg =
      responseData?.error ||
      responseData?.message ||
      responseData ||
      "An error occurred";

    return thunkAPI.rejectWithValue({
      msg: errorMsg,
      status: error?.response?.status,
    } as ErrorResponse);
  }
}

export default apiCall;
