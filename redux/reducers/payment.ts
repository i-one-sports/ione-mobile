import { createSlice } from "@reduxjs/toolkit";
import {
  getAllMembersPaymentStatus,
  getMySessionPayment,
  getTournamentPaymentStatus,
  getWalletBalance,
  getMyWalletBalance,
  getWalletTransactions,
  initSessionPayment,
  initTournamentPayment,
  initWalletFund,
  withdrawFunds,
  initBankAccount,
  getBankAccounts,
  deleteBankAccount,
  defaultBankAccount,
  getBanks,
  getWalletLedger,
} from "@/api/paymentThunks";
import {
  AllMembersPaymentStatus,
  InitPaymentResponse,
  SessionPaymentStatus,
  TournamentPaymentStatus,
  WalletBalance,
  WalletTransaction,
  WithdrawFundsResponse,
  BankAccountResponse,
  Bank,
  LedgerEntry,
  LedgerPagination,
} from "@/components/typings/payment";

interface BankAccountItem {
  _id?: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  isDefault?: boolean;
}

interface PaymentState {
  initData: InitPaymentResponse | null;
  mySessionPayment: SessionPaymentStatus | null;
  allMembersStatus: AllMembersPaymentStatus | null;
  tournamentPayment: TournamentPaymentStatus | null;
  walletBalance: WalletBalance | null;
  myWalletBalance: WalletBalance | null;
  walletTransactions: WalletTransaction[];
  withdrawData: WithdrawFundsResponse | null;
  bankAccountData: BankAccountResponse | null;
  bankAccounts: BankAccountItem[];
  banks: Bank[];
  walletLedger: LedgerEntry[];
  walletLedgerPagination: LedgerPagination | null;
  walletTransactionsPagination: LedgerPagination | null;

  loadingInit: boolean;
  loadingStatus: boolean;
  loadingBalance: boolean;
  loadingMyBalance: boolean;
  loadingWithdraw: boolean;
  loadingBankAccounts: boolean;
  loadingBanks: boolean;
  loadingAddBank: boolean;
  loadingDeleteBank: boolean;
  loadingDefaultBank: boolean;
  loadingWalletTransaction: boolean;
  loadingWalletLedger: boolean;

  errorInit: string | null;
  errorStatus: string | null;
  errorWithdraw: string | null;
  errorBankAccounts: string | null;
  errorWalletTransaction: string | null;
  errorWalletLedger: string | null;
}

