import { getUserWallet, getBank } from "@/api/walletThunks";
import { WalletResponse, BankResponse } from "@/components/typings/apiResponse";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  wallet: WalletResponse | null;
  bank: BankResponse | null;

  loading: boolean;
  loadingBank: boolean;

  error: string | null;
  errorBank: string | null;
}

const initialState: State = {
  wallet: null,
  bank: null,

  loading: false,
  loadingBank: false,

  error: null,
  errorBank: null,
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

      builder.addCase(getBank.pending, (state) => {
        state.loadingBank = true;
        state.errorBank = null;
      });
      builder.addCase(getBank.fulfilled, (state, { payload }) => {
        state.bank = payload;
        state.loadingBank = false;
      });
      builder.addCase(getBank.rejected, (state, action) => {
        state.loadingBank = false;
        state.errorBank = action.error.message || "Failed to fetch Bank";
      });
    });
  },
});

export default walletSlice.reducer;
