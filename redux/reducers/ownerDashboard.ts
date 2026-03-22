import {
  getLastMatches,
  getLocation,
  getRevenue,
  getSummary,
  getUpcomingSessions,
  getUsersChart,
  getVisitorsCount,
  updatePitchCondition,
  changePassword,
  getTransactionHistory,
} from "@/api/ownerDashboardThunk";
import {
  DashboardSummary,
  LastMatch,
  LocationResponse,
  RevenueStats,
  UpcomingSession,
  UpdatePitchConditionResponse,
  UsersChart,
  VisitorResponse,
  ChangePasswordResponse,
  Notification,
  TransactionHistoryResponse,
  TransactionGroup,
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
  pitchConditionData: UpdatePitchConditionResponse | null;
  changePasswordData: ChangePasswordResponse | null;
  latestNotification: Notification | null;
  transactionHistory: TransactionGroup[];

  loadingLocation: boolean;
  loadingVisitorCount: boolean;
  loadingSummmary: boolean;
  loadingLastMatches: boolean;
  loadingUpcomingSession: boolean;
  loadingRevenueStats: boolean;
  loadingUsersChart: boolean;
  loadingPitchCondition: boolean;
  loadingChangePassword: boolean;
  loadingTransactionHistory: boolean;

  errorLocation: string | null;
  errorVisitorCount: string | null;
  errorSummary: string | null;
  errorLastMatches: string | null;
  errorUpcomingSessions: string | null;
  errorRevenueStats: string | null;
  errorUsersChart: string | null;
  errorPitchCondition: string | null;
  errorChangePassword: string | null;
  errorTransactionHistory: string | null;
}

const initialState: State = {
  dashboardSummary: null,
  lastMatches: [],
  visitorsCount: null,
  location: null,
  upcomingSessions: [],
  revenueStats: null,
  usersChart: null,
  pitchConditionData: null,
  changePasswordData: null,
  latestNotification: null,
  transactionHistory: [],

  loadingLocation: false,
  loadingVisitorCount: false,
  loadingSummmary: false,
  loadingLastMatches: false,
  loadingUpcomingSession: false,
  loadingRevenueStats: false,
  loadingUsersChart: false,
  loadingPitchCondition: false,
  loadingChangePassword: false,
  loadingTransactionHistory: false,

  errorLocation: null,
  errorVisitorCount: null,
  errorSummary: null,
  errorLastMatches: null,
  errorUpcomingSessions: null,
  errorRevenueStats: null,
  errorUsersChart: null,
  errorPitchCondition: null,
  errorChangePassword: null,
  errorTransactionHistory: null,
};

export const ownerDashboardSlice = createSlice({
  name: "ownerDashboard",
  initialState,
  reducers: {
    setNotification: (state, action: { payload: Notification }) => {
      state.latestNotification = action.payload;
    },
  },
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

    // update pitch condition
    builder.addCase(updatePitchCondition.pending, (state) => {
      state.loadingPitchCondition = true;
      state.errorPitchCondition = null;
    });
    builder.addCase(updatePitchCondition.fulfilled, (state, { payload }) => {
      state.pitchConditionData = payload;
      state.loadingPitchCondition = false;
    });
    builder.addCase(updatePitchCondition.rejected, (state, action) => {
      state.loadingPitchCondition = false;
      state.errorPitchCondition =
        action.error.message || "Failed to update pitch condition";
    });

    // update owner password
    builder.addCase(changePassword.pending, (state) => {
      state.loadingChangePassword = true;
      state.errorChangePassword = null;
    });
    builder.addCase(changePassword.fulfilled, (state, { payload }) => {
      state.changePasswordData = payload;
      state.loadingChangePassword = false;
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.loadingChangePassword = false;
      state.errorChangePassword =
        action.error.message || "Failed to change password";
    });

    // get transaction history
    builder.addCase(getTransactionHistory.pending, (state) => {
      state.loadingTransactionHistory = true;
      state.errorTransactionHistory = null;
    });
    builder.addCase(getTransactionHistory.fulfilled, (state, { payload }) => {
      state.transactionHistory = payload.data;
      state.loadingTransactionHistory = false;
    });
    builder.addCase(getTransactionHistory.rejected, (state, action) => {
      state.loadingTransactionHistory = false;
      state.errorTransactionHistory =
        action.error.message || "Failed to get transaction history";
    });
  },
});

export const { setNotification } = ownerDashboardSlice.actions;
export default ownerDashboardSlice.reducer;
