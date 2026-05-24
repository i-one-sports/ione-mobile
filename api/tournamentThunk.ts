import { AsyncThunkConfig , CreateTournamentPayload } from "@/components/typings/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";
import {
  TournamentLocationResponse,
  CreateTournamentResponse,
} from "@/components/typings/apiResponse";

interface CreateTournamentArgs {
  locationId: string;
  payload: CreateTournamentPayload;
}

export const getTournamentsByLocation = createAsyncThunk<
  TournamentLocationResponse,
  string,
  AsyncThunkConfig
>("tournaments/getTournaments", async (locationId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/i-one/tournaments/${locationId}`),
    thunkAPI,
  );
});

export const createTournament = createAsyncThunk<
  CreateTournamentResponse,
  CreateTournamentArgs,
  AsyncThunkConfig
>("tournaments/createTournament", async ({ locationId, payload }, thunkAPI) => {
  return apiCall(
    axiosInstance.post(`/i-one/tournaments/create${locationId}`, payload),
    thunkAPI,
  );
});
