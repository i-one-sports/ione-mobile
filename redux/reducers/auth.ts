import {
  getUser,
  login,
  register,
  registerOwner,
  sendEmail,
  confirmEmail,
} from "@/api/authThunks";
import { User } from "@/components/typings";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  SendEmailResponse,
  ConfirmEmailResponse,
} from "@/components/typings/apiResponse";

interface State {
  user: User | null;
  pendingVerificationEmail: string | null;
  sendEmailOtp: SendEmailResponse | null;
  confirmEmailOtp: ConfirmEmailResponse | null;
  profile: object | null;

  loadingSendEmailOtp: boolean;
  loadingConfirmEmailOtp: boolean;
  isRegistered: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  isPhoneVerified: boolean;
  isAdmin: boolean;

  errorSendEmailOtp: string | null;
  errorConfirmEmailOtp: string | null;
}

const initialState: State = {
  user: null,
  sendEmailOtp: null,
  confirmEmailOtp: null,
  profile: null,
  pendingVerificationEmail: null,

  loadingConfirmEmailOtp: false,
  loadingSendEmailOtp: false,
  isRegistered: false,
  isAuthenticated: false,
  isVerified: false,
  isPhoneVerified: false,
  isAdmin: false,

  errorConfirmEmailOtp: null,
  errorSendEmailOtp: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    getUserDetails: (state, actions: PayloadAction<User>) => {
      state.user = { ...state.user, ...actions.payload };
    },
    success: (state) => {
      state.isVerified = true;
    },
    logout: (state) => ({ ...initialState, isRegistered: state.isRegistered }),
  },
  extraReducers(builder) {
    builder.addCase(getUser.fulfilled, (state, { payload }) => {
      state.user = {
        ...payload,
        ownerOnboardingStatus: state.user?.ownerOnboardingStatus,
      };
      state.isAuthenticated = true;
      console.log("getUser payload:", payload);
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.user = action.payload;
      console.log("register payload:", action.payload);
      state.isRegistered = true;
      state.pendingVerificationEmail = action.meta.arg.email || null;
    });
    builder.addCase(registerOwner.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isRegistered = true;

      state.pendingVerificationEmail = action.meta.arg.user.email;
    });
    builder
      .addCase(login.pending, (state) => {
        state.isAuthenticated = false;
        state.isVerified = false;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        console.log("login payload:", payload);
        state.user = { ...payload.user };
        state.isVerified = true;
        state.isAuthenticated = true;
      });

    builder.addCase(sendEmail.pending, (state) => {
      state.loadingSendEmailOtp = true;
      state.errorSendEmailOtp = null;
    });
    builder.addCase(sendEmail.fulfilled, (state, { payload }) => {
      state.sendEmailOtp = payload;
      state.loadingSendEmailOtp = false;
    });
    builder.addCase(sendEmail.rejected, (state, action) => {
      state.loadingSendEmailOtp = false;
      state.errorSendEmailOtp = action.error.message || "Failed to send Otp";
    });

    builder.addCase(confirmEmail.pending, (state) => {
      state.loadingConfirmEmailOtp = true;
      state.errorConfirmEmailOtp = null;
    });
    builder.addCase(confirmEmail.fulfilled, (state, { payload }) => {
      state.confirmEmailOtp = payload;
      state.loadingConfirmEmailOtp = false;
    });
    builder.addCase(confirmEmail.rejected, (state, action) => {
      state.loadingConfirmEmailOtp = false;
      state.errorConfirmEmailOtp =
        action.error.message || "Failed to confirm Otp";
    });
  },
});

export const { getUserDetails, success, logout } = authSlice.actions;
export default authSlice.reducer;
