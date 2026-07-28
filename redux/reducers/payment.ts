import { createSlice } from "@reduxjs/toolkit";
import {
  getAllMembersPaymentStatus,
  getMySessionPayment,
  getTournamentPaymentStatus,
  getWalletBalance,
  getWalletTransactions,
  initSessionPayment,
  initTournamentPayment,
  initWalletFund,
} from "@/api/paymentThunks";
import {
  AllMembersPaymentStatus,
  InitPaymentResponse,
  SessionPaymentStatus,
  TournamentPaymentStatus,
  WalletBalance,
  WalletTransaction,
} from "@/components/typings/payment";

interface PaymentState {
  initData: InitPaymentResponse | null;
  mySessionPayment: SessionPaymentStatus | null;
  allMembersStatus: AllMembersPaymentStatus | null;
  tournamentPayment: TournamentPaymentStatus | null;
  walletBalance: WalletBalance | null;
  walletTransactions: WalletTransaction[];

  loadingInit: boolean;
  loadingStatus: boolean;
  loadingBalance: boolean;

  errorInit: string | null;
  errorStatus: string | null;
}

const initialState: PaymentState = {
  initData: null,
  mySessionPayment: null,
  allMembersStatus: null,
  tournamentPayment: null,
  walletBalance: null,
  walletTransactions: [],

  loadingInit: false,
  loadingStatus: false,
  loadingBalance: false,

  errorInit: null,
  errorStatus: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentState: () => initialState,
  },
  extraReducers(builder) {
    // Init session
    builder
      .addCase(initSessionPayment.pending, (state) => {
        state.loadingInit = true;
        state.errorInit = null;
      })
      .addCase(initSessionPayment.fulfilled, (state, { payload }) => {
        state.loadingInit = false;
        state.initData = payload;
      })
      .addCase(initSessionPayment.rejected, (state, action) => {
        state.loadingInit = false;
        state.errorInit = action.payload?.msg ?? "Failed to initialise payment";
      });

    // My session payment status
    builder
      .addCase(getMySessionPayment.pending, (state) => {
        state.loadingStatus = true;
        state.errorStatus = null;
      })
      .addCase(getMySessionPayment.fulfilled, (state, { payload }) => {
        state.loadingStatus = false;
        state.mySessionPayment = payload;
      })
      .addCase(getMySessionPayment.rejected, (state, action) => {
        state.loadingStatus = false;
        state.errorStatus = action.payload?.msg ?? "Failed to fetch status";
      });

    // All members status
    builder.addCase(
      getAllMembersPaymentStatus.fulfilled,
      (state, { payload }) => {
        state.allMembersStatus = payload;
      },
    );

    // Init tournament
    builder
      .addCase(initTournamentPayment.pending, (state) => {
        state.loadingInit = true;
        state.errorInit = null;
      })
      .addCase(initTournamentPayment.fulfilled, (state, { payload }) => {
        state.loadingInit = false;
        state.initData = payload;
      })
      .addCase(initTournamentPayment.rejected, (state, action) => {
        state.loadingInit = false;
        state.errorInit = action.payload?.msg ?? "Failed to initialise payment";
      });

    // Tournament payment status
    builder.addCase(
      getTournamentPaymentStatus.fulfilled,
      (state, { payload }) => {
        state.tournamentPayment = payload;
      },
    );

    // Init wallet fund
    builder
      .addCase(initWalletFund.pending, (state) => {
        state.loadingInit = true;
        state.errorInit = null;
      })
      .addCase(initWalletFund.fulfilled, (state, { payload }) => {
        state.loadingInit = false;
        state.initData = payload;
      })
      .addCase(initWalletFund.rejected, (state, action) => {
        state.loadingInit = false;
        state.errorInit = action.payload?.msg ?? "Failed to initialise funding";
      });

    // Wallet balance
    builder
      .addCase(getWalletBalance.pending, (state) => {
        state.loadingBalance = true;
      })
      .addCase(getWalletBalance.fulfilled, (state, { payload }) => {
        state.loadingBalance = false;
        state.walletBalance = payload;
      })
      .addCase(getWalletBalance.rejected, (state) => {
        state.loadingBalance = false;
      });

    // Wallet transactions
    builder.addCase(getWalletTransactions.fulfilled, (state, { payload }) => {
      state.walletTransactions = payload.data ?? [];
    });
  },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
