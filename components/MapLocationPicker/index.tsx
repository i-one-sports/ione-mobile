import { Ionicons } from "@expo/vector-icons";
import MapboxGL, { type MapState } from "@rnmapbox/maps";
import * as Location from "expo-location";
import React, { useRef, useState } from "react";
import {
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../ThemedText";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "./config";
import { forwardGeocode, reverseGeocode, SearchFeature } from "./geocode";
import MapBottomPanel from "./MapBottomPanel";
import MapCenterPin from "./MapCenterPin";
import MapSearchBar from "./MapSearchBar";
import MapTriggerRow from "./MapTriggerRow";

interface MapLocationPickerProps {
  setCoordinates: (coords: [number, number]) => void;
  label?: string;
}

export default function MapLocationPicker({
  setCoordinates,
  label = "Select Location on Map",
}: MapLocationPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [openingMap, setOpeningMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const [placeName, setPlaceName] = useState<string | null>(null);
  const [previewAddress, setPreviewAddress] = useState<string | null>(null);
  const [initialCenter, setInitialCenter] =
    useState<[number, number]>(DEFAULT_CENTER);

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchFeature[]>([]);
  const [searching, setSearching] = useState(false);

  const centerRef = useRef<[number, number]>(DEFAULT_CENTER);
   
  const cameraRef = useRef<any>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get GPS fix before opening modal so Camera renders at the right place on frame 1
  const handleOpenMap = async () => {
    setOpeningMap(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords: [number, number] = [
          loc.coords.longitude,
          loc.coords.latitude,
        ];
        setInitialCenter(coords);
        centerRef.current = coords;
      }
    } catch {
      // GPS unavailable — Lagos default is used
    } finally {
      setOpeningMap(false);
      setModalVisible(true);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setSearchText("");
    setSearchResults([]);
  };

  // Update ref on every pan frame — no network call here
  const handleCameraChanged = (state: MapState) => {
    const [lng, lat] = state.properties.center as [number, number];
    centerRef.current = [lng, lat];
  };

  // Reverse geocode once the map settles
  const handleMapIdle = async (state: MapState) => {
    const [lng, lat] = state.properties.center as [number, number];
    centerRef.current = [lng, lat];
    setGeocoding(true);
    const name = await reverseGeocode(lng, lat);
    setPreviewAddress(name);
    setGeocoding(false);
  };

  // Debounced search as user types
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await forwardGeocode(text, centerRef.current);
      setSearchResults(results);
      setSearching(false);
    }, 400);
  };

  const handleSelectResult = (feature: SearchFeature) => {
    const [lng, lat] = feature.center;
    centerRef.current = [lng, lat];
    setPreviewAddress(feature.place_name);
    setSearchText("");
    setSearchResults([]);
    cameraRef.current?.setCamera({
      centerCoordinate: [lng, lat],
      zoomLevel: 15,
      animationDuration: 600,
    });
  };

  const handleLocate = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords: [number, number] = [
        loc.coords.longitude,
        loc.coords.latitude,
      ];
      centerRef.current = coords;
      cameraRef.current?.setCamera({
        centerCoordinate: coords,
        zoomLevel: 16,
        animationDuration: 800,
      });
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = async () => {
    const coords = centerRef.current;
    setCoordinates(coords);
    const name = previewAddress ?? (await reverseGeocode(coords[0], coords[1]));
    setPlaceName(name);
    setConfirmed(true);
    setModalVisible(false);
    setSearchText("");
    setSearchResults([]);
  };

  return (
    <>
      <MapTriggerRow
        label={label}
        onPress={handleOpenMap}
        loading={openingMap}
        confirmed={confirmed}
        placeName={placeName}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent={Platform.OS === "android"}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />

          <MapboxGL.MapView
            style={{ flex: 1 }}
            styleURL={MapboxGL.StyleURL.Street}
            onCameraChanged={handleCameraChanged}
            onMapIdle={handleMapIdle}
            logoEnabled={false}
            attributionEnabled={false}
          >
            <MapboxGL.Camera
              ref={cameraRef}
              centerCoordinate={initialCenter}
              zoomLevel={DEFAULT_ZOOM}
              animationMode="none"
            />
          </MapboxGL.MapView>

          <MapCenterPin />

          {/* Top overlay: header + search */}
          <SafeAreaView
            style={{ position: "absolute", top: 0, left: 0, right: 0 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingTop:
                  Platform.OS === "android"
                    ? (StatusBar.currentHeight ?? 24) + 8
                    : 8,
                paddingBottom: 12,
                backgroundColor: "rgba(0,0,0,0.6)",
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <ThemedText
                  lightColor="#fff"
                  darkColor="#fff"
                  style={{ fontSize: 15, fontWeight: "700" }}
                >
                  Pick Pitch Location
                </ThemedText>
                <ThemedText
                  lightColor="rgba(255,255,255,0.7)"
                  darkColor="rgba(255,255,255,0.7)"
                  style={{ fontSize: 11 }}
                >
                  Drag the map or search below
                </ThemedText>
              </View>
            </View>

            <MapSearchBar
              value={searchText}
              onChange={handleSearchChange}
              onClear={() => {
                setSearchText("");
                setSearchResults([]);
              }}
              searching={searching}
              results={searchResults}
              onSelectResult={handleSelectResult}
            />
          </SafeAreaView>

          <MapBottomPanel
            previewAddress={previewAddress}
            geocoding={geocoding}
            locating={locating}
            onLocate={handleLocate}
            onConfirm={handleConfirm}
          />
        </View>
      </Modal>
    </>
  );
}
