import { getTeamDetails } from "@/api/teamThunks";
import { TeamDetails } from "@/components/typings/apiResponse";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  teamDetails: Record<string, TeamDetails>;
  loadingTeamDetails: boolean;
  errorTeamDetails: string | null;
}

const initialState: State = {
  teamDetails: {},
  loadingTeamDetails: false,
  errorTeamDetails: null,
};

export const teamDetailsSlice = createSlice({
  name: "teamDetails",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getTeamDetails.pending, (state) => {
      state.loadingTeamDetails = true;
      state.errorTeamDetails = null;
    });
    builder.addCase(getTeamDetails.fulfilled, (state, { payload }) => {
      state.teamDetails[payload._id] = payload;
      state.loadingTeamDetails = false;
    });
    builder.addCase(getTeamDetails.rejected, (state, action) => {
      state.loadingTeamDetails = false;
      action.error.message || "Failed to fetch team details";
    });
  },
});

export default teamDetailsSlice.reducer;
