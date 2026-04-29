import { AsyncThunkConfig } from "@/components/typings/api";
import { MatchDetails } from "@/components/typings/apiResponse";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";

export const getMatchDetails = createAsyncThunk<
  MatchDetails,
  string,
  AsyncThunkConfig
>("matches/getMatchDetails", async (matchId, thunkApi) => {
  return apiCall(
    axiosInstance.get(`/i-one/matches/details/${matchId}`),
    thunkApi,
  );
});
