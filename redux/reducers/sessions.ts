import { createSlice } from "@reduxjs/toolkit";
import {
  allSessions,
  cancelSession,
  createSets,
  deleteSession,
  endSession,
  getMyCurrentSession,
  getSession,
  getSessionSets,
  getSessionsByLocation,
  joinSession,
  leaveSession,
  nearBy,
  nearByLocation,
  rescheduleSession,
} from "@/api/sessions";
import {
  SessionByIdResponse,
  SessionSet,
} from "@/components/typings/apiResponse";
import { Team } from "@/components/typings";

// export interface MatchSession {
//   _id: string;
//   session: string;
//   teamOne?: Team;
//   teamTwo?: Team;
//   teamOneScore: number;
//   teamTwoScore: number;
//   initials?: string;
//   matchType: string;
//   isStarted: boolean;
//   __v: number;
// }

export interface SessionLocation {
  __v: number;
  _id: string;
  address: string;
  booked: boolean;
  location: unknown;
  name: string;
  pitchPhoto: string;
  updatedAt: string;
}

export interface FixtureSession {
  __v: number;
  _id: string;
  captain: string;
  finished: boolean;
  inProgress: boolean;
  isFull: boolean;
  location: SessionLocation;
  matchType: string;
  maxNumber: number;
  members: string[];
  minsPerSet: number;
  playersPerTeam: number;
  setNumber: number;
  startTime: string;
  stopTime: string;
  timeDuration: number;
  winningDecider: string;
}

export interface FixtureTeam {
  __v: number;
  _id: string;
  name: string;
  players: string[];
  session: string;
}

export interface MatchSession {
  __v: number;
  _id: string;
  isStarted: boolean;
  matchType: string;
  session: FixtureSession;
  teamOne: FixtureTeam;
  teamOneScore: number;
  teamTwo: FixtureTeam;
  teamTwoScore: number;
  updatedAt: string;
}

export interface pitchSessions {
  _id: string;
  name: string;
  address: string;
  booked: boolean;
  pitchPhoto: string;
  tournament: boolean;
}

interface State {
  sessions: MatchSession[];
  pitches: pitchSessions[];
  all: any[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  } | null;

  // Single session (with member paymentStatus fields)
  activeSession: SessionByIdResponse | null;
  loadingActiveSession: boolean;
  errorActiveSession: string | null;

  // Current session the user is in
  myCurrentSession: SessionByIdResponse | null;
  loadingMyCurrentSession: boolean;

  // Location-based sessions
  locationSessions: any[];
  loadingLocationSessions: boolean;

  // Sets state
  sets: SessionSet[];
  loadingSets: boolean;
  errorSets: string | null;
  creatingSet: boolean;
  errorCreatingSets: string | null;

  loadingSessions: boolean;
  loadingPitches: boolean;
  loadingAll: boolean;

  // Join / Leave / End / Delete / Cancel / Reschedule
  loadingJoin: boolean;
  loadingLeave: boolean;
  loadingAction: boolean;

  errorSessions: string | null;
  errorPitches: string | null;
  errorAll: string | null;
  errorJoin: string | null;
  errorLeave: string | null;
}

const initialState: State = {
  sessions: [],
  pitches: [],
  all: [],
  pagination: null,

  activeSession: null,
  loadingActiveSession: false,
  errorActiveSession: null,

  myCurrentSession: null,
  loadingMyCurrentSession: false,

  locationSessions: [],
  loadingLocationSessions: false,

  sets: [],
  loadingSets: false,
  errorSets: null,
  creatingSet: false,
  errorCreatingSets: null,

  loadingSessions: false,
  loadingPitches: false,
  loadingAll: false,

  loadingJoin: false,
  loadingLeave: false,
  loadingAction: false,

  errorSessions: null,
  errorPitches: null,
  errorAll: null,
  errorJoin: null,
  errorLeave: null,
};

