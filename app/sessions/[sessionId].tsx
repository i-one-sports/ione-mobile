import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useAppSelector } from "@/redux/store";
import { setPendingSession } from "@/utils/pendingDeepLink";

/**
 * Catches deep links shaped like:
 *   https://link.i-one-sports.com/sessions/{sessionId}
 *
 * Expo Router maps the URL path to this file-based route.
 *
 * - Authenticated: redirect straight to /joinsession
 * - Unauthenticated: store the session ID as pending and redirect to sign-in.
 *   The auth effect in _layout.tsx will consume it after login.
 */
export default function SessionRedirect() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { isAuthenticated, isRegistered } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) {
    if (sessionId) setPendingSession(sessionId);
    return <Redirect href="/(onboarding)/signin" />;
  }

  return (
    <Redirect href={{ pathname: "/joinsession", params: { sessionId } }} />
  );
}
