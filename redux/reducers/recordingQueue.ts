import { logOut } from "@/api/authThunks";
import { TeamKey } from "@/components/typings/match";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// Recording taps saved on the phone before they're sent, so a bad network
// or an app restart never loses a goal. Sent one at a time, in order.
// See "Recording safely on a bad network" in the API docs.

/** GOAL = goal with a scorer, PLUS = goal without one, UNDO = undo last goal. */
export type QueuedTapKind = "GOAL" | "PLUS" | "UNDO";

export interface QueuedTap {
  eventId: string;
  matchId: string;
  kind: QueuedTapKind;
  team: TeamKey;
  playerId?: string;
  assistedBy?: string;
  /** Shown while it sends, e.g. "Goal · Chidi (Team A)". */
  label: string;
  /** The scoreVersion the referee's screen implied when they tapped. */
  expectedScoreVersion: number;
  queuedAt: number;
}

interface State {
  /** Persisted. Oldest first. */
  queue: QueuedTap[];
  /** The tap currently in flight. */
  sendingId: string | null;
  /** The last send failed on the network; it'll be retried. */
  stalled: boolean;
  flushing: boolean;
  /** Why taps were dropped (e.g. 409), for the screen to show once. */
  dropped: string | null;
}

const initialState: State = {
  queue: [],
  sendingId: null,
  stalled: false,
  flushing: false,
  dropped: null,
};

export const recordingQueueSlice = createSlice({
  name: "recordingQueue",
  initialState,
  reducers: {
    addTap: (state, { payload }: PayloadAction<QueuedTap>) => {
      state.queue.push(payload);
    },
    removeTap: (state, { payload }: PayloadAction<string>) => {
      state.queue = state.queue.filter((tap) => tap.eventId !== payload);
    },
    removeTapsForMatch: (state, { payload }: PayloadAction<string>) => {
      state.queue = state.queue.filter((tap) => tap.matchId !== payload);
    },
    setSending: (state, { payload }: PayloadAction<string | null>) => {
      state.sendingId = payload;
    },
    setStalled: (state, { payload }: PayloadAction<boolean>) => {
      state.stalled = payload;
    },
    setFlushing: (state, { payload }: PayloadAction<boolean>) => {
      state.flushing = payload;
    },
    setDropped: (state, { payload }: PayloadAction<string | null>) => {
      state.dropped = payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(logOut.fulfilled, () => initialState);
  },
});

export const {
  addTap,
  removeTap,
  removeTapsForMatch,
  setSending,
  setStalled,
  setFlushing,
  setDropped,
} = recordingQueueSlice.actions;
export default recordingQueueSlice.reducer;
