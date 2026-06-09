import { ThemedText } from "@/components/ThemedText";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  label: string;
  sublabel: string;
  previewUris: string[];
  uploading: boolean;
  onPress: () => void;
  isDark: boolean;
  accent: string;
}

export default function MultiImageZone({
  label,
  sublabel,
  previewUris,
  uploading,
  onPress,
  isDark,
  accent,
}: Props) {
  const hasImages = previewUris.length > 0;

  return (
    <View style={{ marginBottom: 16 }}>
      <ThemedText style={{ fontSize: 13, fontWeight: "600", marginBottom: 2 }}>
        {label}
      </ThemedText>
      <ThemedText
        lightColor="#999"
        darkColor="#666"
        style={{ fontSize: 11, marginBottom: 10 }}
      >
        {sublabel}
      </ThemedText>

      {hasImages && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {previewUris.map((uri, i) => (
            <View
              key={i}
              style={{
                width: 90,
                height: 90,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <Image
                source={{ uri }}
                style={{ width: 90, height: 90 }}
                contentFit="cover"
              />
              {uploading && (
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator color="#fff" size="small" />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={uploading}
        style={{
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: hasImages ? accent : isDark ? "#333" : "#d5d5d5",
          borderRadius: 14,
          paddingVertical: 18,
          alignItems: "center",
          gap: 8,
          backgroundColor: hasImages
            ? `${accent}10`
            : isDark
              ? "#0a0a0a"
              : "#FAFAFA",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? (
          <ActivityIndicator color={accent} size="small" />
        ) : (
          <Feather
            name={hasImages ? "refresh-cw" : "upload-cloud"}
            size={20}
            color={accent}
          />
        )}
        <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
          {uploading
            ? "Uploading..."
            : hasImages
              ? `${previewUris.length} photo${previewUris.length > 1 ? "s" : ""} selected — tap to change`
              : "Tap to upload photos"}
        </ThemedText>
        {!hasImages && !uploading && (
          <ThemedText
            lightColor="#bbb"
            darkColor="#555"
            style={{ fontSize: 11 }}
          >
            Up to 5 photos
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
}
