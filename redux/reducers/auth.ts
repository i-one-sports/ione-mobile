import {
  confirmEmail,
  getUser,
  getVerification,
  login,
  register,
  registerOwner,
  sendEmail,
  updateProfile,
} from "@/api/authThunks";
import { User } from "@/components/typings";
import {
  SendEmailResponse,
  ConfirmEmailResponse,
  GetVerificationResponse,
} from "@/components/typings/apiResponse";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface State {
  user: User | null;
  verification: GetVerificationResponse | null;
  pendingVerificationEmail: string | null;
  sendEmailOtp: SendEmailResponse | null;
  confirmEmailOtp: ConfirmEmailResponse | null;
  profile: object | null;

  loadingSendEmailOtp: boolean;
  loadingConfirmEmailOtp: boolean;
  loadingVerification: boolean;
  isRegistered: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  isPhoneVerified: boolean;
  isAdmin: boolean;

  errorSendEmailOtp: string | null;
  errorConfirmEmailOtp: string | null;
  errorVerification: string | null;
}

const initialState: State = {
  user: null,
  verification: null,
  sendEmailOtp: null,
  confirmEmailOtp: null,
  profile: null,
  pendingVerificationEmail: null,

  loadingConfirmEmailOtp: false,
  loadingVerification: false,
  loadingSendEmailOtp: false,
  isRegistered: false,
  isAuthenticated: false,
  isVerified: false,
  isPhoneVerified: false,
  isAdmin: false,

  errorConfirmEmailOtp: null,
  errorSendEmailOtp: null,
  errorVerification: null,
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
    // builder.addCase(getUser.fulfilled, (state, { payload }) => {
    //   state.user = {
    //     ...payload,
    //     ownerOnboardingStatus: state.user?.ownerOnboardingStatus,
    //   };
    //   state.isAuthenticated = true;
    //   console.log("getUser payload:", payload);
    // });
    builder.addCase(getUser.fulfilled, (state, { payload }) => {
      state.user = payload;
      state.isAuthenticated = true;
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
    builder.addCase(updateProfile.fulfilled, (state, { payload }) => {
      const nextUser =
        (payload as { user?: User } | undefined)?.user ?? payload;
      state.user = {
        ...(state.user ?? {}),
        ...(nextUser ?? {}),
      } as User;
      state.isAuthenticated = true;
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

    builder.addCase(getVerification.pending, (state) => {
      state.loadingVerification = true;
      state.errorVerification = null;
    });
    builder.addCase(getVerification.fulfilled, (state, { payload }) => {
      console.log("verification payload:", payload);

      state.verification = payload;
      state.loadingVerification = false;
    });
    builder.addCase(getVerification.rejected, (state, action) => {
      state.loadingVerification = false;
      state.errorVerification =
        action.error.message || "Failed to fetch verification";
    });
  },
});

export const { getUserDetails, success, logout } = authSlice.actions;
export default authSlice.reducer;
