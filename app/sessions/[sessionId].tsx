import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Catches deep links shaped like:
 *   https://link.i-one-sports.com/sessions/{sessionId}
 *
 * Expo Router maps the URL path to this file-based route. Everyone goes to
 * /joinsession: signed in gets the full session, guests get the read-only
 * view (joining asks them to sign in).
 */
export default function SessionRedirect() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return (
    <Redirect href={{ pathname: "/joinsession", params: { sessionId } }} />
  );
}
