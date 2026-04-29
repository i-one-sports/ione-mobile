import { getMatchDetails } from "@/api/matchDetailsThunk";
import { MatchDetails } from "@/components/typings/apiResponse";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  matchDetails: Record<string, MatchDetails>;
  loadingMatchDetails: boolean;
  errorMatchDetails: string | null;
}

const initialState: State = {
  matchDetails: {},
  loadingMatchDetails: false,
  errorMatchDetails: null,
};

export const matchDetailsSlice = createSlice({
  name: "matchDetails",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getMatchDetails.pending, (state) => {
      state.loadingMatchDetails = true;
      state.errorMatchDetails = null;
    });
    builder.addCase(getMatchDetails.fulfilled, (state, { payload }) => {
      console.log(payload);
      state.matchDetails[payload._id] = payload;
      state.loadingMatchDetails = false;
    });
    builder.addCase(getMatchDetails.rejected, (state, action) => {
      state.loadingMatchDetails = false;
      state.errorMatchDetails =
        action.error.message || "Failed to fetch match details";
    });
  },
});

export default matchDetailsSlice.reducer;
