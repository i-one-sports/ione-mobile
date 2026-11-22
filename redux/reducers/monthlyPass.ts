import { createSlice } from "@reduxjs/toolkit";
import { logOut } from "@/api/authThunks";
import {
  checkoutMonthlyPass,
  getMyMonthlyPass,
  getUserMonthlyPasses,
} from "@/api/monthlyPassThunks";
import {
  MonthlyPass,
  MyMonthlyPassResponse,
} from "@/components/typings/apiResponse";

interface State {
  /** The player's pass info for the pitch last loaded. */
  myPass: MyMonthlyPassResponse | null;
  /** Every pass the player has, newest first (My passes). */
  userPasses: MonthlyPass[];

  loadingMyPass: boolean;
  loadingCheckout: boolean;
  loadingUserPasses: boolean;

  errorMyPass: string | null;
  errorCheckout: string | null;
  errorUserPasses: string | null;
}

const initialState: State = {
  myPass: null,
  userPasses: [],

  loadingMyPass: false,
  loadingCheckout: false,
  loadingUserPasses: false,

  errorMyPass: null,
  errorCheckout: null,
  errorUserPasses: null,
};

export const monthlyPassSlice = createSlice({
  name: "monthlyPass",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(logOut.fulfilled, () => initialState);

    builder.addCase(getMyMonthlyPass.pending, (state, { meta }) => {
      // A different pitch: drop the old one so it never shows here.
      if (state.myPass?.locationId !== meta.arg.locationId) {
        state.myPass = null;
      }
      state.loadingMyPass = true;
      state.errorMyPass = null;
    });
    builder.addCase(getMyMonthlyPass.fulfilled, (state, { payload }) => {
      state.myPass = payload;
      state.loadingMyPass = false;
    });
    builder.addCase(getMyMonthlyPass.rejected, (state, action) => {
      state.loadingMyPass = false;
      state.errorMyPass =
        action.payload?.msg ||
        action.error.message ||
        "Failed to load monthly pass";
    });

    builder.addCase(getUserMonthlyPasses.pending, (state) => {
      state.loadingUserPasses = true;
      state.errorUserPasses = null;
    });
    builder.addCase(getUserMonthlyPasses.fulfilled, (state, { payload }) => {
      state.userPasses = Array.isArray(payload) ? payload : [];
      state.loadingUserPasses = false;
    });
    builder.addCase(getUserMonthlyPasses.rejected, (state, action) => {
      state.loadingUserPasses = false;
      state.errorUserPasses =
        action.payload?.msg ||
        action.error.message ||
        "Failed to load your passes";
    });

    builder.addCase(checkoutMonthlyPass.pending, (state) => {
      state.loadingCheckout = true;
      state.errorCheckout = null;
    });
    builder.addCase(checkoutMonthlyPass.fulfilled, (state) => {
      state.loadingCheckout = false;
    });
    builder.addCase(checkoutMonthlyPass.rejected, (state, action) => {
      state.loadingCheckout = false;
      state.errorCheckout =
        action.payload?.msg ||
        action.error.message ||
        "Failed to open checkout";
    });
  },
});

export default monthlyPassSlice.reducer;
