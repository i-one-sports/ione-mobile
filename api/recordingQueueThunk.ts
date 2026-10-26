import {
  QueuedTap,
  addTap,
  removeTap,
  removeTapsForMatch,
  setDropped,
  setFlushing,
  setSending,
  setStalled,
} from "@/redux/reducers/recordingQueue";
import type { AppDispatch, RootState } from "@/redux/store";
import { newEventId } from "@/utils/eventId";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  decrementScore,
  getMatch,
  incrementScore,
  recordGoal,
} from "./matchesThunk";

type ThunkConfig = { state: RootState; dispatch: AppDispatch };

const RETRY_MS = 5000;

const sendTap = (tap: QueuedTap) => {
  const base = {
    matchId: tap.matchId,
    team: tap.team,
    eventId: tap.eventId,
    expectedScoreVersion: tap.expectedScoreVersion,
  };
  if (tap.kind === "GOAL") {
    return recordGoal({
      ...base,
      playerId: tap.playerId as string,
      assistedBy: tap.assistedBy,
    });
  }
  return tap.kind === "PLUS" ? incrementScore(base) : decrementScore(base);
};

/**
 * Send queued taps one at a time, in order. A tap leaves the queue once the
 * server answers: 200 (applied, or already applied for this eventId), 409
 * (score moved on), or another 4xx. Network/server errors keep it for a retry.
 */
export const flushRecordingQueue = createAsyncThunk<void, void, ThunkConfig>(
  "recordingQueue/flush",
  async (_, { getState, dispatch }) => {
    dispatch(setFlushing(true));
    try {
      for (;;) {
        const tap = getState().recordingQueue.queue[0];
        if (!tap) break;

        dispatch(setSending(tap.eventId));
        const action: any = await dispatch(sendTap(tap));

        if (!action.error) {
          dispatch(removeTap(tap.eventId));
          // Back online after a stall: reload, the stream may have missed updates.
          if (getState().recordingQueue.stalled) {
            dispatch(setStalled(false));
            dispatch(getMatch(tap.matchId));
          }
          continue;
        }

        const status: number | undefined = action.payload?.status;
        if (status === 409) {
          // Every later tap for this match was made against the old score.
          dispatch(removeTapsForMatch(tap.matchId));
          dispatch(
            setDropped(
              "The score changed since you tapped — check the score and tap again.",
            ),
          );
          dispatch(getMatch(tap.matchId));
          continue;
        }
        if (status && status >= 400 && status < 500) {
          dispatch(removeTap(tap.eventId));
          dispatch(
            setDropped(
              `${tap.label} wasn't saved: ${action.payload?.msg ?? "rejected"}`,
            ),
          );
          continue;
        }

        // No response, or a server error: keep the tap and try again shortly.
        dispatch(setStalled(true));
        setTimeout(() => dispatch(flushRecordingQueue()), RETRY_MS);
        break;
      }
    } finally {
      dispatch(setSending(null));
      dispatch(setFlushing(false));
    }
  },
  {
    // Only one flush at a time, so taps stay in order.
    condition: (_, { getState }) => !getState().recordingQueue.flushing,
  },
);

/**
 * Save a tap to the phone, then send. Its expectedScoreVersion is what the
 * screen will show once the taps ahead of it land (each goal/undo is +1).
 */
export const queueTap = createAsyncThunk<
  void,
  Omit<QueuedTap, "eventId" | "expectedScoreVersion" | "queuedAt">,
  ThunkConfig
>("recordingQueue/queueTap", async (tap, { getState, dispatch }) => {
  const { currentMatch } = getState().matches;
  const ahead = getState().recordingQueue.queue.filter(
    (queued) => queued.matchId === tap.matchId,
  ).length;
  const shown =
    currentMatch?._id === tap.matchId ? currentMatch.scoreVersion : 0;

  dispatch(
    addTap({
      ...tap,
      eventId: newEventId(),
      expectedScoreVersion: shown + ahead,
      queuedAt: Date.now(),
    }),
  );
  dispatch(flushRecordingQueue());
});
