import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface MapTriggerRowProps {
  label: string;
  onPress: () => void;
  loading: boolean;
  confirmed: boolean;
  placeName: string | null;
}

export default function MapTriggerRow({
  label,
  onPress,
  loading,
  confirmed,
  placeName,
}: MapTriggerRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={{ marginBottom: 16 }}>
      <ThemedText style={{ fontSize: 16, fontWeight: "500", marginBottom: 8 }}>
        {label}
      </ThemedText>

      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 17,
          borderColor: confirmed ? "#00FF94" : "#DADADA",
          backgroundColor: isDark ? "#000" : "#fff",
          shadowColor: "#737373",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
          gap: 10,
        }}
      >
        <Ionicons
          name="map-outline"
          size={18}
          color={confirmed ? "#00FF94" : isDark ? "#9BA1A6" : "#6C757D"}
        />
        <ThemedText
          lightColor={confirmed ? "#111" : "#6C757D"}
          darkColor={confirmed ? "#fff" : "#9BA1A6"}
          style={{ flex: 1, fontSize: 11 }}
          numberOfLines={1}
        >
          {loading
            ? "Getting your location..."
            : confirmed && placeName
              ? placeName
              : "Tap to pick location on map"}
        </ThemedText>
        {loading ? (
          <ActivityIndicator size="small" color="#00FF94" />
        ) : confirmed ? (
          <Ionicons name="checkmark-circle" size={18} color="#00FF94" />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isDark ? "#555" : "#aaa"}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
