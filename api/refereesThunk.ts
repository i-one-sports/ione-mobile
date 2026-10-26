import { AsyncThunkConfig } from "@/components/typings/api";
import { RefereeEntry, RefereeHistory } from "@/components/typings/match";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";

// GET /referees/:sessionId — the session's referee list, oldest first.
export const getReferees = createAsyncThunk<
  RefereeEntry[],
  string,
  AsyncThunkConfig
>("referees/getReferees", async (sessionId, thunkApi) => {
  return apiCall(axiosInstance.get(`/i-one/referees/${sessionId}`), thunkApi);
});

// POST /referees/:sessionId/invite — captain invites an i-One user (own phone).
export const inviteReferee = createAsyncThunk<
  RefereeEntry,
  { sessionId: string; userId: string },
  AsyncThunkConfig
>("referees/inviteReferee", async ({ sessionId, userId }, thunkApi) => {
  return apiCall(
    axiosInstance.post(`/i-one/referees/${sessionId}/invite`, { userId }),
    thunkApi,
  );
});

// POST /referees/:refereeId/accept — the invited user accepts.
export const acceptRefereeInvite = createAsyncThunk<
  RefereeEntry,
  string,
  AsyncThunkConfig
>("referees/acceptRefereeInvite", async (refereeId, thunkApi) => {
  return apiCall(
    axiosInstance.post(`/i-one/referees/${refereeId}/accept`),
    thunkApi,
  );
});

// POST /referees/:refereeId/decline — the invited user declines.
export const declineRefereeInvite = createAsyncThunk<
  RefereeEntry,
  string,
  AsyncThunkConfig
>("referees/declineRefereeInvite", async (refereeId, thunkApi) => {
  return apiCall(
    axiosInstance.post(`/i-one/referees/${refereeId}/decline`),
    thunkApi,
  );
});

// POST /referees/:sessionId/device — Referee mode on the captain's phone.
export const startRefereeMode = createAsyncThunk<
  RefereeEntry,
  { sessionId: string; guestName: string; guestPhone: string },
  AsyncThunkConfig
>(
  "referees/startRefereeMode",
  async ({ sessionId, guestName, guestPhone }, thunkApi) => {
    return apiCall(
      axiosInstance.post(`/i-one/referees/${sessionId}/device`, {
        guestName,
        guestPhone,
      }),
      thunkApi,
    );
  },
);

// GET /referees/history/:userId — "refereed 4 sessions" on the picker.
export const getRefereeHistory = createAsyncThunk<
  RefereeHistory,
  string,
  AsyncThunkConfig
>("referees/getRefereeHistory", async (userId, thunkApi) => {
  return apiCall(
    axiosInstance.get(`/i-one/referees/history/${userId}`),
    thunkApi,
  );
});
