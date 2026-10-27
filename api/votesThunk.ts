import { AsyncThunkConfig } from "@/components/typings/api";
import { SessionVote } from "@/components/typings/vote";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";

// GET /votes/:sessionId — 404 means voting hasn't opened yet.
export const getSessionVote = createAsyncThunk<
  SessionVote,
  string,
  AsyncThunkConfig
>("votes/getSessionVote", async (sessionId, thunkApi) => {
  return apiCall(axiosInstance.get(`/i-one/votes/${sessionId}`), thunkApi);
});

// POST /votes/:sessionId — final; returns the same shape as the GET.
export const castSessionVote = createAsyncThunk<
  SessionVote,
  { sessionId: string; candidateId: string },
  AsyncThunkConfig
>("votes/castSessionVote", async ({ sessionId, candidateId }, thunkApi) => {
  return apiCall(
    axiosInstance.post(`/i-one/votes/${sessionId}`, { candidateId }),
    thunkApi,
  );
});
