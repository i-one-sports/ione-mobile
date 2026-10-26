import { AsyncThunkConfig } from "@/components/typings/api";
import { Badge } from "@/components/typings/badge";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";

// GET /badges/me — all of your badges, private ones included, newest first.
export const getMyBadges = createAsyncThunk<Badge[], void, AsyncThunkConfig>(
  "badges/getMyBadges",
  async (_, thunkApi) => {
    return apiCall(axiosInstance.get("/i-one/badges/me"), thunkApi);
  },
);

// GET /badges/user/:userId — another player's shared badges.
export const getUserBadges = createAsyncThunk<
  Badge[],
  string,
  AsyncThunkConfig
>("badges/getUserBadges", async (userId, thunkApi) => {
  return apiCall(axiosInstance.get(`/i-one/badges/user/${userId}`), thunkApi);
});

// POST /badges/:badgeId/seen — the unlock pop-up was shown.
export const markBadgeSeen = createAsyncThunk<Badge, string, AsyncThunkConfig>(
  "badges/markBadgeSeen",
  async (badgeId, thunkApi) => {
    return apiCall(
      axiosInstance.post(`/i-one/badges/${badgeId}/seen`),
      thunkApi,
    );
  },
);

// PATCH /badges/:badgeId/share — "Share am": show on, or hide from, your profile.
export const shareBadge = createAsyncThunk<
  Badge,
  { badgeId: string; shared: boolean },
  AsyncThunkConfig
>("badges/shareBadge", async ({ badgeId, shared }, thunkApi) => {
  return apiCall(
    axiosInstance.patch(`/i-one/badges/${badgeId}/share`, { shared }),
    thunkApi,
  );
});
