import { castSessionVote, getSessionVote } from "@/api/votesThunk";
import { logOut } from "@/api/authThunks";
import { SessionVote } from "@/components/typings/vote";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  sessionVote: SessionVote | null;
  /** GET /votes returned 404: the session isn't over, or nothing was played. */
  voteNotOpen: boolean;
  loadingSessionVote: boolean;
  errorSessionVote: string | null;
  loadingCastVote: boolean;
  errorCastVote: string | null;
}

const initialState: State = {
  sessionVote: null,
  voteNotOpen: false,
  loadingSessionVote: false,
  errorSessionVote: null,
  loadingCastVote: false,
  errorCastVote: null,
};

export const votesSlice = createSlice({
  name: "votes",
  initialState,
  reducers: {
    clearVoteState: () => initialState,
  },
  extraReducers(builder) {
    builder.addCase(logOut.fulfilled, () => initialState);

    builder.addCase(getSessionVote.pending, (state) => {
      state.loadingSessionVote = true;
      state.errorSessionVote = null;
    });
    builder.addCase(getSessionVote.fulfilled, (state, { payload }) => {
      state.sessionVote = payload;
      state.voteNotOpen = false;
      state.loadingSessionVote = false;
    });
    builder.addCase(getSessionVote.rejected, (state, action) => {
      state.loadingSessionVote = false;
      state.sessionVote = null;
      if (action.payload?.status === 404) {
        state.voteNotOpen = true;
      } else {
        state.errorSessionVote =
          action.payload?.msg ?? "Failed to fetch voting";
      }
    });

    builder.addCase(castSessionVote.pending, (state) => {
      state.loadingCastVote = true;
      state.errorCastVote = null;
    });
    builder.addCase(castSessionVote.fulfilled, (state, { payload }) => {
      state.sessionVote = payload;
      state.loadingCastVote = false;
    });
    builder.addCase(castSessionVote.rejected, (state, action) => {
      state.loadingCastVote = false;
      state.errorCastVote = action.payload?.msg ?? "Failed to cast vote";
    });
  },
});

export const { clearVoteState } = votesSlice.actions;
export default votesSlice.reducer;
