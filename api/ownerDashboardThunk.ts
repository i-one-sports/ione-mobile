import { AsyncThunkConfig } from "@/components/typings/api";
import {
  SessionByDateResponse,
  ChangePasswordPayload,
  SessionByDatePayload,
  ChangePasswordResponse,
  DashboardSummary,
  LastMatch,
  LocationResponse,
  PitchConditionType,
  RevenueStats,
  TransactionHistoryResponse,
  UpcomingSession,
  UpdatePitchConditionResponse,
  UpdatePricingOptionsResponse,
  UsersChart,
  VisitorResponse,
  SessionByIdResponse,
  UpdateOpenHoursResponse,
  PaymentHistoryResponse,
  SessionPaymentDetailsResponse,
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

export const getLocationDashboard = createAsyncThunk<
  DashboardSummary,
  string,
  AsyncThunkConfig
>("location/getLocationDashboard", async (locationId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/i-one/location/${locationId}/dashboard`),
    thunkAPI,
  );
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

export const getSessionByDate = createAsyncThunk<
  SessionByDateResponse[],
  SessionByDatePayload,
  AsyncThunkConfig
>("/sessionbydate", async ({ locationId, date }, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/i-one/sessions/by-location/${locationId}`, {
      params: { date },
    }),
    thunkAPI,
  );
});

export const getSessionById = createAsyncThunk<
  SessionByIdResponse,
  string,
  AsyncThunkConfig
>("/sessionbyid", async (sessionId, thunkAPI) => {
  return apiCall(axiosInstance.get(`/i-one/sessions/${sessionId}`), thunkAPI);
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

export const getLocationTransactions = createAsyncThunk<
  PaymentHistoryResponse,
  { locationId: string; page?: number; limit?: number; type?: string },
  AsyncThunkConfig
>(
  "billing/LocationTransactions",
  async ({ locationId, page = 1, limit = 10, type }, thunkAPI) => {
    const params = `page=${page}&limit=${limit}${type ? `&type=${type}` : ""}`;
    const endpoint = `/i-one/billing/location/${locationId}/transactions?${params}`;
    const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
    return result;
  },
);

export const updatePricingOptions = createAsyncThunk<
  UpdatePricingOptionsResponse,
  { locationId: string },
  AsyncThunkConfig
>("/location/pricing-options", async ({ locationId, ...payload }, thunkAPI) => {
  return apiCall(
    axiosInstance.patch(
      `/i-one/location/${locationId}/pricing-options`,
      payload,
    ),
    thunkAPI,
  );
});

export const updateOpenHours = createAsyncThunk<
  UpdateOpenHoursResponse,
  { locationId: string; openingHour: string; closingHour: string },
  AsyncThunkConfig
>("/location/opening-hours", async ({ locationId, ...payload }, thunkAPI) => {
  return apiCall(
    axiosInstance.patch(`/i-one/location/${locationId}/opening-hours`, payload),
    thunkAPI,
  );
});

export const getLocationTeamStatus = createAsyncThunk<
  SessionPaymentDetailsResponse,
  { locationId: string; sessionId: string },
  AsyncThunkConfig
>(
  "/billing/LocationTeamStatus",
  async ({ locationId, sessionId }, thunkAPI) => {
    const endpoint = `/i-one/billing/location/${locationId}/sessions/${sessionId}/team-status`;
    const result = await apiCall(axiosInstance.get(endpoint), thunkAPI);
    return result;
  },
);
