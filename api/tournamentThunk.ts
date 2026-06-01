import {
  AsyncThunkConfig,
  CreateTournamentPayload,
  CreateTournamentTeamPayload,
} from "@/components/typings/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";
import {
  TournamentLocationResponse,
  CreateTournamentResponse,
  TournamentDetailsResponse,
  StartTournamentResponse,
} from "@/components/typings/apiResponse";

interface CreateTournamentArgs {
  locationId: string;
  payload: CreateTournamentPayload;
}

interface CreateTournamentTeamArgs {
  tournamentId: string;
  payload: CreateTournamentTeamPayload;
}

interface DeleteTournamentTeamArgs {
  tournamentId: string;
  teamId: string;
}

export const getTournamentsByLocation = createAsyncThunk<
  TournamentLocationResponse,
  string,
  AsyncThunkConfig
>("tournaments/getTournaments", async (locationId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/i-one/tournaments/location/${locationId}`),
    thunkAPI,
  );
});

export const getTournamentsDetails = createAsyncThunk<
  TournamentDetailsResponse,
  string,
  AsyncThunkConfig
>("tournaments/getTournamentsDetails", async (tournamentId, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/i-one/tournaments/${tournamentId}`),
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

export const createTeam = createAsyncThunk<
  CreateTournamentResponse,
  CreateTournamentTeamArgs,
  AsyncThunkConfig
>("tournaments/createTeam", async ({ tournamentId, payload }, thunkAPI) => {
  return apiCall(
    axiosInstance.post(`/i-one/tournaments/${tournamentId}/team`, payload),
    thunkAPI,
  );
});

export const deleteTeamFromTournament = createAsyncThunk<
  void,
  DeleteTournamentTeamArgs,
  AsyncThunkConfig
>(
  "tournaments/deleteTeamTournament",
  async ({ tournamentId, teamId }, thunkAPI) => {
    return apiCall(
      axiosInstance.delete(`/i-one/tournaments/${tournamentId}/team/${teamId}`),
      thunkAPI,
    );
  },
);

export const generateTournamentBracket = createAsyncThunk<
  StartTournamentResponse,
  string,
  AsyncThunkConfig
>("tournaments/generateTournamentBracket", async (teamId, thunkAPI) => {
  return apiCall(
    axiosInstance.post(`/i-one/tournaments/${teamId}/start`),
    thunkAPI,
  );
});
