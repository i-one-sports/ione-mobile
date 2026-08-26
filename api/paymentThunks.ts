import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";
import { AsyncThunkConfig } from "@/components/typings/api";
import {
  AllMembersPaymentStatus,
  InitPaymentResponse,
  SessionPaymentStatus,
  TournamentPaymentStatus,
  WalletBalance,
  WalletTransaction,
  BankAccountResponse,
  GetBanksResponse,
  LedgerPagination,
  TransactionLedgerResponse,
} from "@/components/typings/payment";

// ─── helpers ──────────────────────────────────────────────────────────────────

function logRequest(thunk: string, endpoint: string, payload?: any) {
  console.log(`\n▶ [${thunk}] REQUEST`);
  console.log(`  endpoint : ${endpoint}`);
  if (payload !== undefined)
    console.log(`  payload  :`, JSON.stringify(payload, null, 2));
}

function logResponse(thunk: string, data: any) {
  console.log(`✅ [${thunk}] SUCCESS`);
  console.log(`  response :`, JSON.stringify(data, null, 2));
}

function logError(thunk: string, err: any) {
  console.log(`❌ [${thunk}] ERROR`);
  console.log(`  error    :`, JSON.stringify(err, null, 2));
}

// ─── Session payment ──────────────────────────────────────────────────────────

export const initSessionPayment = createAsyncThunk<
  InitPaymentResponse,
  string,
  AsyncThunkConfig
