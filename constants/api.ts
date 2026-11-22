// Single source of truth for the backend URL. EXPO_PUBLIC_API_URL is inlined at
// build time; the fallback guarantees a build never ships without a base URL.
const DEFAULT_API_URL = "https://api.i-one-sports.com/i-one/";

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "") +
  "/";

/** Full URL for a path under the API base, e.g. apiUrl("sessions/1/stream"). */
export const apiUrl = (path: string) => API_BASE_URL + path.replace(/^\/+/, "");
