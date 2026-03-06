import {
  getLastMatches,
  getLocation,
  getSummary,
  getUpcomingSessions,
  getUsersChart,
  getVisitorsCount,
  getRevenue,
} from "@/api/ownerDashboardThunk";
import {
  DashboardSummary,
  LastMatch,
  LocationResponse,
  UpcomingSession,
  UsersChart,
  VisitorResponse,
  RevenueStats,
} from "@/components/typings/apiResponse";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  dashboardSummary: DashboardSummary | null;
  location: LocationResponse | null;
  visitorsCount: VisitorResponse | null;
  lastMatches: LastMatch[];
  upcomingSessions: UpcomingSession[];
  revenueStats: RevenueStats | null;
  usersChart: UsersChart | null;

  loadingLocation: boolean;
  loadingVisitorCount: boolean;
  loadingSummmary: boolean;
  loadingLastMatches: boolean;
  loadingUpcomingSession: boolean;
  loadingRevenueStats: boolean;
  loadingUsersChart: boolean;

  errorLocation: string | null;
  errorVisitorCount: string | null;
  errorSummary: string | null;
  errorLastMatches: string | null;
  errorUpcomingSessions: string | null;
  errorRevenueStats: string | null;
  errorUsersChart: string | null;
}

const initialState: State = {
  dashboardSummary: null,
  lastMatches: [],
  visitorsCount: null,
  location: null,
  upcomingSessions: [],
  revenueStats: null,
  usersChart: null,

  loadingLocation: false,
  loadingVisitorCount: false,
  loadingSummmary: false,
  loadingLastMatches: false,
  loadingUpcomingSession: false,
  loadingRevenueStats: false,
  loadingUsersChart: false,

  errorLocation: null,
  errorVisitorCount: null,
  errorSummary: null,
  errorLastMatches: null,
  errorUpcomingSessions: null,
  errorRevenueStats: null,
  errorUsersChart: null,
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
        action.error.message || "Failed to fetch upcoming session";
    });

    // revenue stats
    builder.addCase(getRevenue.pending, (state) => {
      state.loadingRevenueStats = true;
      state.errorRevenueStats = null;
    });
    builder.addCase(getRevenue.fulfilled, (state, { payload }) => {
      state.revenueStats = payload;
      state.loadingRevenueStats = false;
    });
    builder.addCase(getRevenue.rejected, (state, action) => {
      state.loadingRevenueStats = false;
      state.errorRevenueStats =
        action.error.message || "Failed to fetch users chart";
    });

    // users chart
    builder.addCase(getUsersChart.pending, (state) => {
      state.loadingUsersChart = true;
      state.errorUsersChart = null;
    });
    builder.addCase(getUsersChart.fulfilled, (state, { payload }) => {
      state.usersChart = payload;
      state.loadingUsersChart = false;
    });
    builder.addCase(getUsersChart.rejected, (state, action) => {
      state.loadingUsersChart = false;
      state.errorUsersChart =
        action.error.message || "Failed to fetch users chart";
    });
  },
});

export default ownerDashboardSlice.reducer;
