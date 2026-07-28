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

export const getWalletTransactions = createAsyncThunk<
  { data: WalletTransaction[]; pagination: object },
  { page?: number; limit?: number },
  AsyncThunkConfig
>("payment/walletTransactions", async ({ page = 1, limit = 10 }, thunkAPI) => {
  const endpoint = `/i-one/wallet/transactions?page=${page}&limit=${limit}`;
  logRequest("getWalletTransactions", `GET ${endpoint}`, { page, limit });
  const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
  if (result && !(result as any)?.payload)
    logResponse("getWalletTransactions", result);
  else logError("getWalletTransactions", result);
  return result;
});