const initialState: PaymentState = {
  initData: null,
  mySessionPayment: null,
  allMembersStatus: null,
  tournamentPayment: null,
  walletBalance: null,
  myWalletBalance: null,
  walletTransactions: [],
  withdrawData: null,
  bankAccountData: null,
  bankAccounts: [],
  banks: [],
  walletLedger: [],
  walletLedgerPagination: null,
  walletTransactionsPagination: null,

  loadingInit: false,
  loadingStatus: false,
  loadingBalance: false,
  loadingMyBalance: false,
  loadingWithdraw: false,
  loadingBankAccounts: false,
  loadingBanks: false,
  loadingAddBank: false,
  loadingDeleteBank: false,
  loadingDefaultBank: false,
  loadingWalletTransaction: false,
  loadingWalletLedger: false,

  errorInit: null,
  errorStatus: null,
  errorWithdraw: null,
  errorBankAccounts: null,
  errorWalletTransaction: null,
  errorWalletLedger: null,
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

    // My Wallet balance
    builder
      .addCase(getMyWalletBalance.pending, (state) => {
        state.loadingMyBalance = true;
      })
      .addCase(getMyWalletBalance.fulfilled, (state, { payload }) => {
        state.loadingMyBalance = false;
        state.myWalletBalance = payload;
      })
      .addCase(getMyWalletBalance.rejected, (state) => {
        state.loadingMyBalance = false;
      });

    // Wallet transactions
    builder
      .addCase(getWalletTransactions.pending, (state) => {
        state.loadingWalletTransaction = true;
      })
      .addCase(getWalletTransactions.fulfilled, (state, { payload }) => {
        state.loadingWalletTransaction = false;
        state.walletTransactions = payload.data ?? [];
        state.walletTransactionsPagination = payload.pagination ?? null;
      })
      .addCase(getWalletTransactions.rejected, (state) => {
        state.loadingWalletTransaction = false;
      });

    // Withdraw funds
    builder
      .addCase(withdrawFunds.pending, (state) => {
        state.loadingWithdraw = true;
        state.errorWithdraw = null;
      })
      .addCase(withdrawFunds.fulfilled, (state, { payload }) => {
        state.loadingWithdraw = false;
        state.withdrawData = payload;
      })
      .addCase(withdrawFunds.rejected, (state, action) => {
        state.loadingWithdraw = false;
        state.errorWithdraw = action.payload?.msg ?? "Failed to withdraw funds";
      });

    // Get bank accounts
    builder
      .addCase(getBankAccounts.pending, (state) => {
        state.loadingBankAccounts = true;
        state.errorBankAccounts = null;
      })
      .addCase(getBankAccounts.fulfilled, (state, { payload }) => {
        state.loadingBankAccounts = false;
        state.bankAccountData = payload;
        if (Array.isArray(payload)) {
          state.bankAccounts = payload;
        } else if (payload && (payload as any).data) {
          state.bankAccounts = (payload as any).data;
        }
      })
      .addCase(getBankAccounts.rejected, (state, action) => {
        state.loadingBankAccounts = false;
        state.errorBankAccounts =
          action.payload?.msg ?? "Failed to fetch bank accounts";
      });

    // Add bank account
    builder
      .addCase(initBankAccount.pending, (state) => {
        state.loadingAddBank = true;
      })
      .addCase(initBankAccount.fulfilled, (state, { payload }) => {
        state.loadingAddBank = false;
        state.bankAccountData = payload;
        if (payload && !Array.isArray(payload)) {
          state.bankAccounts.push(payload as any);
        }
      })
      .addCase(initBankAccount.rejected, (state) => {
        state.loadingAddBank = false;
      });

    // Delete bank account
    builder
      .addCase(deleteBankAccount.pending, (state) => {
        state.loadingDeleteBank = true;
      })
      .addCase(deleteBankAccount.fulfilled, (state, { payload }) => {
        state.loadingDeleteBank = false;
        state.bankAccountData = payload;
        if (payload && (payload as any).deletedAccountId) {
          state.bankAccounts = state.bankAccounts.filter(
            (a) => a._id !== (payload as any).deletedAccountId,
          );
        }
      })
      .addCase(deleteBankAccount.rejected, (state) => {
        state.loadingDeleteBank = false;
      });

    // Set default bank account
    builder
      .addCase(defaultBankAccount.pending, (state) => {
        state.loadingDefaultBank = true;
      })
      .addCase(defaultBankAccount.fulfilled, (state, { payload }) => {
        state.loadingDefaultBank = false;
        state.bankAccountData = payload;
        if (payload && (payload as any).defaultAccountId) {
          state.bankAccounts = state.bankAccounts.map((a) => ({
            ...a,
            isDefault: a._id === (payload as any).defaultAccountId,
          }));
        }
      })
      .addCase(defaultBankAccount.rejected, (state) => {
        state.loadingDefaultBank = false;
      });

    // Get banks list
    builder
      .addCase(getBanks.pending, (state) => {
        state.loadingBanks = true;
      })
      .addCase(getBanks.fulfilled, (state, { payload }) => {
        state.loadingBanks = false;
        state.banks = payload;
      })
      .addCase(getBanks.rejected, (state) => {
        state.loadingBanks = false;
      });

    // Wallet ledger
    builder
      .addCase(getWalletLedger.pending, (state) => {
        state.loadingWalletLedger = true;
        state.errorWalletLedger = null;
      })
      .addCase(getWalletLedger.fulfilled, (state, { payload }) => {
        state.loadingWalletLedger = false;
        state.walletLedger = payload.entries ?? [];
        state.walletLedgerPagination = payload.pagination ?? null;
      })
      .addCase(getWalletLedger.rejected, (state, action) => {
        state.loadingWalletLedger = false;
        state.errorWalletLedger =
          action.payload?.msg ?? "Failed to fetch ledger";
      });
  },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
