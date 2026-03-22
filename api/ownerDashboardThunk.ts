import { AsyncThunkConfig } from "@/components/typings/api";
import {
  DashboardSummary,
  LocationResponse,
  VisitorResponse,
  LastMatch,
  UpcomingSession,
  UsersChart,
  RevenueStats,
  UpdatePitchConditionResponse,
  PitchConditionType,
  ChangePasswordResponse,
  ChangePasswordPayload,
  TransactionHistoryResponse,
} from "@/components/typings/apiResponse";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";

export const getLocation = createAsyncThunk<
  LocationResponse,
  void,
  AsyncThunkConfig
>("location/getLocation", async (_, thunkAPI) => {
  return apiCall(axiosInstance.get(`/i-one/location`), thunkAPI);
});

export const getSummary = createAsyncThunk<
  DashboardSummary,
  string,
  AsyncThunkConfig
>("location/getSummary", async (locationId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/i-one/location/${locationId}/dashboard/summary`),
    thunkAPI,
  );
});

export const getLastMatches = createAsyncThunk<
  LastMatch[],
  string,
  AsyncThunkConfig
>("location/getLastMatches", async (locationId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/i-one/location/${locationId}/dashboard/last-matches`),
    thunkAPI,
  );
});

export const getVisitorsCount = createAsyncThunk<
  VisitorResponse,
  string,
  AsyncThunkConfig
>("location/getVisitorsCount", async (locationId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/i-one/location/${locationId}/dashboard/visitors`),
    thunkAPI,
  );
});

export const getUpcomingSessions = createAsyncThunk<
  UpcomingSession[],
  string,
  AsyncThunkConfig
>("location/getUpcomingSessions", async (locationId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(
      `/i-one/location/${locationId}/dashboard/upcoming-sessions`,
    ),
    thunkAPI,
  );
});

export const getRevenue = createAsyncThunk<
  RevenueStats,
  string,
  AsyncThunkConfig
>("location/getRevenue", async (locationId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/i-one/location/${locationId}/dashboard/revenue`),
    thunkAPI,
  );
});

export const getUsersChart = createAsyncThunk<
  UsersChart,
  string,
  AsyncThunkConfig
>("location/getUsersChart", async (locationId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/i-one/location/${locationId}/dashboard/users-chart`),
    thunkAPI,
  );
});

export const updatePitchCondition = createAsyncThunk<
  UpdatePitchConditionResponse,
  { locationId: string; pitchCondition: PitchConditionType },
  AsyncThunkConfig
>(
  "/location/pitch-condition",
  async ({ locationId, pitchCondition }, thunkAPI) => {
    return apiCall(
      axiosInstance.patch(`/i-one/location/${locationId}/pitch-condition`, {
        pitchCondition,
      }),
      thunkAPI,
    );
  },
);

export const changePassword = createAsyncThunk<
  ChangePasswordResponse,
  ChangePasswordPayload,
  AsyncThunkConfig
>("/user/change-password", async (payload, thunkAPI) => {
  return apiCall(
    axiosInstance.patch(`/i-one/user/change-password`, payload),
    thunkAPI,
  );
});

export const getTransactionHistory = createAsyncThunk<
  TransactionHistoryResponse,
  string,
  AsyncThunkConfig
>("/location/transactions", async (locationId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(
      `/i-one/billing/location/${locationId}/transactions`,
      thunkAPI,
    ),
    thunkAPI,
  );
});
