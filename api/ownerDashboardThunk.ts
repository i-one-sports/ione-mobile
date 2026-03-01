import { AsyncThunkConfig } from "@/components/typings/api";
import {
  DashboardSummary,
  LocationResponse,
  VisitorResponse,
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

export const getRecentData = createAsyncThunk<
  DashboardSummary,
  string,
  AsyncThunkConfig
>("location/getRecentData", async (locationId, thunkAPI) => {
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
  DashboardSummary,
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
