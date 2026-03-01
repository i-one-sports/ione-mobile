import {
  getLastMatches,
  getLocation,
  getSummary,
  getVisitorsCount,
} from "@/api/ownerDashboardThunk";
import {
  DashboardSummary,
  LocationResponse,
  VisitorResponse,
} from "@/components/typings/apiResponse";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  dashboardSummary: DashboardSummary | null;
  location: LocationResponse | null;
  visitorsCount: VisitorResponse | null;
  recentData: DashboardSummary | null;

  loadingLocation: boolean;
  loadingVisitorCount: boolean;
  loadingSummmary: boolean;
  loadingLastMatches: boolean;

  errorLocation: string | null;
  errorVisitorCount: string | null;
  errorSummary: string | null;
  errorLastMatches: string | null;
}

const initialState: State = {
  dashboardSummary: null,
  recentData: null,
  visitorsCount: null,
  location: null,

  loadingLocation: false,
  loadingVisitorCount: false,
  loadingSummmary: false,
  loadingLastMatches: false,

  errorLocation: null,
  errorVisitorCount: null,
  errorSummary: null,
  errorLastMatches: null,
};

export const ownerDashboardSlice = createSlice({
  name: "ownerDashboard",
  initialState,
  reducers: {},
  extraReducers(builder) {
    // get location so i can get the location ID
    builder.addCase(getLocation.pending, (state) => {
      state.loadingLocation = true;
      state.errorLocation = null;
    });
    builder.addCase(getLocation.fulfilled, (state, { payload }) => {
      state.location = payload;
      state.loadingLocation = false;
    });
    builder.addCase(getLocation.rejected, (state, action) => {
      state.loadingLocation = false;
      action.error.message || "Failed to fetch user location";
      console.log("location error:", action);
    });

    // get dashboard summary
    builder.addCase(getSummary.pending, (state) => {
      state.loadingSummmary = true;
      state.errorSummary = null;
    });
    builder.addCase(getSummary.fulfilled, (state, { payload }) => {
      state.dashboardSummary = payload;
      console.log("payload:", payload);
      state.loadingSummmary = false;
    });
    builder.addCase(getSummary.rejected, (state, action) => {
      state.loadingSummmary = false;
      state.errorLastMatches =
        action.error.message || "Failed to fetch dashboard summary";
      console.log("dashboard matches error:", action);
    });

    // last matches
    builder.addCase(getLastMatches.pending, (state) => {
      state.loadingLastMatches = true;
      state.errorLastMatches = null;
    });
    builder.addCase(getLastMatches.fulfilled, (state, { payload }) => {
      state.dashboardSummary = payload;
      console.log("payload:", payload);
      state.loadingLastMatches = false;
    });
    builder.addCase(getLastMatches.rejected, (state, action) => {
      state.loadingLastMatches = false;
      console.log("last matches error:", action);
      state.errorLastMatches =
        action.error.message || "Failed to fetch last matches";
    });

    // visitors count
    builder.addCase(getVisitorsCount.pending, (state) => {
      state.loadingLastMatches = true;
      state.errorLastMatches = null;
    });
    builder.addCase(getVisitorsCount.fulfilled, (state, { payload }) => {
      state.visitorsCount = payload;
      console.log("payload:", payload);
      state.loadingLastMatches = false;
    });
    builder.addCase(getVisitorsCount.rejected, (state, action) => {
      state.loadingVisitorCount = false;
      console.log("last matches error:", action);
      state.errorLastMatches =
        action.error.message || "Failed to fetch visitors count";
    });
  },
});

export default ownerDashboardSlice.reducer;