>("payment/initSession", async (sessionId, thunkAPI) => {
  const endpoint = `/i-one/wallet/session/${sessionId}/pay`;
  logRequest("initSessionPayment", `POST ${endpoint}`, { sessionId });
  const result = await apiCall(axiosInstance.post(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("initSessionPayment", result);
  else logError("initSessionPayment", result);
  return result;
});

export const getMySessionPayment = createAsyncThunk<
  SessionPaymentStatus,
  string,
  AsyncThunkConfig
>("payment/mySessionStatus", async (sessionId, thunkAPI) => {
  const endpoint = `/i-one/wallet/session/${sessionId}/my-payment`;
  logRequest("getMySessionPayment", `GET ${endpoint}`, { sessionId });
  const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("getMySessionPayment", result);
  else logError("getMySessionPayment", result);
  return result;
});

export const getAllMembersPaymentStatus = createAsyncThunk<
  AllMembersPaymentStatus,
  string,
  AsyncThunkConfig
>("payment/allMembersStatus", async (sessionId, thunkAPI) => {
  const endpoint = `/i-one/wallet/session/${sessionId}/payment-status`;
  logRequest("getAllMembersPaymentStatus", `GET ${endpoint}`, { sessionId });
  const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("getAllMembersPaymentStatus", result);
  else logError("getAllMembersPaymentStatus", result);
  return result;
});

// ─── Tournament payment ───────────────────────────────────────────────────────

export const initTournamentPayment = createAsyncThunk<
  InitPaymentResponse,
  { tournamentId: string; teamId: string },
  AsyncThunkConfig
>("payment/initTournament", async ({ tournamentId, teamId }, thunkAPI) => {
  const endpoint = `/i-one/tournaments/${tournamentId}/team/${teamId}/pay`;
  logRequest("initTournamentPayment", `POST ${endpoint}`, {
    tournamentId,
    teamId,
  });
  const result = await apiCall(axiosInstance.post(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("initTournamentPayment", result);
  else logError("initTournamentPayment", result);
  return result;
});

export const getTournamentPaymentStatus = createAsyncThunk<
  TournamentPaymentStatus | null,
  { tournamentId: string; teamId: string },
  AsyncThunkConfig
>("payment/tournamentStatus", async ({ tournamentId, teamId }, thunkAPI) => {
  const endpoint = `/i-one/tournaments/${tournamentId}/team/${teamId}/payment-status`;
  logRequest("getTournamentPaymentStatus", `GET ${endpoint}`, {
    tournamentId,
    teamId,
  });
  const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("getTournamentPaymentStatus", result);
  else logError("getTournamentPaymentStatus", result);
  return result;
});

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const initWalletFund = createAsyncThunk<
  InitPaymentResponse,
  number,
  AsyncThunkConfig
>("payment/initFund", async (amount, thunkAPI) => {
  const endpoint = `/i-one/wallet/fund`;
  logRequest("initWalletFund", `POST ${endpoint}`, { amount });
  const result = await apiCall(
    axiosInstance.post(endpoint, { amount }),
    thunkAPI,
  );
  if (result && !(result as any)?.payload)
    logResponse("initWalletFund", result);
  else logError("initWalletFund", result);
  return result;
});

export const getWalletBalance = createAsyncThunk<
  WalletBalance,
  void,
  AsyncThunkConfig
>("payment/walletBalance", async (_, thunkAPI) => {
  const endpoint = `/i-one/wallet/balance`;
  logRequest("getWalletBalance", `GET ${endpoint}`);
  const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("getWalletBalance", result);
  else logError("getWalletBalance", result);
  return result;
});

export const getMyWalletBalance = createAsyncThunk<
  WalletBalance,
  void,
  AsyncThunkConfig
>("payment/myWalletBalance", async (_, thunkAPI) => {
  const endpoint = `/i-one/wallet/me`;
  logRequest("getMyWalletBalance", `GET ${endpoint}`);
  const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("getMyWalletBalance", result);
  else logError("getMyWalletBalance", result);
  return result;
});

export const getWalletTransactions = createAsyncThunk<
  { transactions: WalletTransaction[]; pagination: LedgerPagination },
  { page?: number; limit?: number; type?: string },
  AsyncThunkConfig
>(
  "payment/walletTransactions",
  async ({ page = 1, limit = 10, type }, thunkAPI) => {
    const params = `page=${page}&limit=${limit}${type ? `&type=${type}` : ""}`;
    const endpoint = `/i-one/wallet/transactions?${params}`;
    logRequest("getWalletTransactions", `GET ${endpoint}`, {
      page,
      limit,
      type,
    });
    const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
    if (result && !(result as any)?.payload)
      logResponse("getWalletTransactions", result);
    else logError("getWalletTransactions", result);
    return result;
  },
);

export const withdrawFunds = createAsyncThunk<
  any,
  {
    amount: number;
    bankAccountId?: string;
    reason: string;
  },
  AsyncThunkConfig
>(
  "payment/withdrawFunds",
  async ({ amount, bankAccountId, reason }, thunkAPI) => {
    const endpoint = `/i-one/wallet/withdraw`;

    const payload = {
      amount,
      ...(bankAccountId && { bankAccountId }),
      ...(reason && { reason }),
    };

    logRequest("withdrawFunds", `POST ${endpoint}`, payload);

    const result = await apiCall(
      axiosInstance.post(endpoint, payload),
      thunkAPI,
    );

    if (result && !(result as any)?.payload)
      logResponse("withdrawFunds", result);
    else logError("withdrawFunds", result);

    return result;
  },
);

// bank
export const initBankAccount = createAsyncThunk<
  BankAccountResponse,
  {
    accountNumber: string;
    bankCode: string;
    bankName: string;
  },
  AsyncThunkConfig
>(
  "payment/initBankAccount",
  async ({ accountNumber, bankCode, bankName }, thunkAPI) => {
    const endpoint = `/i-one/wallet/bank-accounts`;

    const payload = {
      accountNumber,
      bankCode,
      bankName,
    };

    logRequest("initBankAccount", `POST ${endpoint}`, payload);

    const result = await apiCall(
      axiosInstance.post(endpoint, payload),
      thunkAPI,
    );

    if (result && !(result as any)?.payload)
      logResponse("initBankAccount", result);
    else logError("initBankAccount", result);

    return result;
  },
);

export const getBankAccounts = createAsyncThunk<
  BankAccountResponse,
  void,
  AsyncThunkConfig
>("payment/bankAccounts", async (_, thunkAPI) => {
  const endpoint = `/i-one/wallet/bank-accounts`;
  logRequest("getBankAccounts", `GET ${endpoint}`);
  const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("getBankAccounts", result);
  else logError("getBankAccounts", result);
  return result;
});

export const deleteBankAccount = createAsyncThunk<
  BankAccountResponse,
  string,
  AsyncThunkConfig
>("payment/deleteBankAccount", async (bankAccountId, thunkAPI) => {
  const endpoint = `/i-one/wallet/bank-accounts/${bankAccountId}`;
  logRequest("deleteBankAccount", `DELETE ${endpoint}`);
  const result = await apiCall(axiosInstance.delete(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("deleteBankAccount", result);
  else logError("deleteBankAccount", result);
  return result;
});

// set bank account to default
export const defaultBankAccount = createAsyncThunk<
  BankAccountResponse,
  string,
  AsyncThunkConfig
>("payment/defaultBankAccount", async (bankAccountId, thunkAPI) => {
  const endpoint = `/i-one/wallet/bank-accounts/${bankAccountId}/default`;
  logRequest("defaultBankAccount", `PATCH ${endpoint}`);
  const result = await apiCall(axiosInstance.patch(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("defaultBankAccount", result);
  else logError("defaultBankAccount", result);
  return result;
});

export const getBanks = createAsyncThunk<
  GetBanksResponse,
  void,
  AsyncThunkConfig
>("payment/banks", async (_, thunkAPI) => {
  const endpoint = `/i-one/banks`;
  logRequest("getBanks", `GET ${endpoint}`);
  const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
  if (result && !(result as any)?.payload) logResponse("getBanks", result);
  else logError("getBanks", result);
  return result;
});

export const getWalletLedger = createAsyncThunk<
  TransactionLedgerResponse,
  { page?: number; limit?: number; type?: string },
  AsyncThunkConfig
>("payment/walletLedger", async ({ page = 1, limit = 50, type }, thunkAPI) => {
  const params = `page=${page}&limit=${limit}${type ? `&type=${type}` : ""}`;
  const endpoint = `/i-one/wallet/ledger?${params}`;
  logRequest("getWalletLedger", `GET ${endpoint}`, { page, limit, type });
  const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("getWalletLedger", result);
  else logError("getWalletLedger", result);
  return result;
});
