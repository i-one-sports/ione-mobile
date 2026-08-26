import {
  changePassword,
  getLastMatches,
  getLocation,
  getLocationDashboard,
  getRevenue,
  getSummary,
  getUpcomingSessions,
  getUsersChart,
  getVisitorsCount,
  updatePitchCondition,
  updatePricingOptions,
  getSessionByDate,
  getSessionById,
  updateOpenHours,
  getLocationTeamStatus,
  getLocationTransactions,
} from "@/api/ownerDashboardThunk";
import {
  ChangePasswordResponse,
  DashboardSummary,
  LastMatch,
  LocationResponse,
  Notification,
  RevenueStats,
  TransactionGroup,
  UpcomingSession,
  UpdatePitchConditionResponse,
  UpdatePricingOptionsResponse,
  UsersChart,
  VisitorResponse,
  SessionByDateResponse,
  SessionByIdResponse,
  UpdateOpenHoursResponse,
  PaymentDateGroup,
  SessionPaymentDetailsResponse,
  BillingPagination,
} from "@/components/typings/apiResponse";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  dashboardSummary: DashboardSummary | null;
  locationDashboard: DashboardSummary | null;
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
  pricingOptionData: UpdatePricingOptionsResponse | null;
  sessionByDate: SessionByDateResponse[];
  sessionById: SessionByIdResponse | null;
  openingHours: UpdateOpenHoursResponse | null;
  locationTransactions: PaymentDateGroup[];
  locationTeamStatus: SessionPaymentDetailsResponse | null;
  billingPagination: BillingPagination | null;

  loadingLocationDashboard: boolean;
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
  loadingPricingOptionData: boolean;
  loadingSessionByDate: boolean;
  loadingSessionById: boolean;
  loadingOpenHours: boolean;
  loadingLocationTransactions: boolean;
  loadingLocationTeamStatus: boolean;

  errorLocationDashboard: string | null;
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
  errorPricingOptionData: string | null;
  errorSessionByDate: string | null;
  errorSessionById: string | null;
  errorOpeningHours: string | null;
  errorLocationTransactions: string | null;
  errorLocationTeamStatus: string | null;
}

const initialState: State = {
  dashboardSummary: null,
  lastMatches: [],
  visitorsCount: null,
  locationDashboard: null,
  location: null,
  upcomingSessions: [],
  revenueStats: null,
  usersChart: null,
  pitchConditionData: null,
  changePasswordData: null,
  latestNotification: null,
  transactionHistory: [],
  pricingOptionData: null,
  sessionByDate: [],
  sessionById: null,
  openingHours: null,
  locationTransactions: [],
  locationTeamStatus: null,
  billingPagination: null,

  loadingLocationDashboard: false,
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
  loadingPricingOptionData: false,
  loadingSessionByDate: false,
  loadingSessionById: false,
  loadingOpenHours: false,
  loadingLocationTransactions: false,
  loadingLocationTeamStatus: false,

  errorLocationDashboard: null,
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
  errorPricingOptionData: null,
  errorSessionByDate: null,
  errorSessionById: null,
  errorOpeningHours: null,
  errorLocationTransactions: null,
  errorLocationTeamStatus: null,
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
      state.errorLocation =
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

    // get location dashboard
    builder.addCase(getLocationDashboard.pending, (state) => {
      state.loadingLocationDashboard = true;
      state.errorLocationDashboard = null;
    });
    builder.addCase(getLocationDashboard.fulfilled, (state, { payload }) => {
      state.locationDashboard = payload;
      state.loadingLocationDashboard = false;
    });
    builder.addCase(getLocationDashboard.rejected, (state, action) => {
      state.loadingLocationDashboard = false;
      state.errorLocationDashboard =
        action.error.message || "Failed to fetch location dashboard";
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

    // update opening hours
    builder.addCase(updateOpenHours.pending, (state) => {
      state.loadingOpenHours = true;
      state.errorOpeningHours = null;
    });
    builder.addCase(updateOpenHours.fulfilled, (state, { payload }) => {
      state.openingHours = payload;
      state.loadingOpenHours = false;
    });
    builder.addCase(updateOpenHours.rejected, (state, action) => {
      state.loadingOpenHours = false;
      state.errorOpeningHours =
        action.error.message || "Failed to update Opening Hours";
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

    // update pricing options
    builder.addCase(updatePricingOptions.pending, (state) => {
      state.loadingPricingOptionData = true;
      state.errorPricingOptionData = null;
    });
    builder.addCase(updatePricingOptions.fulfilled, (state, { payload }) => {
      state.pricingOptionData = payload;
      state.loadingPricingOptionData = false;
    });
    builder.addCase(updatePricingOptions.rejected, (state, action) => {
      state.loadingPricingOptionData = false;
      state.errorPricingOptionData =
        action.error.message || "Failed to update pricing options";
    });

    // get sessions by date
    builder.addCase(getSessionByDate.pending, (state) => {
      state.loadingSessionByDate = true;
      state.errorSessionByDate = null;
    });
    builder.addCase(getSessionByDate.fulfilled, (state, { payload }) => {
      state.sessionByDate = payload;
      state.loadingSessionByDate = false;
    });
    builder.addCase(getSessionByDate.rejected, (state, action) => {
      state.loadingSessionByDate = false;
      state.errorSessionByDate =
        action.error.message || "Failed to get session by date";
    });

    // get sessions by id
    builder.addCase(getSessionById.pending, (state) => {
      state.loadingSessionById = true;
      state.errorSessionById = null;
    });
    builder.addCase(getSessionById.fulfilled, (state, { payload }) => {
      state.sessionById = payload;
      state.loadingSessionById = false;
    });
    builder.addCase(getSessionById.rejected, (state, action) => {
      state.loadingSessionById = false;
      state.errorSessionById =
        action.error.message || "Failed to get session by id";
    });

    // get location transactions
    builder
      .addCase(getLocationTransactions.pending, (state) => {
        state.loadingLocationTransactions = true;
      })
      .addCase(getLocationTransactions.fulfilled, (state, { payload }) => {
        state.loadingLocationTransactions = false;
        state.locationTransactions = payload.data ?? [];
        state.billingPagination = payload.pagination ?? null;
      })
      .addCase(getLocationTransactions.rejected, (state, action) => {
        state.loadingLocationTransactions = false;
        state.errorLocationTransactions =
          action.error.message || "Failed to get location transactions";
      });

    // get location team status
    builder.addCase(getLocationTeamStatus.pending, (state) => {
      state.loadingLocationTeamStatus = true;
      state.errorLocationTeamStatus = null;
    });
    builder.addCase(getLocationTeamStatus.fulfilled, (state, { payload }) => {
      state.locationTeamStatus = payload;
      state.loadingLocationTeamStatus = false;
    });
    builder.addCase(getLocationTeamStatus.rejected, (state, action) => {
      state.loadingLocationTeamStatus = false;
      state.errorLocationTeamStatus =
        action.error.message || "Failed to get location team status";
    });
  },
});

export const { setNotification } = ownerDashboardSlice.actions;
export default ownerDashboardSlice.reducer;
