import axiosInstance from "./axios";

export type Coordinates = [number, number];
export interface SessionPitch {
  id: string;
  name: string;
  address: string;
  coordinates?: Coordinates;
  booked?: boolean;
}
export interface MapArea {
  id: string;
  name: string;
  coordinates: Coordinates;
}

export function isCoordinates(value: unknown): value is Coordinates {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((n) => typeof n === "number" && Number.isFinite(n)) &&
    Math.abs(value[0]) <= 180 &&
    Math.abs(value[1]) <= 90
  );
}

export async function searchPitchArea(
  query: string,
  center: Coordinates,
  signal: AbortSignal,
): Promise<MapArea[]> {
  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  if (!token)
    throw new Error("Map search is unavailable. Please try again later.");
  const params = new URLSearchParams({
    q: query.trim(),
    access_token: token,
    proximity: center.join(","),
    country: "NG",
    limit: "5",
    language: "en",
    types: "address,street,neighborhood,locality,place",
  });
  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?${params}`,
    { signal },
  );
  if (!response.ok)
    throw new Error("Could not search areas. Please try again.");
  const data = await response.json();
  return (data.features ?? []).flatMap((feature: any) => {
    const coordinates = feature.geometry?.coordinates;
    const id = feature.properties?.mapbox_id ?? feature.id;
    const name = feature.properties?.full_address ?? feature.properties?.name;
    return id && name && isCoordinates(coordinates)
      ? [{ id, name, coordinates }]
      : [];
  });
}

export async function fetchPitchesInArea(
  [lng, lat]: Coordinates,
  signal: AbortSignal,
): Promise<SessionPitch[]> {
  const { data } = await axiosInstance.get("/i-one/location/nearby", {
    params: { lat, lng },
    signal,
  });
  if (!Array.isArray(data))
    throw new Error("Could not load pitches. Please try again.");
  return data.flatMap((pitch) => {
    if (!pitch?._id || !pitch.name) return [];
    const coordinates = pitch.location?.coordinates;
    return [
      {
        id: pitch._id,
        name: pitch.name,
        address: pitch.address ?? "",
        booked: pitch.booked === true,
        coordinates: isCoordinates(coordinates) ? coordinates : undefined,
      },
    ];
  });
}
