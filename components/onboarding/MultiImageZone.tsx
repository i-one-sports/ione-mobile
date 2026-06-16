import { ThemedText } from "@/components/ThemedText";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ImageFile } from "../typings/api";

interface Props {
  label: string;
  sublabel: string;
  previewUris: ImageFile[];
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

      {/* PREVIEW LIST */}
      {hasImages && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {previewUris.map((file, i) => {
            const isImage = file.type?.startsWith("image/");

            return (
              <View
                key={i}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: isDark ? "#111" : "#f5f5f5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isImage ? (
                  <Image
                    source={{ uri: file.uri }}
                    style={{ width: 90, height: 90 }}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: accent,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name="file" size={20} color="#000" />
                    </View>

                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 10,
                        color: isDark ? "#fff" : "#000",
                        paddingHorizontal: 4,
                        textAlign: "center",
                      }}
                    >
                      {file.name ?? "Document"}
                    </Text>
                  </View>
                )}

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
            );
          })}
        </ScrollView>
      )}

      {/* UPLOAD BUTTON */}
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
              ? `${previewUris.length} file${
                  previewUris.length > 1 ? "s" : ""
                } selected — tap to change`
              : "Tap to upload files"}
        </ThemedText>

        {!hasImages && !uploading && (
          <ThemedText
            lightColor="#bbb"
            darkColor="#555"
            style={{ fontSize: 11 }}
          >
            Images & documents supported
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
}
