/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import {
  AsyncThunkConfig,
  sessionPayload,
  StartSessionRequest,
} from "@/components/typings/api";
import { MatchSession, pitchSessions } from "@/redux/reducers/sessions";
import axiosInstance from "./axios";
import { AllSessionsResponse } from "@/components/typings/apiResponse";

export const nearBy = createAsyncThunk<
  MatchSession[],
  sessionPayload,
  AsyncThunkConfig
>("/nearby", async (payload, thunkAPI) => {
  console.log("pay", payload);

  return apiCall(
    axiosInstance.get("/i-one/sessions/nearby-sessions", {
      params: payload,
    }),
    thunkAPI,
  );
});

export const nearByLocation = createAsyncThunk<
  pitchSessions[],
  sessionPayload,
  AsyncThunkConfig
>("/nearbyLocation", async (payload, thunkAPI) => {
  console.log("pay", payload);

  return apiCall(
    axiosInstance.get("/i-one/location/nearby", {
      params: payload,
    }),
    thunkAPI,
  );
});

export const allSessions = createAsyncThunk<
  AllSessionsResponse,
  sessionPayload,
  AsyncThunkConfig
>("/all", async (payload, thunkAPI) => {
  console.log("pay", payload);

  return apiCall(
    axiosInstance.get("/i-one/sessions/all", {
      params: payload,
    }),
    thunkAPI,
  );
});

export const startSession = createAsyncThunk<
  any, // Replace with your response type if available
  StartSessionRequest,
  AsyncThunkConfig
>("/startSession", async (payload, thunkAPI) => {
  console.log("Starting session with payload:", payload);

  return apiCall(
    axiosInstance.post("/i-one/sessions/start", payload),
    thunkAPI,
  );
});

export const createSession = createAsyncThunk<
  any,
  { sessionId: string; data: any },
  AsyncThunkConfig
>("/createSession", async (payload, thunkAPI) => {
  const { sessionId, data } = payload;

  return apiCall(
    axiosInstance.post(`/i-one/sessions/create/${sessionId}`, data),
    thunkAPI,
  );
});

export const joinSession = createAsyncThunk<
  any, // Replace with your response type if available
  { sessionId: string },
  AsyncThunkConfig
>("/joinSession", async (payload, thunkAPI) => {
  console.log("Joining session with ID:", payload.sessionId);

  return apiCall(
    axiosInstance.post(`/i-one/sessions/join/${payload.sessionId}`),
    thunkAPI,
  );
});

export const createSets = createAsyncThunk<
  any[], // Array of created sets
  { sessionId: string },
  AsyncThunkConfig
>("/createSets", async (payload, thunkAPI) => {
  const { sessionId } = payload;
  console.log("Creating sets for session:", sessionId);

  return apiCall(
    axiosInstance.post(`/i-one/sets/create/${sessionId}`),
    thunkAPI,
  );
});

export const getSessionSets = createAsyncThunk<
  any[], // Array of sets
  { sessionId: string },
  AsyncThunkConfig
>("/getSessionSets", async (payload, thunkAPI) => {
  const { sessionId } = payload;
  console.log("Fetching sets for session:", sessionId);

  return apiCall(axiosInstance.get(`/i-one/sets/${sessionId}`), thunkAPI);
});
