import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_BROWSE_AREA, locateGuest } from "@/api/guestThunks";

// Signed-out browsing (App Store 5.1.1(v)): where a guest is browsing from.
interface State {
  lat: number;
  lng: number;
  /** null until Home has asked for the phone's location. */
  source: "device" | "default" | null;
  locating: boolean;
}

const initialState: State = {
  ...DEFAULT_BROWSE_AREA,
  source: null,
  locating: false,
};

const guestSlice = createSlice({
  name: "guest",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(locateGuest.pending, (state) => {
        state.locating = true;
      })
      .addCase(locateGuest.fulfilled, (state, { payload }) => {
        state.lat = payload.lat;
        state.lng = payload.lng;
        state.source = payload.source;
        state.locating = false;
      })
      .addCase(locateGuest.rejected, (state) => {
        state.source = "default";
        state.locating = false;
      });
  },
});

export default guestSlice.reducer;
