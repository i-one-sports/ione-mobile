import {
  getLastMatches,
  getLocation,
  getSummary,
  getUpcomingSessions,
  getVisitorsCount,
} from "@/api/ownerDashboardThunk";
import {
  DashboardSummary,
  LocationResponse,
  VisitorResponse,
  LastMatch,
  UpcomingSession,
} from "@/components/typings/apiResponse";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  dashboardSummary: DashboardSummary | null;
  location: LocationResponse | null;
  visitorsCount: VisitorResponse | null;
  lastMatches: LastMatch[];
  upcomingSessions: VisitorResponse | null;

  loadingLocation: boolean;
  loadingVisitorCount: boolean;
  loadingSummmary: boolean;
  loadingLastMatches: boolean;
  loadingUpcomingSession: boolean;

  errorLocation: string | null;
  errorVisitorCount: string | null;
  errorSummary: string | null;
  errorLastMatches: string | null;
  errorUpcomingSessions: string | null;
}

const initialState: State = {
  dashboardSummary: null,
  lastMatches: [],
  visitorsCount: null,
  location: null,
  upcomingSessions: null,

  loadingLocation: false,
  loadingVisitorCount: false,
  loadingSummmary: false,
  loadingLastMatches: false,
  loadingUpcomingSession: false,

  errorLocation: null,
  errorVisitorCount: null,
  errorSummary: null,
  errorLastMatches: null,
  errorUpcomingSessions: null,
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
    });

    // get dashboard summary
    builder.addCase(getSummary.pending, (state) => {
      state.loadingSummmary = true;
      state.errorSummary = null;
    });
    builder.addCase(getSummary.fulfilled, (state, { payload }) => {
      state.dashboardSummary = payload;
      state.loadingSummmary = false;
    });
    builder.addCase(getSummary.rejected, (state, action) => {
      state.loadingSummmary = false;
      state.errorSummary =
        action.error.message || "Failed to fetch dashboard summary";
    });

    // last matches
    builder.addCase(getLastMatches.pending, (state) => {
      state.loadingLastMatches = true;
      state.errorLastMatches = null;
    });
    builder.addCase(getLastMatches.fulfilled, (state, { payload }) => {
      state.lastMatches = payload;
      state.loadingLastMatches = false;
    });
    builder.addCase(getLastMatches.rejected, (state, action) => {
      state.loadingLastMatches = false;
      state.errorLastMatches =
        action.error.message || "Failed to fetch last matches";
    });

    // visitors count
    builder.addCase(getVisitorsCount.pending, (state) => {
      state.loadingVisitorCount = true;
      state.errorVisitorCount = null;
    });
    builder.addCase(getVisitorsCount.fulfilled, (state, { payload }) => {
      state.visitorsCount = payload;
      state.loadingVisitorCount = false;
    });
    builder.addCase(getVisitorsCount.rejected, (state, action) => {
      state.loadingVisitorCount = false;
      state.errorVisitorCount =
        action.error.message || "Failed to fetch visitors count";
    });

    // upcoming sessions
    builder.addCase(getUpcomingSessions.pending, (state) => {
      state.loadingUpcomingSession = true;
      state.errorUpcomingSessions = null;
    });
    builder.addCase(getUpcomingSessions.fulfilled, (state, { payload }) => {
      state.upcomingSessions = payload;
      state.loadingUpcomingSession = false;
    });
    builder.addCase(getUpcomingSessions.rejected, (state, action) => {
      state.loadingUpcomingSession = false;
      state.errorUpcomingSessions =
        action.error.message || "Failed to fetch visitors count";
    });
  },
});

export default ownerDashboardSlice.reducer;
