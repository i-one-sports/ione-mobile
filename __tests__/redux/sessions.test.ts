import sessionReducer, { clearSets } from "@/redux/reducers/sessions";
import { nearBy, nearByLocation, allSessions } from "@/api/sessions";

const initialState = {
  sessions: [],
  pitches: [],
  all: [],
  pagination: null,
  sets: [],
  loadingSets: false,
  errorSets: null,
  creatingSet: false,
  errorCreatingSets: null,
  loadingSessions: false,
  loadingPitches: false,
  loadingAll: false,
  errorSessions: null,
  errorPitches: null,
  errorAll: null,
};

describe("sessions reducer", () => {
  it("returns the initial state", () => {
    expect(sessionReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("clearSets empties the sets array and clears error", () => {
    const withSets = {
      ...initialState,
      sets: [
        {
          _id: "1",
          session: "s1",
          name: "Set A",
          players: [],
          status: "active",
          createdAt: "",
          updatedAt: "",
        },
      ],
      errorSets: "some error",
    };
    const state = sessionReducer(withSets, clearSets());
    expect(state.sets).toEqual([]);
    expect(state.errorSets).toBeNull();
  });

  describe("nearBy", () => {
    it("pending sets loadingSessions and clears error", () => {
      const state = sessionReducer(
        { ...initialState, errorSessions: "prev error" },
        { type: nearBy.pending.type },
      );
      expect(state.loadingSessions).toBe(true);
      expect(state.errorSessions).toBeNull();
    });

    it("fulfilled sets sessions and clears loading", () => {
      const sessions = [
        {
          _id: "m1",
          session: "s1",
          teamOneScore: 0,
          teamTwoScore: 0,
          matchType: "friendly",
          isStarted: false,
          __v: 0,
        },
      ];
      const state = sessionReducer(initialState, {
        type: nearBy.fulfilled.type,
        payload: sessions,
      });
      expect(state.sessions).toEqual(sessions);
      expect(state.loadingSessions).toBe(false);
    });

    it("rejected sets error and clears loading", () => {
      const state = sessionReducer(
        { ...initialState, loadingSessions: true },
        { type: nearBy.rejected.type, error: { message: "Network error" } },
      );
      expect(state.loadingSessions).toBe(false);
      expect(state.errorSessions).toBe("Network error");
    });
  });

  describe("nearByLocation", () => {
    it("fulfilled sets pitches and clears loading", () => {
      const pitches = [
        {
          _id: "p1",
          name: "Main Pitch",
          address: "123 St",
          booked: false,
          pitchPhoto: "",
        },
      ];
      const state = sessionReducer(initialState, {
        type: nearByLocation.fulfilled.type,
        payload: pitches,
      });
      expect(state.pitches).toEqual(pitches);
      expect(state.loadingPitches).toBe(false);
    });
  });

  describe("allSessions", () => {
    it("fulfilled sets all and pagination", () => {
      const payload = {
        sessions: [
          {
            _id: "s1",
            session: "abc",
            teamOneScore: 0,
            teamTwoScore: 0,
            matchType: "friendly",
            isStarted: false,
            __v: 0,
          },
        ],
        pagination: { limit: 10, page: 1, total: 1, totalPages: 1 },
      };
      const state = sessionReducer(initialState, {
        type: allSessions.fulfilled.type,
        payload,
      });
      expect(state.all).toEqual(payload.sessions);
      expect(state.pagination).toEqual(payload.pagination);
      expect(state.loadingAll).toBe(false);
    });

    it("rejected sets errorAll", () => {
      const state = sessionReducer(
        { ...initialState, loadingAll: true },
        { type: allSessions.rejected.type, error: { message: "Failed" } },
      );
      expect(state.loadingAll).toBe(false);
      expect(state.errorAll).toBe("Failed");
    });
  });
});
