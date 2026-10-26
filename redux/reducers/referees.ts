import { logOut } from "@/api/authThunks";
import {
  acceptRefereeInvite,
  declineRefereeInvite,
  getRefereeHistory,
  getReferees,
  inviteReferee,
  startRefereeMode,
} from "@/api/refereesThunk";
import { RefereeEntry } from "@/components/typings/match";
import { createSlice, isAnyOf } from "@reduxjs/toolkit";

interface State {
  /** The session's referee list (roster), oldest first. */
  roster: RefereeEntry[];
  /** userId → number of sessions refereed. */
  history: Record<string, number>;

  loadingReferees: boolean;
  errorReferees: string | null;
  /** Invite, accept, decline, Referee mode. */
  loadingRefereeAction: boolean;
  errorRefereeAction: string | null;
}

const initialState: State = {
  roster: [],
  history: {},
  loadingReferees: false,
  errorReferees: null,
  loadingRefereeAction: false,
  errorRefereeAction: null,
};

const rosterActions = [
  inviteReferee,
  acceptRefereeInvite,
  declineRefereeInvite,
  startRefereeMode,
] as const;

export const refereesSlice = createSlice({
  name: "referees",
  initialState,
  reducers: {
    clearRefereeState: () => initialState,
  },
  extraReducers(builder) {
    builder.addCase(logOut.fulfilled, () => initialState);

    builder.addCase(getReferees.pending, (state) => {
      state.loadingReferees = true;
      state.errorReferees = null;
    });
    builder.addCase(getReferees.fulfilled, (state, { payload }) => {
      state.loadingReferees = false;
      state.roster = payload;
    });
    builder.addCase(getReferees.rejected, (state, action) => {
      state.loadingReferees = false;
      state.errorReferees = action.payload?.msg ?? "Failed to fetch referees";
    });

    builder.addCase(getRefereeHistory.fulfilled, (state, { payload }) => {
      state.history[payload.userId] = payload.refereedSessions;
    });

    // Invite / accept / decline / Referee mode answer with one roster entry.
    builder.addMatcher(
      isAnyOf(...rosterActions.map((thunk) => thunk.pending)),
      (state) => {
        state.loadingRefereeAction = true;
        state.errorRefereeAction = null;
      },
    );
    builder.addMatcher(
      isAnyOf(...rosterActions.map((thunk) => thunk.fulfilled)),
      (state, { payload }: { payload: RefereeEntry }) => {
        state.loadingRefereeAction = false;
        state.roster = [
          ...state.roster.filter((entry) => entry._id !== payload._id),
          payload,
        ];
      },
    );
    builder.addMatcher(
      isAnyOf(...rosterActions.map((thunk) => thunk.rejected)),
      (state, action: { payload?: { msg?: string } }) => {
        state.loadingRefereeAction = false;
        state.errorRefereeAction =
          action.payload?.msg ?? "Something went wrong";
      },
    );
  },
});

export const { clearRefereeState } = refereesSlice.actions;
export default refereesSlice.reducer;
