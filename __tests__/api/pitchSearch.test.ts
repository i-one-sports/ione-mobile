import {
  fetchPitchesInArea,
  isCoordinates,
  searchPitchArea,
} from "@/api/pitchSearch";
import axiosInstance from "@/api/axios";

jest.mock("@/api/axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const originalFetch = global.fetch;
const originalToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const mockFetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch;
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN = "pk.test";
});
afterAll(() => {
  global.fetch = originalFetch;
  if (originalToken === undefined) delete process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  else process.env.EXPO_PUBLIC_MAPBOX_TOKEN = originalToken;
});

it("passes longitude/latitude correctly to the nearby endpoint and preserves backend IDs", async () => {
  jest.mocked(axiosInstance.get).mockResolvedValue({
    data: [
      {
        _id: "pitch-1",
        name: "Lekki Pitch",
        address: "Lekki",
        location: { coordinates: [3.47, 6.44] },
      },
      {
        _id: "pitch-2",
        name: "Booked pitch",
        booked: true,
        location: { coordinates: [999, 999] },
      },
    ],
  });
  const signal = new AbortController().signal;
  const results = await fetchPitchesInArea([3.47, 6.44], signal);
  expect(axiosInstance.get).toHaveBeenCalledWith("/i-one/location/nearby", {
    params: { lat: 6.44, lng: 3.47 },
    signal,
  });
  expect(results[0]).toMatchObject({
    id: "pitch-1",
    coordinates: [3.47, 6.44],
  });
  expect(results[1]).toMatchObject({
    id: "pitch-2",
    booked: true,
    coordinates: undefined,
  });
});

it("distinguishes a malformed backend response from an empty area", async () => {
  jest
    .mocked(axiosInstance.get)
    .mockResolvedValue({ data: { message: "unavailable" } });
  await expect(
    fetchPitchesInArea([3, 6], new AbortController().signal),
  ).rejects.toThrow("Could not load pitches");
});

it("encodes area searches and excludes results without usable coordinates", async () => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      features: [
        {
          properties: {
            mapbox_id: "area-1",
            full_address: "Victoria Island, Lagos",
          },
          geometry: { coordinates: [3.42, 6.43] },
        },
        {
          properties: { mapbox_id: "area-2", name: "Invalid" },
          geometry: { coordinates: [NaN, 6] },
        },
      ],
    }),
  });
  const signal = new AbortController().signal;
  expect(await searchPitchArea("Lekki & Ikoyi", [3.4, 6.5], signal)).toEqual([
    { id: "area-1", name: "Victoria Island, Lagos", coordinates: [3.42, 6.43] },
  ]);
  const url = new URL(mockFetch.mock.calls[0][0]);
  expect(url.searchParams.get("q")).toBe("Lekki & Ikoyi");
  expect(url.searchParams.get("proximity")).toBe("3.4,6.5");
  expect(mockFetch.mock.calls[0][1]).toEqual({ signal });
});

it("surfaces Mapbox errors instead of silently showing no matches", async () => {
  mockFetch.mockResolvedValue({ ok: false, status: 401 });
  await expect(
    searchPitchArea("Lekki", [3, 6], new AbortController().signal),
  ).rejects.toThrow("Could not search areas");
});

it("does not send requests without a public token", async () => {
  delete process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  await expect(
    searchPitchArea("Lekki", [3, 6], new AbortController().signal),
  ).rejects.toThrow("unavailable");
  expect(mockFetch).not.toHaveBeenCalled();
});

it("rejects coordinates that cannot be rendered safely", () => {
  for (const value of [
    null,
    [3],
    [3, 6, 7],
    [Infinity, 6],
    [3, 91],
    [181, 6],
    ["3", 6],
  ]) {
    expect(isCoordinates(value)).toBe(false);
  }
  expect(isCoordinates([0, 0])).toBe(true);
});
