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
}

type RejectedWithValue = {
  rejectWithValue(rejectValue: RejectValue): { payload: RejectValue };
};

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
