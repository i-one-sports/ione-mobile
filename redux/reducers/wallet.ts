import { getUserWallet } from "@/api/walletThunks";
import { WalletResponse } from "@/components/typings/apiResponse";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  wallet: WalletResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  wallet: null,
  loading: false,
  error: null,
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getUserWallet.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getUserWallet.fulfilled, (state, { payload }) => {
      state.wallet = payload;
      console.log("payload:", payload);
      state.loading = false;
    });
    builder.addCase(getUserWallet.rejected, (state, action) => {
      console.log("FULL ERROR ACTION:", action);
      state.loading = false;
      if (action.payload) {
        state.error = action.payload.msg;
      } else {
        state.error = action.error.message || "Failed";
      }
    });
  },
});

export default walletSlice.reducer;
