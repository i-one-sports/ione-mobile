import { getTournamentsByLocation } from "@/api/tournamentThunk";
import { TournamentLocationResponse } from "@/components/typings/apiResponse";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  tournamentsByLocation: TournamentLocationResponse | null;

  loadingTournamentsByLocation: boolean;

  errorTournamentsByLocation: string | null;
}

const initialState: State = {
  tournamentsByLocation: null,

  loadingTournamentsByLocation: false,

  errorTournamentsByLocation: null,
};

export const tournamentSlice = createSlice({
  name: "tournament",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getTournamentsByLocation.pending, (state) => {
      state.loadingTournamentsByLocation = true;
      state.errorTournamentsByLocation = null;
    });

    builder.addCase(
      getTournamentsByLocation.fulfilled,
      (state, { payload }) => {
        state.tournamentsByLocation = payload;
        state.loadingTournamentsByLocation = false;
      },
    );

    builder.addCase(getTournamentsByLocation.rejected, (state, action) => {
      state.loadingTournamentsByLocation = false;
      state.errorTournamentsByLocation =
        action.error.message || "Failed to fetch Tournaments";
    });
  },
});

export default tournamentSlice.reducer;
