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
      return thunkAPI.rejectWithValue({ msg: "Server Error", status: 500 });
    }
    const responseData = error.response.data;
    const errorMsg = responseData?.error || responseData || "An error occurred";

    return thunkAPI.rejectWithValue({
      msg: errorMsg,
      status: error?.response?.status,
    } as ErrorResponse);
  }
}

export default apiCall;
