import { AsyncThunkConfig } from "@/components/typings/api";
import { WalletResponse, BankResponse } from "@/components/typings/apiResponse";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";

export const getUserWallet = createAsyncThunk<
  WalletResponse,
  string,
  AsyncThunkConfig
>("wallet/getUserWallet", async (userId, thunkAPI) => {
  return apiCall(axiosInstance.get(`/i-one/wallet/user/${userId}`), thunkAPI);
});

export const getBank = createAsyncThunk<BankResponse, void, AsyncThunkConfig>(
  "user/getBank",
  async (_, thunkAPI) => {
    return apiCall(axiosInstance.get("/i-one/user/banks"), thunkAPI, "auth");
  },
);