export const sessionSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    clearSets: (state) => {
      state.sets = [];
      state.errorSets = null;
    },
    clearActiveSession: (state) => {
      state.activeSession = null;
      state.errorActiveSession = null;
    },
  },
  extraReducers(builder) {
    // Nearby sessions
    builder
      .addCase(nearBy.pending, (state) => {
        state.loadingSessions = true;
        state.errorSessions = null;
      })
      .addCase(nearBy.fulfilled, (state, { payload }) => {
        state.sessions = payload;
        state.loadingSessions = false;
      })
      .addCase(nearBy.rejected, (state, action) => {
        state.loadingSessions = false;
        state.errorSessions =
          action.error.message ?? "Failed to fetch sessions";
      });

    // Nearby pitches
    builder
      .addCase(nearByLocation.pending, (state) => {
        state.loadingPitches = true;
        state.errorPitches = null;
      })
      .addCase(nearByLocation.fulfilled, (state, { payload }) => {
        state.pitches = payload;
        state.loadingPitches = false;
      })
      .addCase(nearByLocation.rejected, (state, action) => {
        state.loadingPitches = false;
        state.errorPitches = action.error.message ?? "Failed to fetch pitches";
      });

    // All sessions
    builder
      .addCase(allSessions.pending, (state) => {
        state.loadingAll = true;
        state.errorAll = null;
      })
      .addCase(allSessions.fulfilled, (state, { payload }) => {
        state.all = payload.sessions;
        state.pagination = payload.pagination;
        state.loadingAll = false;
      })
      .addCase(allSessions.rejected, (state, action) => {
        state.loadingAll = false;
        state.errorAll = action.error.message ?? "Failed to fetch sessions";
      });

    // Get single session
    builder
      .addCase(getSession.pending, (state) => {
        state.loadingActiveSession = true;
        state.errorActiveSession = null;
      })
      .addCase(getSession.fulfilled, (state, { payload }) => {
        state.activeSession = payload;
        state.loadingActiveSession = false;
      })
      .addCase(getSession.rejected, (state, action) => {
        state.loadingActiveSession = false;
        state.errorActiveSession =
          action.error.message ?? "Failed to load session";
      });

    // Get my current session
    builder
      .addCase(getMyCurrentSession.pending, (state) => {
        state.loadingMyCurrentSession = true;
      })
      .addCase(getMyCurrentSession.fulfilled, (state, { payload }) => {
        state.myCurrentSession = payload;
        state.loadingMyCurrentSession = false;
      })
      .addCase(getMyCurrentSession.rejected, (state) => {
        state.loadingMyCurrentSession = false;
      });

    // Get sessions by location
    builder
      .addCase(getSessionsByLocation.pending, (state) => {
        state.loadingLocationSessions = true;
      })
      .addCase(getSessionsByLocation.fulfilled, (state, { payload }) => {
        state.locationSessions = payload;
        state.loadingLocationSessions = false;
      })
      .addCase(getSessionsByLocation.rejected, (state) => {
        state.loadingLocationSessions = false;
      });

    // Join session — response has { message, session }; re-use activeSession
    builder
      .addCase(joinSession.pending, (state) => {
        state.loadingJoin = true;
        state.errorJoin = null;
      })
      .addCase(joinSession.fulfilled, (state, { payload }) => {
        state.loadingJoin = false;
        // Update activeSession with the fresh session from join response
        if (payload?.session) {
          state.activeSession = payload.session as SessionByIdResponse;
        }
        // Patch the matching entry in the all-sessions list so the card refreshes
        if (payload?.session?._id) {
          const idx = state.all.findIndex((s) => s._id === payload.session._id);
          if (idx !== -1)
            state.all[idx] = { ...state.all[idx], ...payload.session };
        }
      })
      .addCase(joinSession.rejected, (state, action) => {
        state.loadingJoin = false;
        state.errorJoin =
          (action.payload as any)?.msg ?? "Failed to join session";
      });

    // Leave session
    builder
      .addCase(leaveSession.pending, (state) => {
        state.loadingLeave = true;
      })
      .addCase(leaveSession.fulfilled, (state, { payload }) => {
        state.loadingLeave = false;
        if (payload?.session)
          state.activeSession = payload.session as SessionByIdResponse;
      })
      .addCase(leaveSession.rejected, (state) => {
        state.loadingLeave = false;
      });

    // End / Delete / Cancel / Reschedule — clear activeSession on success
    builder
      .addCase(endSession.pending, (state) => {
        state.loadingAction = true;
      })
      .addCase(endSession.fulfilled, (state) => {
        state.loadingAction = false;
        state.activeSession = null;
      })
      .addCase(endSession.rejected, (state) => {
        state.loadingAction = false;
      });

    builder
      .addCase(deleteSession.pending, (state) => {
        state.loadingAction = true;
      })
      .addCase(deleteSession.fulfilled, (state) => {
        state.loadingAction = false;
        state.activeSession = null;
      })
      .addCase(deleteSession.rejected, (state) => {
        state.loadingAction = false;
      });

    builder
      .addCase(cancelSession.pending, (state) => {
        state.loadingAction = true;
      })
      .addCase(cancelSession.fulfilled, (state, { payload }) => {
        state.loadingAction = false;
        if (payload?.session) state.activeSession = payload.session;
      })
      .addCase(cancelSession.rejected, (state) => {
        state.loadingAction = false;
      });

    builder
      .addCase(rescheduleSession.pending, (state) => {
        state.loadingAction = true;
      })
      .addCase(rescheduleSession.fulfilled, (state, { payload }) => {
        state.loadingAction = false;
        if (payload?.session) state.activeSession = payload.session;
      })
      .addCase(rescheduleSession.rejected, (state) => {
        state.loadingAction = false;
      });

    // Create Sets
    builder
      .addCase(createSets.pending, (state) => {
        state.creatingSet = true;
        state.errorCreatingSets = null;
      })
      .addCase(createSets.fulfilled, (state, { payload }) => {
        state.creatingSet = false;
        state.sets = payload;
      })
      .addCase(createSets.rejected, (state, action) => {
        state.creatingSet = false;
        state.errorCreatingSets =
          (action.payload as any)?.msg ?? "Failed to create sets";
      });

    // Get Session Sets
    builder
      .addCase(getSessionSets.pending, (state) => {
        state.loadingSets = true;
        state.errorSets = null;
      })
      .addCase(getSessionSets.fulfilled, (state, { payload }) => {
        state.sets = payload;
        state.loadingSets = false;
      })
      .addCase(getSessionSets.rejected, (state, action) => {
        state.loadingSets = false;
        state.errorSets = action.error.message ?? "Failed to fetch sets";
      });
  },
});

export const { clearSets, clearActiveSession } = sessionSlice.actions;
export default sessionSlice.reducer;
