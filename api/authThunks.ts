// auth.ts
import { createAsyncThunk } from "@reduxjs/toolkit";

import apiCall from "./apiCall";
import {
  AsyncThunkConfig,
  forgotPasswordPayload,
  LoginPayload,
  RegisterOwnerPayload,
  RegisterPayload,
  resetPasswordPayload,
  SubmitVerificationPayload,
  verifyOtpPayload,
  ConfirmEmailOtpPayload,
  SendEmailOtpPayload,
} from "@/components/typings/api";
import {
  forgotPasswordResponse,
  LoginResponse,
  logoutResponse,
  RegisterResponse,
  SubmitVerificationResponse,
  UserResponse,
  ConfirmEmailResponse,
  SendEmailResponse,
  GetVerificationResponse,
} from "@/components/typings/apiResponse";
import axiosInstance, { uploadAxios } from "./axios";
import { Platform } from "react-native";

export const uploadAvatar = createAsyncThunk<
  { avatar: string },
  { file: { uri: string; type: string; name: string } },
  AsyncThunkConfig
>("user/uploadAvatar", async ({ file }, thunkAPI) => {
  // Android requires a proper file:// URI prefix
  const uri =
    Platform.OS === "android" && !file.uri.startsWith("file://")
      ? `file://${file.uri}`
      : file.uri;

  const ext = uri.split(".").pop() || "jpg";
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: file.name || `upload_${Date.now()}.${ext}`,
    type: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
  } as any);

  const result = await apiCall(
    uploadAxios.post("/i-one/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (data) => data,
    }),
    thunkAPI,
  );
  console.log("[uploadAvatar] response:", result);
  return result;
});

export const register = createAsyncThunk<
  RegisterResponse,
  RegisterPayload,
  AsyncThunkConfig
>("user/register", async (payload, thunkAPI) => {
  return apiCall(
    axiosInstance.post("/i-one/user/register", payload),
    thunkAPI,
    "auth",
  );
});

export const registerOwner = createAsyncThunk<
  RegisterResponse,
  RegisterOwnerPayload,
  AsyncThunkConfig
>("user/registerOwner", async (payload, thunkAPI) => {
  return apiCall(
    axiosInstance.post("/i-one/user/register-owner", payload),
    thunkAPI,
    "auth",
  );
});

export const getUser = createAsyncThunk<UserResponse, void, AsyncThunkConfig>(
  "user/getUser",
  async (_, thunkAPI) => {
    return apiCall(axiosInstance.get("/i-one/user/profile"), thunkAPI, "auth");
  },
);

export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  AsyncThunkConfig
>("user/login", async (payload, thunkAPI) => {
  return apiCall(
    axiosInstance.post("/i-one/auth/user/login", payload),
    thunkAPI,
    "auth",
  );
});

export const forgotPassword = createAsyncThunk<
  forgotPasswordResponse,
  forgotPasswordPayload,
  AsyncThunkConfig
>("/users/forget-password", async (payload, thunkAPI) => {
  return apiCall(
    axiosInstance.post("/i-one/user/forget-Password", payload),
    thunkAPI,
  );
});

const normalizeOtpPayload = (payload: verifyOtpPayload) => {
  const normalizedOtp = payload.otp;

  if (typeof normalizedOtp === "string") {
    const trimmedOtp = normalizedOtp.trim();
    if (trimmedOtp) {
      return {
        ...payload,
        otp: Number(trimmedOtp),
      };
    }
  }

  return payload;
};

const normalizeResetPasswordPayload = (payload: resetPasswordPayload) => {
  const {
    otp: _otp,
    password,
    confirmPassword,
    newPassword,
    confirmNewPassword,
  } = payload;

  return {
    email: payload.email,
    newPassword: newPassword ?? password,
    confirmPassword: confirmNewPassword ?? confirmPassword,
  };
};

export const sendEmail = createAsyncThunk<
  SendEmailResponse,
  SendEmailOtpPayload,
  AsyncThunkConfig
