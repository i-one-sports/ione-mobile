import { AsyncThunkConfig } from "@/components/typings/api";
import {
  WalletResponse,
  BankResponse,
  TransactionLedgerResponse,
  TransactionListResponse,
} from "@/components/typings/apiResponse";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";

export const getUserWallet = createAsyncThunk<
  WalletResponse,
  void,
  AsyncThunkConfig
>("wallet/getUserWallet", async (_, thunkAPI) => {
  return apiCall(axiosInstance.get(`/i-one/wallet/me`), thunkAPI);
});

export const getBank = createAsyncThunk<BankResponse, void, AsyncThunkConfig>(
  "user/getBank",
  async (_, thunkAPI) => {
    return apiCall(axiosInstance.get("/i-one/user/banks"), thunkAPI, "auth");
  },
);

export const getWalletLedger = createAsyncThunk<
  TransactionLedgerResponse,
  void,
  AsyncThunkConfig
>("wallet/getUserLedger", async (_, thunkAPI) => {
  return apiCall(axiosInstance.get(`/i-one/wallet/ledger`), thunkAPI);
});

export const getWalletTransactions = createAsyncThunk<
  TransactionListResponse,
  void,
  AsyncThunkConfig
>("wallet/getWalletTransactions", async (_, thunkAPI) => {
  return apiCall(axiosInstance.get(`/i-one/wallet/transactions`), thunkAPI);
});
