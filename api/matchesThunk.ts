import { AsyncThunkConfig } from "@/components/typings/api";
import {
  EndMatchResponse,
  Match,
  StartMatchResponse,
  TeamKey,
} from "@/components/typings/match";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import { createSets, getSessionSets } from "./sessions";
import axiosInstance from "./axios";

// Every goal, undo and end sends the scoreVersion the recorder's screen showed
// (409 if the match moved on) and goals/undos send a per-tap eventId, so a
// retry never counts twice. See "Recording safely on a bad network".
interface ScoreChange {
  matchId: string;
  team: TeamKey;
  eventId: string;
  expectedScoreVersion: number;
}

// POST /matches/matchup/:sessionId — creates game 1 (later games come from end).
export const createMatchup = createAsyncThunk<
  Match[],
  string,
  AsyncThunkConfig
>("matches/createMatchup", async (sessionId, thunkApi) => {
  return apiCall(
    axiosInstance.post(`/i-one/matches/matchup/${sessionId}`),
    thunkApi,
  );
});

// GET /matches/matchups/:sessionId — every game so far, by sequence.
// The server answers 404 ("No matchups exist in this session yet") when no
// game has been created, so that's treated as an empty list, not an error.
export const getMatchups = createAsyncThunk<Match[], string, AsyncThunkConfig>(
  "matches/getMatchups",
  async (sessionId, thunkApi) => {
    const request = axiosInstance.get(`/i-one/matches/matchups/${sessionId}`);
    try {
      const { data } = await request;
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) return [];
      return apiCall(request, thunkApi);
    }
  },
);

// GET /matches/details/:matchId — populated teams, goal scorers and events.
export const getMatch = createAsyncThunk<Match, string, AsyncThunkConfig>(
  "matches/getMatch",
  async (matchId, thunkApi) => {
    return apiCall(
      axiosInstance.get(`/i-one/matches/details/${matchId}`),
      thunkApi,
    );
  },
);

// POST /matches/start/:matchId — SCHEDULED → LIVE. Safe to retry.
export const startMatch = createAsyncThunk<
  StartMatchResponse,
  string,
  AsyncThunkConfig
>("matches/startMatch", async (matchId, thunkApi) => {
  return apiCall(
    axiosInstance.post(`/i-one/matches/start/${matchId}`),
    thunkApi,
  );
});

// POST /matches/end/:matchId — records the result and creates the next game.
export const endMatch = createAsyncThunk<
  EndMatchResponse,
  { matchId: string; expectedScoreVersion: number; penaltyWinner?: TeamKey },
  AsyncThunkConfig
>(
  "matches/endMatch",
  async ({ matchId, expectedScoreVersion, penaltyWinner }, thunkApi) => {
    return apiCall(
      axiosInstance.post(`/i-one/matches/end/${matchId}`, {
        expectedScoreVersion,
        ...(penaltyWinner && { penaltyWinner }),
      }),
      thunkApi,
    );
  },
);

// POST /matches/goal-scorer/:matchId — a goal with its scorer (+1 to the
// score). Referee only.
export const recordGoal = createAsyncThunk<
  Match,
  ScoreChange & { playerId: string; assistedBy?: string },
  AsyncThunkConfig
>(
  "matches/recordGoal",
  async (
    { matchId, team, playerId, assistedBy, eventId, expectedScoreVersion },
    thunkApi,
  ) => {
    return apiCall(
      axiosInstance.post(`/i-one/matches/goal-scorer/${matchId}`, {
        playerId,
        team,
        ...(assistedBy && { assistedBy }),
        eventId,
        expectedScoreVersion,
      }),
      thunkApi,
    );
  },
);

// PUT /matches/increment-score/:matchId?team= — a goal without a scorer.
export const incrementScore = createAsyncThunk<
  Match,
  ScoreChange,
  AsyncThunkConfig
