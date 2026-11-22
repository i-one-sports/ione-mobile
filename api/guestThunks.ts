import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Location from "expo-location";

export interface GuestLocation {
  lat: number;
  lng: number;
  /** "device": the phone's location; "default": Lagos (refused or failed). */
  source: "device" | "default";
}

/** Where guests browse when they don't share their location. */
export const DEFAULT_BROWSE_AREA = { lat: 6.5244, lng: 3.3792 }; // Lagos

// Signed-out users have no saved location, so Home asks the phone for one
// (only when they open nearby pitches). Refusing or failing is not an
// error: they browse around Lagos instead.
export const locateGuest = createAsyncThunk<GuestLocation, void>(
  "guest/locate",
  async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted")
        return { ...DEFAULT_BROWSE_AREA, source: "default" };
      const position =
        (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        source: "device",
      };
    } catch {
      return { ...DEFAULT_BROWSE_AREA, source: "default" };
    }
  },
);
