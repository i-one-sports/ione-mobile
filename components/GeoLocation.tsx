import React, { useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import * as Location from "expo-location";
import { Toast } from "toastify-react-native";
import { ThemedText } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";

interface GeolocationComponentProps {
  setCoordinates: (coords: [number, number]) => void;
  label?: string;
}

const GeolocationComponent: React.FC<GeolocationComponentProps> = ({
  setCoordinates,
  label = "Detect Location",
}) => {
  const [loading, setLoading] = useState(false);
  const [captured, setCaptured] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const getLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission denied",
          text2: "Please allow location access in your device settings",
        });
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { longitude, latitude } = location.coords;
      setCoordinates([longitude, latitude]);
      setCaptured(true);
      Toast.show({ type: "success", text1: "Location captured" });
    } catch (error: any) {
      let msg = "An unknown error occurred";
      if (error.code === "E_LOCATION_UNAVAILABLE")
        msg = "Location information is unavailable";
      else if (error.code === "E_LOCATION_TIMEOUT") msg = "Request timed out";
      else if (error.message) msg = error.message;
      Toast.show({ type: "error", text1: "Location Error", text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <ThemedText style={{ fontSize: 16, fontWeight: "500", marginBottom: 8 }}>
        {label}
      </ThemedText>
      <TouchableOpacity
        onPress={getLocation}
        disabled={loading}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 17,
          borderColor: captured ? "#00FF94" : "#DADADA",
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
          name="location-outline"
          size={18}
          color={captured ? "#00FF94" : isDark ? "#9BA1A6" : "#6C757D"}
        />
        <ThemedText
          lightColor={captured ? "#111" : "#6C757D"}
          darkColor={captured ? "#fff" : "#9BA1A6"}
          style={{ flex: 1, fontSize: 11 }}
        >
          {loading
            ? "Detecting location..."
            : captured
              ? "Location captured"
              : "Tap to detect your location"}
        </ThemedText>
        {loading ? (
          <ActivityIndicator size="small" color="#00FF94" />
        ) : captured ? (
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
};

export default GeolocationComponent;
