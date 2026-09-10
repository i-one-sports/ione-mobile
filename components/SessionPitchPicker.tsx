import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapboxGL, { type MapState } from "@rnmapbox/maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import {
  Coordinates,
  fetchPitchesInArea,
  MapArea,
  searchPitchArea,
  SessionPitch,
} from "@/api/pitchSearch";
import { DEFAULT_CENTER, MAPBOX_TOKEN } from "./MapLocationPicker/config";
import MapTriggerRow from "./MapLocationPicker/MapTriggerRow";

export interface SessionPitchPickerProps {
  value: SessionPitch | null;
  onChange: (pitch: SessionPitch) => void;
}

export default function SessionPitchPicker({
  value,
  onChange,
}: SessionPitchPickerProps) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <MapTriggerRow
        label="Pitch"
        loading={false}
        confirmed={!!value}
        placeName={value?.name ?? null}
        onPress={() => setVisible(true)}
      />
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        {visible && (
          <PitchMap
            value={value}
            onChange={(pitch) => {
              onChange(pitch);
              setVisible(false);
            }}
            onClose={() => setVisible(false)}
          />
        )}
      </Modal>
    </>
  );
}

function PitchMap({
  value,
  onChange,
  onClose,
}: SessionPitchPickerProps & { onClose: () => void }) {
  const initialCenter = useRef(value?.coordinates ?? DEFAULT_CENTER).current;
  const center = useRef<Coordinates>(initialCenter);
  const camera = useRef<React.ElementRef<typeof MapboxGL.Camera>>(null);
  const mounted = useRef(true);
  const [areaCenter, setAreaCenter] = useState<Coordinates>(initialCenter);
  const [query, setQuery] = useState("");
  const [areas, setAreas] = useState<MapArea[]>([]);
  const [pitches, setPitches] = useState<SessionPitch[]>([]);
  const [selected, setSelected] = useState<SessionPitch | null>(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [pitchError, setPitchError] = useState("");
  const [mapError, setMapError] = useState("");
  const [gpsError, setGpsError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setPitchError("");
    setPitches([]);
    setSelected(null);
    fetchPitchesInArea(areaCenter, controller.signal)
      .then((results) => {
        if (active) setPitches(results);
      })
      .catch(() => {
        if (active)
          setPitchError(
            "Could not load pitches. Check your connection and retry.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [areaCenter, retry]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setAreas([]);
    setSearchError("");
    if (query.trim().length < 2) {
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      searchPitchArea(query, center.current, controller.signal)
        .then((results) => {
          if (active) setAreas(results);
        })
        .catch((error: Error) => {
          if (active)
            setSearchError(error.message || "Could not search areas.");
        })
        .finally(() => {
          if (active) setSearching(false);
        });
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const moveTo = (coordinates: Coordinates) => {
    center.current = coordinates;
    camera.current?.setCamera({
      centerCoordinate: coordinates,
      zoomLevel: 13,
      animationDuration: 500,
    });
    setAreaCenter([...coordinates]);
    setQuery("");
    Keyboard.dismiss();
  };

  const locate = async () => {
    setLocating(true);
    setGpsError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted")
        throw new Error(
          "Location permission is off. You can still search for an area.",
        );
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (mounted.current)
        moveTo([location.coords.longitude, location.coords.latitude]);
    } catch (error) {
      if (mounted.current)
        setGpsError(
          error instanceof Error
            ? error.message
            : "Could not find your location. Search for an area instead.",
        );
    } finally {
      if (mounted.current) setLocating(false);
    }
  };

  const filteredPitches = pitches.filter((pitch) =>
    `${pitch.name} ${pitch.address}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const choosePitch = (pitch: SessionPitch) => {
    if (pitch.booked) return;
    setSelected(pitch);
    Keyboard.dismiss();
    if (pitch.coordinates)
      camera.current?.setCamera({
        centerCoordinate: pitch.coordinates,
        zoomLevel: 15,
        animationDuration: 400,
      });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close pitch search"
          onPress={onClose}
          hitSlop={12}
        >
          <Ionicons name="close" size={24} color="#111" />
        </Pressable>
        <Text style={styles.title}>Find a pitch</Text>
      </View>
      <View style={styles.search}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          accessibilityLabel="Search pitches or areas"
          placeholder="Search pitch name or area"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setSelected(null);
          }}
          style={styles.input}
          autoCorrect={false}
          maxLength={200}
        />
        {searching && <ActivityIndicator color="#0C4D2E" />}
        {!!query && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => {
              setQuery("");
              setSelected(null);
            }}
            hitSlop={10}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </Pressable>
        )}
      </View>
      {!!searchError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {searchError}
        </Text>
      )}
      {areas.length > 0 && (
        <View style={styles.areas}>
          <Text style={styles.caption}>Search around an area</Text>
          {areas.slice(0, 3).map((area) => (
            <Pressable
              accessibilityRole="button"
              key={area.id}
              onPress={() => moveTo(area.coordinates)}
              style={styles.areaRow}
            >
              <Ionicons name="location-outline" color="#0C4D2E" size={18} />
              <Text numberOfLines={1} style={styles.areaName}>
                {area.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <View style={styles.mapContainer}>
        {MAPBOX_TOKEN ? (
          <MapboxGL.MapView
            style={styles.map}
            styleURL={MapboxGL.StyleURL.Street}
            onCameraChanged={(state: MapState) => {
              center.current = state.properties.center as Coordinates;
            }}
            onMapLoadingError={() =>
              setMapError(
                "The map could not load. You can still select a pitch below.",
              )
            }
            onDidFinishLoadingMap={() => setMapError("")}
          >
            <MapboxGL.Camera
              ref={camera}
              defaultSettings={{
                centerCoordinate: initialCenter,
                zoomLevel: 12,
              }}
            />
            {filteredPitches
              .filter((pitch) => pitch.coordinates)
              .map((pitch) => (
                <MapboxGL.MarkerView
                  key={pitch.id}
                  coordinate={pitch.coordinates!}
                  isSelected={selected?.id === pitch.id}
                  allowOverlap
                >
                  <Pressable
                    collapsable={false}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${pitch.name}`}
                    accessibilityState={{
                      selected: selected?.id === pitch.id,
                      disabled: pitch.booked,
                    }}
                    disabled={pitch.booked}
                    onPress={() => choosePitch(pitch)}
                    style={[
                      styles.marker,
                      {
                        backgroundColor: pitch.booked
                          ? "#888"
                          : selected?.id === pitch.id
                            ? "#0C4D2E"
                            : "#00aa66",
                      },
                    ]}
                  >
                    <Text style={styles.markerText}>⚽</Text>
                  </Pressable>
                </MapboxGL.MarkerView>
              ))}
          </MapboxGL.MapView>
        ) : (
          <View style={styles.unavailable}>
            <Text>Map search is currently unavailable.</Text>
          </View>
        )}
        <View style={styles.mapActions}>
          <Pressable
            accessibilityRole="button"
            style={styles.mapButton}
            onPress={() => {
              setAreaCenter([...center.current]);
              setQuery("");
            }}
          >
            <Text style={styles.buttonText}>Search this area</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Use my location"
            style={styles.mapButton}
            onPress={locate}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color="#0C4D2E" />
            ) : (
              <Ionicons name="locate" size={22} color="#0C4D2E" />
            )}
          </Pressable>
        </View>
      </View>
      {!!(mapError || gpsError) && (
        <Text style={styles.error}>{gpsError || mapError}</Text>
      )}
      <View style={styles.results}>
        <Text style={styles.title}>Pitches in this area</Text>
        <Text style={styles.caption}>
          Choose a registered i-one pitch for your session.
        </Text>
        {loading ? (
          <ActivityIndicator style={styles.loading} color="#0C4D2E" />
        ) : pitchError ? (
          <View>
            <Text style={styles.error}>{pitchError}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRetry((n) => n + 1)}
              style={styles.mapButton}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredPitches}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(pitch) => pitch.id}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {query.trim()
                  ? "No matching pitches in this area. Search a nearby area or move the map."
                  : "No registered pitches found here. Move the map and tap Search this area."}
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  selected: selected?.id === item.id,
                  disabled: item.booked,
                }}
                disabled={item.booked}
                onPress={() => choosePitch(item)}
                style={[
                  styles.pitch,
                  selected?.id === item.id && styles.selectedPitch,
                ]}
              >
                <View style={styles.pitchText}>
                  <Text style={styles.pitchName}>{item.name}</Text>
                  <Text style={styles.caption}>{item.address}</Text>
                  {item.booked && (
                    <Text style={styles.caption}>Fully booked</Text>
                  )}
                </View>
                <Ionicons
                  name={
                    selected?.id === item.id
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={22}
                  color={item.booked ? "#aaa" : "#0C4D2E"}
                />
              </Pressable>
            )}
          />
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={!selected || loading}
        onPress={() => {
          if (selected && !selected.booked) onChange(selected);
        }}
        style={[styles.confirm, (!selected || loading) && styles.disabled]}
      >
        <Text style={styles.confirmText}>
          {selected ? `Use ${selected.name}` : "Select a pitch to continue"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16 },
  title: { fontSize: 18, fontWeight: "600", color: "#111" },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f3f5f4",
  },
  input: { flex: 1, color: "#111", padding: 0, minHeight: 24 },
  areas: { paddingHorizontal: 16, paddingBottom: 8 },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  areaName: { flex: 1, color: "#222", fontSize: 13 },
  mapContainer: { flex: 1, minHeight: 160 },
  map: { flex: 1 },
  unavailable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef4f0",
  },
  mapActions: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mapButton: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 24,
    alignSelf: "flex-start",
    elevation: 3,
  },
  buttonText: { color: "#0C4D2E", fontWeight: "600" },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: { color: "#fff", fontSize: 20 },
  results: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  caption: { color: "#666", fontSize: 12, marginTop: 4 },
  pitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e1e5e2",
    borderRadius: 12,
  },
  selectedPitch: { borderColor: "#00aa66", backgroundColor: "#edfff5" },
  pitchText: { flex: 1 },
  pitchName: { fontSize: 14, fontWeight: "600", color: "#111" },
  loading: { padding: 24 },
  empty: { paddingVertical: 20, color: "#666", lineHeight: 20 },
  error: {
    color: "#b3261e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
  },
  confirm: {
    backgroundColor: "#0C4D2E",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabled: { opacity: 0.4 },
  confirmText: { color: "#fff", fontWeight: "600" },
});
