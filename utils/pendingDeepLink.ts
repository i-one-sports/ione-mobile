/**
 * Module-level store for a pending deep-link session ID.
 *
 * Why not Redux?
 * The deep-link arrives before the Redux Provider has settled and before
 * authentication has completed. Storing it here keeps it outside the
 * render cycle entirely, so it can be written from Linking callbacks and
 * read after auth navigation has finished — no race with PersistGate.
 *
 * Why not a ref?
 * A ref lives inside a component; this value must be readable from both
 * _layout.tsx (which writes it) and any consumer that calls consumePendingSession
 * after login.
 */

let _pendingSessionId: string | null = null;

/** Store a session ID to be consumed once the user is authenticated. */
export function setPendingSession(sessionId: string): void {
  _pendingSessionId = sessionId;
}

/**
 * Read and clear the pending session ID.
 * Returns null if there is no pending session, or if it has already been consumed.
 */
export function consumePendingSession(): string | null {
  const id = _pendingSessionId;
  _pendingSessionId = null;
  return id;
}

/** Peek without consuming — use sparingly. */
export function getPendingSession(): string | null {
  return _pendingSessionId;
}
