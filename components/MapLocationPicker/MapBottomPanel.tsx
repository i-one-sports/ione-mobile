import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MapBottomPanelProps {
  previewAddress: string | null;
  geocoding: boolean;
  locating: boolean;
  onLocate: () => void;
  onConfirm: () => void;
}

export default function MapBottomPanel({
  previewAddress,
  geocoding,
  locating,
  onLocate,
  onConfirm,
}: MapBottomPanelProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding =
    Platform.OS === "ios"
      ? Math.max(insets.bottom, 24)
      : Math.max(insets.bottom, 16) + 8;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: bottomPadding,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 12,
        gap: 12,
      }}
    >
      {/* Reverse-geocoded address */}
      <View
        style={{
          backgroundColor: "#F9FAFB",
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          minHeight: 40,
        }}
      >
        <Ionicons name="location-outline" size={14} color="#00cc77" />
        {geocoding ? (
          <ActivityIndicator size="small" color="#00cc77" />
        ) : (
          <ThemedText
            lightColor="#444"
            darkColor="#444"
            style={{ fontSize: 12, flex: 1 }}
            numberOfLines={2}
          >
            {previewAddress ?? "Move the map to see the address"}
          </ThemedText>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {/* Jump to GPS location */}
        <TouchableOpacity
          onPress={onLocate}
          disabled={locating}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: "#00FF94",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
          }}
        >
          {locating ? (
            <ActivityIndicator size="small" color="#00FF94" />
          ) : (
            <Ionicons name="locate" size={20} color="#00cc77" />
          )}
        </TouchableOpacity>

        {/* Confirm selection */}
        <TouchableOpacity
          onPress={onConfirm}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 8,
            backgroundColor: "#00FF94",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ThemedText
            lightColor="#000"
            darkColor="#000"
            style={{ fontSize: 15, fontWeight: "700" }}
          >
            Confirm Location
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
