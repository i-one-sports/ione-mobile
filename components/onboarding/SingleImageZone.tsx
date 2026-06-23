import { ThemedText } from "@/components/ThemedText";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  label: string;
  sublabel: string;
  previewUri: string | null;
  fileName?: string | null;
  fileType?: string | null;
  uploading: boolean;
  onPress: () => void;
  isDark: boolean;
  accent: string;
}

export default function SingleImageZone({
  label,
  sublabel,
  previewUri,
  fileName,
  fileType,
  uploading,
  onPress,
  isDark,
  accent,
}: Props) {
  const isImage =
    fileType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp)$/i.test(fileName || "");
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

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        disabled={uploading}
        style={{
          borderWidth: previewUri ? 0 : 1.5,
          borderStyle: "dashed",
          borderColor: isDark ? "#333" : "#d5d5d5",
          borderRadius: 14,
          overflow: "hidden",
          backgroundColor: previewUri
            ? "transparent"
            : isDark
              ? "#0a0a0a"
              : "#FAFAFA",
          opacity: uploading ? 0.7 : 1,
        }}
      >
        {previewUri ? (
          isImage ? (
            // IMAGE PREVIEW (UNCHANGED)
            <View>
              <Image
                source={{ uri: previewUri }}
                style={{ width: "100%", height: 160, borderRadius: 14 }}
                contentFit="cover"
              />

              {uploading && (
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 14,
                  }}
                >
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={{ color: "#fff", fontSize: 12, marginTop: 6 }}>
                    Uploading...
                  </Text>
                </View>
              )}

              {!uploading && (
                <View
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: accent,
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons name="check" size={15} color="#000" />
                </View>
              )}

              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  borderBottomLeftRadius: 14,
                  borderBottomRightRadius: 14,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 11 }}>
                  Tap to replace
                </Text>
              </View>
            </View>
          ) : (
            // DOCUMENT PREVIEW (YOUR STYLE ADDED PROPERLY)
            <View
              style={{
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: isDark ? "#111" : "#f5f5f5",
                borderRadius: 14,
                minHeight: 160,
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

              <View style={{ flex: 1 }}>
                <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 13 }}>
                  {fileName || "Document"}
                </Text>
                <Text style={{ color: "#888", fontSize: 11 }}>
                  {fileType || "File uploaded"}
                </Text>
              </View>
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  borderBottomLeftRadius: 14,
                  borderBottomRightRadius: 14,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 11 }}>
                  Tap to replace
                </Text>
              </View>
              {uploading && (
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 14,
                  }}
                >
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={{ color: "#fff", fontSize: 12, marginTop: 6 }}>
                    Uploading...
                  </Text>
                </View>
              )}

              {!uploading && (
                <MaterialIcons name="check" size={18} color={accent} />
              )}
            </View>
          )
        ) : (
          // EMPTY STATE (UNCHANGED)
          <View style={{ paddingVertical: 26, alignItems: "center", gap: 10 }}>
            {uploading ? (
              <ActivityIndicator color={accent} size="small" />
            ) : (
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="upload-cloud" size={22} color={accent} />
              </View>
            )}

            <View style={{ alignItems: "center", gap: 3 }}>
              <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
                {uploading ? "Uploading..." : "Tap to upload"}
              </ThemedText>

              {!uploading && (
                <ThemedText
                  lightColor="#bbb"
                  darkColor="#555"
                  style={{ fontSize: 11 }}
                >
                  JPEG or PNG · Max 5MB
                </ThemedText>
              )}
            </View>
          </View>
        )}
        {/*   {previewUri ? ( */}
        {/*     <View> */}
        {/*       <Image */}
        {/*         source={{ uri: previewUri }} */}
        {/*         style={{ width: "100%", height: 160, borderRadius: 14 }} */}
        {/*         contentFit="cover" */}
        {/*       /> */}
        {/*       {uploading && ( */}
        {/*         <View */}
        {/*           style={{ */}
        {/*             ...StyleSheet.absoluteFillObject, */}
        {/*             backgroundColor: "rgba(0,0,0,0.45)", */}
        {/*             alignItems: "center", */}
        {/*             justifyContent: "center", */}
        {/*             borderRadius: 14, */}
        {/*           }} */}
        {/*         > */}
        {/*           <ActivityIndicator color="#fff" size="small" /> */}
        {/*           <Text style={{ color: "#fff", fontSize: 12, marginTop: 6 }}> */}
        {/*             Uploading... */}
        {/*           </Text> */}
        {/*         </View> */}
        {/*       )} */}
        {/*       {!uploading && ( */}
        {/*         <View */}
        {/*           style={{ */}
        {/*             position: "absolute", */}
        {/*             top: 10, */}
        {/*             right: 10, */}
        {/*             backgroundColor: accent, */}
        {/*             borderRadius: 12, */}
        {/*             width: 24, */}
        {/*             height: 24, */}
        {/*             alignItems: "center", */}
        {/*             justifyContent: "center", */}
        {/*           }} */}
        {/*         > */}
        {/*           <MaterialIcons name="check" size={15} color="#000" /> */}
        {/*         </View> */}
        {/*       )} */}
        {/*       <View */}
        {/*         style={{ */}
        {/*           position: "absolute", */}
        {/*           bottom: 0, */}
        {/*           left: 0, */}
        {/*           right: 0, */}
        {/*           paddingVertical: 6, */}
        {/*           paddingHorizontal: 12, */}
        {/*           backgroundColor: "rgba(0,0,0,0.45)", */}
        {/*           borderBottomLeftRadius: 14, */}
        {/*           borderBottomRightRadius: 14, */}
        {/*         }} */}
        {/*       > */}
        {/*         <Text style={{ color: "#fff", fontSize: 11 }}> */}
        {/*           Tap to replace */}
        {/*         </Text> */}
        {/*       </View> */}
        {/*     </View> */}
        {/*   ) : ( */}
        {/*     <View style={{ paddingVertical: 26, alignItems: "center", gap: 10 }}> */}
        {/*       {uploading ? ( */}
        {/*         <ActivityIndicator color={accent} size="small" /> */}
        {/*       ) : ( */}
        {/*         <View */}
        {/*           style={{ */}
        {/*             width: 44, */}
        {/*             height: 44, */}
        {/*             borderRadius: 22, */}
        {/*             backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0", */}
        {/*             alignItems: "center", */}
        {/*             justifyContent: "center", */}
        {/*           }} */}
        {/*         > */}
        {/*           <Feather name="upload-cloud" size={22} color={accent} /> */}
        {/*         </View> */}
        {/*       )} */}
        {/*       <View style={{ alignItems: "center", gap: 3 }}> */}
        {/*         <ThemedText style={{ fontSize: 13, fontWeight: "600" }}> */}
        {/*           {uploading ? "Uploading..." : "Tap to upload"} */}
        {/*         </ThemedText> */}
        {/*         {!uploading && ( */}
        {/*           <ThemedText */}
        {/*             lightColor="#bbb" */}
        {/*             darkColor="#555" */}
        {/*             style={{ fontSize: 11 }} */}
        {/*           > */}
        {/*             JPEG or PNG · Max 5MB */}
        {/*           </ThemedText> */}
        {/*         )} */}
        {/*       </View> */}
        {/*     </View> */}
        {/*   )} */}
      </TouchableOpacity>
    </View>
  );
}
