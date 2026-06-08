import { MAPBOX_TOKEN } from "./config";

export interface SearchFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

// Builds a clean, readable address from a Mapbox feature.
// When the result is a raw street address, we surface the neighborhood/estate
// name from context instead — that's the human-readable label the user expects.
// Postcodes (e.g. "Lagos 10") and country are always excluded.
function buildCleanAddress(feature: any): string {
  const context: { id: string; text: string }[] = feature.context ?? [];
  const placeTypes: string[] = feature.place_type ?? [];

  const neighborhood = context.find(
    (c) => c.id.startsWith("neighborhood") || c.id.startsWith("locality"),
  )?.text;
  const city = context.find((c) => c.id.startsWith("place"))?.text;
  const state = context.find((c) => c.id.startsWith("region"))?.text;

  // For street-level results, promote the neighborhood/estate as the headline
  const isAddress = placeTypes.includes("address");
  const primary =
    isAddress && neighborhood ? neighborhood : (feature.text ?? "");

  const parts: string[] = [primary];
  if (!isAddress && neighborhood && neighborhood !== primary)
    parts.push(neighborhood);
  if (city && city !== primary) parts.push(city);
  if (state && state !== city && state !== primary) parts.push(state);

  return parts.join(", ");
}

export async function reverseGeocode(
  lng: number,
  lat: number,
): Promise<string> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const res = await fetch(url);
    const json = await res.json();
    const feature = json.features?.[0];
    return feature ? buildCleanAddress(feature) : "Unknown location";
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
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=NG&proximity=${lng},${lat}&types=poi,address,neighborhood,locality,place&limit=5`;
    const res = await fetch(url);
    const json = await res.json();
    return (json.features ?? []).map((f: any) => ({
      id: f.id,
      place_name: buildCleanAddress(f),
      center: f.center,
    }));
  } catch {
    return [];
  }
}
