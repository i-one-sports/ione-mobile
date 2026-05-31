import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SearchFeature } from "./geocode";

interface MapSearchBarProps {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
  searching: boolean;
  results: SearchFeature[];
  onSelectResult: (feature: SearchFeature) => void;
}

export default function MapSearchBar({
  value,
  onChange,
  onClear,
  searching,
  results,
  onSelectResult,
}: MapSearchBarProps) {
  return (
    <>
      {/* Search input */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 10,
          backgroundColor: "#fff",
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Ionicons name="search" size={16} color="#999" />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search for a location..."
          placeholderTextColor="#aaa"
          style={{ flex: 1, fontSize: 14, color: "#111", padding: 0 }}
          returnKeyType="search"
        />
        {searching ? (
          <ActivityIndicator size="small" color="#00cc77" />
        ) : value.length > 0 ? (
          <TouchableOpacity onPress={onClear}>
            <Ionicons name="close-circle" size={16} color="#ccc" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Results dropdown */}
      {results.length > 0 && (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 4,
            backgroundColor: "#fff",
            borderRadius: 10,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {results.map((feature, i) => (
            <TouchableOpacity
              key={feature.id}
              onPress={() => onSelectResult(feature)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderBottomWidth: i < results.length - 1 ? 1 : 0,
                borderBottomColor: "#f0f0f0",
                gap: 10,
              }}
            >
              <Ionicons name="location-outline" size={14} color="#00cc77" />
              <ThemedText
                lightColor="#222"
                darkColor="#222"
                style={{ flex: 1, fontSize: 13 }}
                numberOfLines={2}
              >
                {feature.place_name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}
