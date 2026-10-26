import { logOut } from "@/api/authThunks";
import {
  getMyBadges,
  getUserBadges,
  markBadgeSeen,
  shareBadge,
} from "@/api/badgesThunk";
import { Badge } from "@/components/typings/badge";
import { createSlice, isAnyOf } from "@reduxjs/toolkit";

interface State {
  /** Your own badges, private ones included. */
  myBadges: Badge[];
  /** Other players' shared badges, by userId. */
  userBadges: Record<string, Badge[]>;
  loadingBadges: boolean;
  errorBadges: string | null;
  loadingBadgeAction: boolean;
}

const initialState: State = {
  myBadges: [],
  userBadges: {},
  loadingBadges: false,
  errorBadges: null,
  loadingBadgeAction: false,
};

export const badgesSlice = createSlice({
  name: "badges",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(logOut.fulfilled, () => initialState);

    builder.addCase(getMyBadges.pending, (state) => {
      state.loadingBadges = true;
      state.errorBadges = null;
    });
    builder.addCase(getMyBadges.fulfilled, (state, { payload }) => {
      state.loadingBadges = false;
      state.myBadges = payload;
    });
    builder.addCase(getMyBadges.rejected, (state, action) => {
      state.loadingBadges = false;
      state.errorBadges = action.payload?.msg ?? "Failed to fetch badges";
    });

    builder.addCase(getUserBadges.fulfilled, (state, { payload, meta }) => {
      state.userBadges[meta.arg] = payload;
    });

    // Seen / share answer with the updated badge.
    builder.addMatcher(
      isAnyOf(markBadgeSeen.pending, shareBadge.pending),
      (state) => {
        state.loadingBadgeAction = true;
      },
    );
    builder.addMatcher(
      isAnyOf(markBadgeSeen.fulfilled, shareBadge.fulfilled),
      (state, { payload }: { payload: Badge }) => {
        state.loadingBadgeAction = false;
        state.myBadges = state.myBadges.map((b) =>
          b._id === payload._id ? { ...b, ...payload } : b,
        );
      },
    );
    builder.addMatcher(
      isAnyOf(markBadgeSeen.rejected, shareBadge.rejected),
      (state) => {
        state.loadingBadgeAction = false;
      },
    );
  },
});

export default badgesSlice.reducer;
