import { getUser, login, register } from "@/api/authThunks";
import { User } from "@/components/typings";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface State {
  user: User | null;
  profile: object | null;
  isRegistered: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  isPhoneVerified: boolean;
  isAdmin: boolean;
}

const initialState: State = {
  user: null,
  profile: null,
  isRegistered: false,
  isAuthenticated: false,
  isVerified: false,
  isPhoneVerified: false,
  isAdmin: false,
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
      state.user = payload;
      state.isAuthenticated = true;
      console.log("payload:", payload);
    });
    builder.addCase(register.fulfilled, (state, { payload }) => {
      state.user = payload;
      console.log("payload:", payload);
      state.isRegistered = true;
    });
    builder
      .addCase(login.pending, (state) => {
        state.isAuthenticated = false;
        state.isVerified = false;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        console.log("payload:", payload);
        state.user = {
          ...payload.user,
          ownerOnboardingStatus: payload.ownerOnboardingStatus,
        };
        state.isVerified = true;
        state.isAuthenticated = true;
      });
  },
});

export const { getUserDetails, success, logout } = authSlice.actions;
export default authSlice.reducer;
