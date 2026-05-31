import { MAPBOX_TOKEN } from "./config";

export interface SearchFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

export async function reverseGeocode(
  lng: number,
  lat: number,
): Promise<string> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const res = await fetch(url);
    const json = await res.json();
    return json.features?.[0]?.place_name ?? "Unknown location";
  } catch {
    return "Unknown location";
  }
}

export async function forwardGeocode(
  query: string,
  proximity: [number, number],
): Promise<SearchFeature[]> {
  try {
    const [lng, lat] = proximity;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&proximity=${lng},${lat}&limit=5`;
    const res = await fetch(url);
    const json = await res.json();
    return json.features ?? [];
  } catch {
    return [];
  }
}
