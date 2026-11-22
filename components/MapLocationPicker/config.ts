import MapboxGL from "@rnmapbox/maps";

export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "";
MapboxGL.setAccessToken(MAPBOX_TOKEN);
// No Mapbox usage telemetry: it would have to be declared as data
// collection on the App Store. Every map screen imports this file before
// drawing a map, so this runs before Mapbox does anything.
MapboxGL.setTelemetryEnabled(false);

export const DEFAULT_CENTER: [number, number] = [3.3792, 6.5244]; // Lagos fallback
export const DEFAULT_ZOOM = 14;
