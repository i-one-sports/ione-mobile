import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/typings/badge";
import { badgeInfo } from "@/constants/badges";

interface Props {
  badge: Badge | null;
  sharing: boolean;
  /** "Share am": show it on the public profile. */
  onShare: () => void;
  /** Close (X or "Next game, na me!"). */
  onClose: () => void;
}

// Design #6: the full-screen badge pop-up. Always dark, like the design.
export default function BadgeUnlockedModal({
  badge,
  sharing,
  onShare,
  onClose,
}: Props) {
  if (!badge) return null;
  const info = badgeInfo(badge.badge);
  const [before, after] = info.message.split("{highlight}");
  const sessions = badge.sessions?.length ?? 7;

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#121212",
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 40,
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{ alignSelf: "flex-end" }}
          hitSlop={12}
        >
          <Ionicons name="close" size={28} color="#9BA1A6" />
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 24, gap: 28 }}>
          <View
            style={{
              borderWidth: 1.5,
              borderColor: "#00FF94",
              borderRadius: 20,
              paddingHorizontal: 18,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                color: "#00FF94",
                fontSize: 13,
                fontWeight: "800",
                letterSpacing: 2,
              }}
            >
              NEW BADGE UNLOCKED
            </Text>
          </View>

          {/* Badge medal: dashed ring around the code */}
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: "#2E3A34",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 164,
                height: 164,
                borderRadius: 82,
                borderWidth: 3,
                borderColor: "#00FF94",
                backgroundColor: "#16251E",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: "#00FF94", fontSize: 54, fontWeight: "900" }}
              >
                {info.code}
              </Text>
            </View>
          </View>

          <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800" }}>
            {info.title}
          </Text>

          <View
            style={{
              backgroundColor: "#1E2422",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <Text style={{ color: "#E5E7EB", fontSize: 16, lineHeight: 26 }}>
              {before}
              {after !== undefined && (
                <Text style={{ color: "#00FF94", fontWeight: "800" }}>
                  {info.highlight}
                </Text>
              )}
              {after}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignSelf: "stretch",
            }}
          >
            {[
              { value: sessions, label: "Sessions" },
              { value: 0, label: "Goals" },
              { value: 0, label: "Assists" },
            ].map((stat) => (
              <View key={stat.label} style={{ alignItems: "center", gap: 4 }}>
                <Text
                  style={{ color: "#fff", fontSize: 30, fontWeight: "800" }}
                >
                  {stat.value}
                </Text>
                <Text style={{ color: "#9BA1A6", fontSize: 13 }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: "auto", gap: 14 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onShare}
              disabled={sharing || badge.shared}
              style={{
                flex: 1,
                borderWidth: 1.5,
                borderColor: "#00FF94",
                borderRadius: 10,
                paddingVertical: 18,
                alignItems: "center",
              }}
            >
              {sharing ? (
                <ActivityIndicator color="#00FF94" />
              ) : (
                <Text
                  style={{ color: "#00FF94", fontSize: 16, fontWeight: "600" }}
                >
                  {badge.shared ? "Shared ✓" : "Share am"}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#00FF94",
                borderRadius: 10,
                paddingVertical: 18,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#000", fontSize: 16, fontWeight: "800" }}>
                Next game, na me!
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Ionicons
              name={badge.shared ? "eye-outline" : "lock-closed-outline"}
              size={14}
              color="#9BA1A6"
            />
            <Text style={{ color: "#9BA1A6", fontSize: 13 }}>
              {badge.shared
                ? "Now on your public profile"
                : "Only you can see this unless you share it"}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
