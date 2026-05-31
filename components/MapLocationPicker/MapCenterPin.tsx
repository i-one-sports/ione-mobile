import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

export default function MapCenterPin() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ alignItems: "center" }}>
        <MaterialIcons name="location-pin" size={44} color="#00FF94" />
        {/* Shadow dot under the pin tip */}
        <View
          style={{
            width: 8,
            height: 4,
            borderRadius: 4,
            backgroundColor: "rgba(0,0,0,0.25)",
            marginTop: -4,
          }}
        />
      </View>
    </View>
  );
}
