import { logOut } from "@/api/authThunks";
import {
  assignReferee,
  confirmMatchResult,
  createMatchup,
  decrementScore,
  disputeMatchResult,
  endMatch,
  getMatch,
  getMatchups,
  incrementScore,
  recordGoal,
  removeReferee,
  startMatch,
} from "@/api/matchesThunk";
import { EndMatchResponse, Match } from "@/components/typings/match";
import { createSlice, isAnyOf } from "@reduxjs/toolkit";

interface State {
  /** Every game of the current session, by sequence. */
  matchups: Match[];
  /** The game being shown or recorded, with populated teams. */
  currentMatch: Match | null;
  /** Latest end result: the finished match plus the next game. */
  lastEnd: EndMatchResponse | null;

  loadingMatchups: boolean;
  errorMatchups: string | null;
  loadingMatch: boolean;
  errorMatch: string | null;
  /** Start, end, goals, undo, referee changes, confirm/dispute. */
  loadingMatchAction: boolean;
  errorMatchAction: string | null;
}

const initialState: State = {
  matchups: [],
  currentMatch: null,
  lastEnd: null,
  loadingMatchups: false,
  errorMatchups: null,
  loadingMatch: false,
  errorMatch: null,
  loadingMatchAction: false,
  errorMatchAction: null,
};

// Replace a game in the list (or add it), keeping sequence order.
const upsert = (list: Match[], match: Match) => {
  const rest = list.filter((m) => m._id !== match._id);
  return [...rest, match].sort((a, b) => a.sequence - b.sequence);
};

// Recording calls that answer with the updated match.
const matchUpdates = [
  recordGoal,
  incrementScore,
  decrementScore,
  assignReferee,
  removeReferee,
  confirmMatchResult,
  disputeMatchResult,
] as const;

const recordingActions = [...matchUpdates, startMatch, endMatch] as const;

export const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    clearMatchState: () => initialState,
    setCurrentMatch: (state, { payload }: { payload: Match | null }) => {
      state.currentMatch = payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(logOut.fulfilled, () => initialState);

    // Matchups
    builder.addCase(createMatchup.pending, (state) => {
      state.loadingMatchups = true;
      state.errorMatchups = null;
    });
    builder.addCase(createMatchup.fulfilled, (state, { payload }) => {
      state.loadingMatchups = false;
      payload.forEach((match) => {
        state.matchups = upsert(state.matchups, match);
      });
    });
    builder.addCase(createMatchup.rejected, (state, action) => {
      state.loadingMatchups = false;
      state.errorMatchups = action.payload?.msg ?? "Failed to create game 1";
    });

    builder.addCase(getMatchups.pending, (state) => {
      state.loadingMatchups = true;
      state.errorMatchups = null;
    });
    builder.addCase(getMatchups.fulfilled, (state, { payload }) => {
      state.loadingMatchups = false;
      state.matchups = [...payload].sort((a, b) => a.sequence - b.sequence);
    });
    builder.addCase(getMatchups.rejected, (state, action) => {
      state.loadingMatchups = false;
      state.errorMatchups = action.payload?.msg ?? "Failed to fetch games";
    });

    // One match, populated
    builder.addCase(getMatch.pending, (state) => {
      state.loadingMatch = true;
      state.errorMatch = null;
    });
    builder.addCase(getMatch.fulfilled, (state, { payload }) => {
      state.loadingMatch = false;
      state.currentMatch = payload;
      state.matchups = upsert(state.matchups, payload);
    });
    builder.addCase(getMatch.rejected, (state, action) => {
      state.loadingMatch = false;
      state.errorMatch = action.payload?.msg ?? "Failed to fetch the match";
    });

    // Start / end answer with a wrapper; the rest with the match itself.
    builder.addCase(startMatch.fulfilled, (state, { payload }) => {
      state.loadingMatchAction = false;
      state.currentMatch = payload.match;
      state.matchups = upsert(state.matchups, payload.match);
    });
    builder.addCase(endMatch.fulfilled, (state, { payload }) => {
      state.loadingMatchAction = false;
      state.lastEnd = payload;
      state.currentMatch = payload.match;
      state.matchups = upsert(state.matchups, payload.match);
      if (payload.next) state.matchups = upsert(state.matchups, payload.next);
    });
    builder.addMatcher(
      isAnyOf(...matchUpdates.map((thunk) => thunk.fulfilled)),
      (state, { payload }: { payload: Match }) => {
        state.loadingMatchAction = false;
        state.currentMatch = payload;
        state.matchups = upsert(state.matchups, payload);
      },
    );

    builder.addMatcher(
      isAnyOf(...recordingActions.map((thunk) => thunk.pending)),
      (state) => {
        state.loadingMatchAction = true;
        state.errorMatchAction = null;
      },
    );
    builder.addMatcher(
      isAnyOf(...recordingActions.map((thunk) => thunk.rejected)),
      (state, action: { payload?: { msg?: string } }) => {
        state.loadingMatchAction = false;
        state.errorMatchAction = action.payload?.msg ?? "Something went wrong";
      },
    );
  },
});

export const { clearMatchState, setCurrentMatch } = matchesSlice.actions;
export default matchesSlice.reducer;