>("/users/send-verify-email", async (payload, thunkAPI) => {
  return apiCall(
    axiosInstance.post("/i-one/user/verify-email/send", payload),
    thunkAPI,
  );
});

export const confirmEmail = createAsyncThunk<
  ConfirmEmailResponse,
  ConfirmEmailOtpPayload,
  AsyncThunkConfig
>("/users/confirm-verify-email", async (payload, thunkAPI) => {
  return apiCall(
    axiosInstance.post("/i-one/user/verify-email/confirm", payload),
    thunkAPI,
  );
});

export const verifyOtp = createAsyncThunk<
  forgotPasswordResponse,
  verifyOtpPayload,
  AsyncThunkConfig
>("/users/verify-otp", async (payload, thunkAPI) => {
  return apiCall(
    axiosInstance.post("/i-one/user/verify-otp", normalizeOtpPayload(payload)),
    thunkAPI,
  );
});

export const reset = createAsyncThunk<
  forgotPasswordResponse,
  resetPasswordPayload,
  AsyncThunkConfig
>("/users/reset-password", async (payload, thunkAPI) => {
  return apiCall(
    axiosInstance.put(
      "/i-one/user/reset-password",
      normalizeResetPasswordPayload(payload),
    ),
    thunkAPI,
  );
});

export const updateProfile = createAsyncThunk<
  UserResponse,
  Partial<RegisterPayload> & {
    firstName?: string;
    lastName?: string;
    nickname?: string;
    avatar?: string;
    address?: string;
    phoneNumber?: string;
    position?: string;
    location?: { type: string; coordinates: [number, number] };
    height?: number;
    dateOfBirth?: string;
  },
  AsyncThunkConfig
>("user/updateProfile", async (payload, thunkAPI) => {
  return apiCall(
    axiosInstance.patch("/i-one/user/profile", payload),
    thunkAPI,
    "auth",
  );
});

// export const submitVerification = createAsyncThunk<
//   SubmitVerificationResponse,
//   SubmitVerificationPayload,
//   AsyncThunkConfig
// >("user/submitVerification", async (payload, thunkAPI) => {
//   return apiCall(
//     axiosInstance.post("/i-one/verification/submit", payload),
//     thunkAPI,
//     "auth",
//   );
// });
//

export const submitVerification = createAsyncThunk<
  SubmitVerificationResponse,
  SubmitVerificationPayload,
  AsyncThunkConfig
>("user/submitVerification", async (payload, thunkAPI) => {
  const formData = new FormData();

  formData.append("idType", payload.idType);
  formData.append("idNumber", payload.idNumber);
  formData.append("address", payload.address);

  formData.append("frontPage", {
    uri: payload.frontPage.uri,
    name: payload.frontPage.name || "front.jpg",
    type: payload.frontPage.type || "image/jpeg",
  } as any);

  formData.append("backPage", {
    uri: payload.backPage.uri,
    name: payload.backPage.name || "back.jpg",
    type: payload.backPage.type || "image/jpeg",
  } as any);

  payload.locationPictures.forEach((file, index) => {
    formData.append("locationPictures", {
      uri: file.uri,
      name: file.name || `location_${index}.jpg`,
      type: file.type || "image/jpeg",
    } as any);
  });

  return await apiCall(
    axiosInstance.post("/i-one/verification/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
    thunkAPI,
    "auth",
  );
});

//this is used to display state of verification
export const getVerification = createAsyncThunk<
  GetVerificationResponse,
  void,
  AsyncThunkConfig
>("user/getVerification", async (_, thunkAPI) => {
  return apiCall(axiosInstance.get("/i-one/verification/me"), thunkAPI, "auth");
});

export const logOut = createAsyncThunk<logoutResponse, void, AsyncThunkConfig>(
  "/users/logout",
  async (_, thunkAPI) => {
    return apiCall(axiosInstance.get("/i-one/auth/user/logout"), thunkAPI);
  },
);
