import MapboxGL from "@rnmapbox/maps";

export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "";
MapboxGL.setAccessToken(MAPBOX_TOKEN);

export const DEFAULT_CENTER: [number, number] = [3.3792, 6.5244]; // Lagos fallback
export const DEFAULT_ZOOM = 14;
