import { ThemedText } from "@/components/ThemedText";
import { Image } from "expo-image";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import { FormattedUserData } from "./types";

interface Props {
  avatar?: string;
  nickname?: string;
  firstName?: string;
  data: FormattedUserData;
}

export function ProfileCard({ avatar, nickname, data }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const initials =
    `${data.firstName?.[0] ?? ""}${data.lastName?.[0] ?? ""}`.toUpperCase();
  const hasAvatar = !!avatar;
  const accentText = isDark ? "#00FF94" : "#00cc77";
  const isNicknameSet = nickname && nickname !== "Not set";
  const isPositionSet = data.position && data.position !== "Not set";
  const isCaptain = data.isCaptain === "Yes";

  return (
    <View style={{ alignItems: "center", paddingVertical: 28 }}>
      {/* Avatar circle */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: "#00FF94",
          shadowColor: "#00FF94",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.45,
          shadowRadius: 14,
          elevation: 10,
          alignItems: "center",
          justifyContent: "center",
          overflow: hasAvatar ? "hidden" : "visible",
        }}
      >
        {hasAvatar ? (
          <Image
            source={avatar}
            style={{ width: 96, height: 96, borderRadius: 48 }}
            contentFit="cover"
          />
        ) : (
          <Text style={{ fontSize: 32, fontWeight: "800", color: "#000" }}>
            {initials || "?"}
          </Text>
        )}
      </View>

      {/* Name */}
      <ThemedText
        style={{
          fontSize: 21,
          fontWeight: "700",
          marginTop: 14,
          textAlign: "center",
        }}
      >
        {data.firstName} {data.lastName}
      </ThemedText>

      {/* Nickname */}
      {isNicknameSet && (
        <ThemedText
          lightColor="#888"
          darkColor="#666"
          style={{ fontSize: 13, marginTop: 3 }}
        >
          @{nickname}
        </ThemedText>
      )}

      {/* Position + Captain badges */}
      {(isPositionSet || isCaptain) && (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {isPositionSet && (
            <View
              style={{
                backgroundColor: "#00FF9420",
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 5,
                borderWidth: 1,
                borderColor: "#00FF9455",
              }}
            >
              <Text
                style={{ color: accentText, fontSize: 12, fontWeight: "600" }}
              >
                {data.position}
              </Text>
            </View>
          )}
          {isCaptain && (
            <View
              style={{
                backgroundColor: "#FF990020",
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 5,
                borderWidth: 1,
                borderColor: "#FF990055",
              }}
            >
              <Text
                style={{ color: "#FF9900", fontSize: 12, fontWeight: "600" }}
              >
                ⭐ Captain
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
