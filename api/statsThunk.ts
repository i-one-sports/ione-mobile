import { AsyncThunkConfig } from "@/components/typings/api";
import { PlayerRating, PlayerStats } from "@/components/typings/stats";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";

// GET /stats/:userId?season= — anyone's totals; leave season out for all-time.
export const getUserStats = createAsyncThunk<
  PlayerStats,
  { userId: string; season?: number },
  AsyncThunkConfig
>("stats/getUserStats", async ({ userId, season }, thunkApi) => {
  return apiCall(
    axiosInstance.get(`/i-one/stats/${userId}`, {
      params: season ? { season } : undefined,
    }),
    thunkApi,
  );
});

// GET /stats/:userId/rating — rating out of 10 over the last 20 sessions.
export const getUserRating = createAsyncThunk<
  PlayerRating,
  string,
  AsyncThunkConfig
>("stats/getUserRating", async (userId, thunkApi) => {
  return apiCall(axiosInstance.get(`/i-one/stats/${userId}/rating`), thunkApi);
});