>(
  "matches/incrementScore",
  async ({ matchId, team, eventId, expectedScoreVersion }, thunkApi) => {
    return apiCall(
      axiosInstance.put(
        `/i-one/matches/increment-score/${matchId}`,
        { eventId, expectedScoreVersion },
        { params: { team } },
      ),
      thunkApi,
    );
  },
);

// PUT /matches/decrement-score/:matchId?team= — undo that team's last goal.
export const decrementScore = createAsyncThunk<
  Match,
  ScoreChange,
  AsyncThunkConfig
>(
  "matches/decrementScore",
  async ({ matchId, team, eventId, expectedScoreVersion }, thunkApi) => {
    return apiCall(
      axiosInstance.put(
        `/i-one/matches/decrement-score/${matchId}`,
        { eventId, expectedScoreVersion },
        { params: { team } },
      ),
      thunkApi,
    );
  },
);

// PUT /matches/:matchId/referee — assign before kick-off, or hand off.
export const assignReferee = createAsyncThunk<
  Match,
  { matchId: string; refereeId: string },
  AsyncThunkConfig
>("matches/assignReferee", async ({ matchId, refereeId }, thunkApi) => {
  return apiCall(
    axiosInstance.put(`/i-one/matches/${matchId}/referee`, { refereeId }),
    thunkApi,
  );
});

// DELETE /matches/:matchId/referee — the match carries on unofficiated.
export const removeReferee = createAsyncThunk<Match, string, AsyncThunkConfig>(
  "matches/removeReferee",
  async (matchId, thunkApi) => {
    return apiCall(
      axiosInstance.delete(`/i-one/matches/${matchId}/referee`),
      thunkApi,
    );
  },
);

// POST /matches/:matchId/confirm and /dispute — review a Referee-mode result.
export const confirmMatchResult = createAsyncThunk<
  Match,
  string,
  AsyncThunkConfig
>("matches/confirmMatchResult", async (matchId, thunkApi) => {
  return apiCall(
    axiosInstance.post(`/i-one/matches/${matchId}/confirm`),
    thunkApi,
  );
});

export const disputeMatchResult = createAsyncThunk<
  Match,
  string,
  AsyncThunkConfig
>("matches/disputeMatchResult", async (matchId, thunkApi) => {
  return apiCall(
    axiosInstance.post(`/i-one/matches/${matchId}/dispute`),
    thunkApi,
  );
});

/**
 * Make sure the session has teams and a game 1, creating what's missing.
 * Teams are normally created when every member's payment confirms, which
 * never happens when nobody had to pay (free, or monthly members already
 * covered), so POST /sets/create is the documented, retry-safe fallback.
 * Resolves with the session's games; rejects with the server's message.
 */
export const ensureFirstGame = createAsyncThunk<
  Match[],
  string,
  AsyncThunkConfig
>("matches/ensureFirstGame", async (sessionId, thunkApi) => {
  const { dispatch, rejectWithValue } = thunkApi;
  try {
    const sets = await dispatch(getSessionSets({ sessionId })).unwrap();
    if (sets.length === 0) {
      // 400 here can mean the teams were just created by someone else.
      await dispatch(createSets({ sessionId }))
        .unwrap()
        .catch((err: any) => {
          if (err?.status !== 400) throw err;
        });
      await dispatch(getSessionSets({ sessionId }));
    }
    const games = await dispatch(getMatchups(sessionId)).unwrap();
    if (games.length > 0) return games;
    try {
      return await dispatch(createMatchup(sessionId)).unwrap();
    } catch (err: any) {
      // "teams already matched": another phone created game 1 first.
      const latest = await dispatch(getMatchups(sessionId)).unwrap();
      if (latest.length > 0) return latest;
      throw err;
    }
  } catch (err: any) {
    return rejectWithValue({
      msg: err?.msg ?? "Couldn't create Set 1",
      status: err?.status ?? 500,
    });
  }
});
