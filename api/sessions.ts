import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import {
  AsyncThunkConfig,
  sessionPayload,
  StartSessionRequest,
} from "@/components/typings/api";
import {
  AllSessionsResponse,
  SessionByDateResponse,
  SessionByIdResponse,
  SessionSet,
} from "@/components/typings/apiResponse";
import axiosInstance from "./axios";

export const nearBy = createAsyncThunk<any[], sessionPayload, AsyncThunkConfig>(
  "/nearby",
  async (payload, thunkAPI) =>
    apiCall(
      axiosInstance.get("/i-one/sessions/nearby-sessions", { params: payload }),
      thunkAPI,
    ),
);

export const nearByLocation = createAsyncThunk<
  any[],
  sessionPayload,
  AsyncThunkConfig
>("/nearbyLocation", async (payload, thunkAPI) =>
  apiCall(
    axiosInstance.get("/i-one/location/nearby", { params: payload }),
    thunkAPI,
  ),
);

export const allSessions = createAsyncThunk<
  AllSessionsResponse,
  sessionPayload,
  AsyncThunkConfig
>("/all", async (payload, thunkAPI) =>
  apiCall(
    axiosInstance.get("/i-one/sessions/all", { params: payload }),
    thunkAPI,
  ),
);

// GET /sessions/my-current — the calling user's active session (or null)
export const getMyCurrentSession = createAsyncThunk<
  SessionByIdResponse | null,
  void,
  AsyncThunkConfig
>("sessions/myCurrent", async (_, thunkAPI) =>
  apiCall(axiosInstance.get("/i-one/sessions/my-current"), thunkAPI),
);

// GET /sessions/:sessionId — full session with member paymentStatus fields
export const getSession = createAsyncThunk<
  SessionByIdResponse,
  string,
  AsyncThunkConfig
>("sessions/getOne", async (sessionId, thunkAPI) =>
  apiCall(axiosInstance.get(`/i-one/sessions/${sessionId}`), thunkAPI),
);

// GET /sessions/members/:sessionId — member list (nickname only)
export const getSessionMembers = createAsyncThunk<
  any,
  string,
  AsyncThunkConfig
>("sessions/members", async (sessionId, thunkAPI) =>
  apiCall(axiosInstance.get(`/i-one/sessions/members/${sessionId}`), thunkAPI),
);

// GET /sessions/by-location/:locationId?date=YYYY-MM-DD
export const getSessionsByLocation = createAsyncThunk<
  SessionByDateResponse[],
  { locationId: string; date: string },
  AsyncThunkConfig
>("sessions/byLocation", async ({ locationId, date }, thunkAPI) =>
  apiCall(
    axiosInstance.get(`/i-one/sessions/by-location/${locationId}`, {
      params: { date },
    }),
    thunkAPI,
  ),
);

export const startSession = createAsyncThunk<
  any,
  StartSessionRequest,
  AsyncThunkConfig
>("/startSession", async (payload, thunkAPI) =>
  apiCall(axiosInstance.post("/i-one/sessions/start", payload), thunkAPI),
);

export const createSession = createAsyncThunk<
  any,
  { sessionId: string; data: any },
  AsyncThunkConfig
>("/createSession", async ({ sessionId, data }, thunkAPI) =>
  apiCall(
    axiosInstance.post(`/i-one/sessions/create/${sessionId}`, data),
    thunkAPI,
  ),
);

// POST /sessions/join/:sessionId — returns { message, session }
export const joinSession = createAsyncThunk<
  { message: string; session: SessionByIdResponse },
  { sessionId: string },
  AsyncThunkConfig
>("/joinSession", async ({ sessionId }, thunkAPI) =>
  apiCall(axiosInstance.post(`/i-one/sessions/join/${sessionId}`), thunkAPI),
);

// DELETE /sessions/leave/:sessionId — returns { message, session }
export const leaveSession = createAsyncThunk<
  { message: string; session: SessionByIdResponse },
  string,
  AsyncThunkConfig
>("sessions/leave", async (sessionId, thunkAPI) =>
  apiCall(axiosInstance.delete(`/i-one/sessions/leave/${sessionId}`), thunkAPI),
);

// POST /sessions/end/:sessionId
export const endSession = createAsyncThunk<
  { message: string; session: any },
  string,
  AsyncThunkConfig
>("sessions/end", async (sessionId, thunkAPI) =>
  apiCall(axiosInstance.post(`/i-one/sessions/end/${sessionId}`), thunkAPI),
);

// DELETE /sessions/delete/:sessionId
export const deleteSession = createAsyncThunk<
  { message: string },
  string,
  AsyncThunkConfig
>("sessions/delete", async (sessionId, thunkAPI) =>
  apiCall(
    axiosInstance.delete(`/i-one/sessions/delete/${sessionId}`),
    thunkAPI,
  ),
);

// POST /sessions/cancel/:sessionId
export const cancelSession = createAsyncThunk<any, string, AsyncThunkConfig>(
  "sessions/cancel",
  async (sessionId, thunkAPI) =>
    apiCall(
      axiosInstance.post(`/i-one/sessions/cancel/${sessionId}`),
      thunkAPI,
    ),
);

// PATCH /sessions/reschedule/:sessionId
export const rescheduleSession = createAsyncThunk<
  { message: string; session: any },
  { sessionId: string; startTime: string; timeDuration: number },
  AsyncThunkConfig
>(
  "sessions/reschedule",
  async ({ sessionId, startTime, timeDuration }, thunkAPI) =>
    apiCall(
      axiosInstance.patch(`/i-one/sessions/reschedule/${sessionId}`, {
        startTime,
        timeDuration,
      }),
      thunkAPI,
    ),
);

export const createSets = createAsyncThunk<
  any[],
  { sessionId: string },
  AsyncThunkConfig
>("/createSets", async ({ sessionId }, thunkAPI) =>
  apiCall(axiosInstance.post(`/i-one/sets/create/${sessionId}`), thunkAPI),
);

export const getSessionSets = createAsyncThunk<
  SessionSet[],
  { sessionId: string },
  AsyncThunkConfig
>("/getSessionSets", async ({ sessionId }, thunkAPI) =>
  apiCall(axiosInstance.get(`/i-one/sets/${sessionId}`), thunkAPI),
);
