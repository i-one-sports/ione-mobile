import { logOut } from "@/api/authThunks";
import { getUserRating, getUserStats } from "@/api/statsThunk";
import { PlayerRating, PlayerStats } from "@/components/typings/stats";
import { createSlice } from "@reduxjs/toolkit";

/** "userId:2026", or "userId:all" for all-time totals. */
export const statsKey = (userId: string, season?: number | null) =>
  `${userId}:${season ?? "all"}`;

interface State {
  stats: Record<string, PlayerStats>;
  ratings: Record<string, PlayerRating>;
  loadingStats: boolean;
  errorStats: string | null;
  loadingRating: boolean;
  errorRating: string | null;
}

const initialState: State = {
  stats: {},
  ratings: {},
  loadingStats: false,
  errorStats: null,
  loadingRating: false,
  errorRating: null,
};

export const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(logOut.fulfilled, () => initialState);

    builder.addCase(getUserStats.pending, (state) => {
      state.loadingStats = true;
      state.errorStats = null;
    });
    builder.addCase(getUserStats.fulfilled, (state, { payload, meta }) => {
      state.loadingStats = false;
      state.stats[statsKey(meta.arg.userId, meta.arg.season)] = payload;
    });
    builder.addCase(getUserStats.rejected, (state, action) => {
      state.loadingStats = false;
      state.errorStats = action.payload?.msg ?? "Failed to fetch stats";
    });

    builder.addCase(getUserRating.pending, (state) => {
      state.loadingRating = true;
      state.errorRating = null;
    });
    builder.addCase(getUserRating.fulfilled, (state, { payload, meta }) => {
      state.loadingRating = false;
      state.ratings[meta.arg] = payload;
    });
    builder.addCase(getUserRating.rejected, (state, action) => {
      state.loadingRating = false;
      state.errorRating = action.payload?.msg ?? "Failed to fetch rating";
    });
  },
});

export default statsSlice.reducer;
