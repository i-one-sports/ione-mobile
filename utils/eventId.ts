/**
 * A random id for one recording tap (goal / undo), 32 hex characters.
 * The API accepts 8–64 characters and ignores a repeated eventId, so a retry
 * of the same tap never counts twice.
 */
export const newEventId = () =>
  Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
