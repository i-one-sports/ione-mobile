/** [lng, lat] in degrees, the order GeoJSON and Mapbox use. */
export type LngLat = [number, number];

/** Straight-line distance in metres between two points (haversine). */
export function distanceInMetres([lng1, lat1]: LngLat, [lng2, lat2]: LngLat) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 850 m, 4.2 km */
export const formatDistance = (metres: number) =>
  metres < 1000
    ? `${Math.round(metres)} m`
    : `${(metres / 1000).toFixed(1)} km`;
