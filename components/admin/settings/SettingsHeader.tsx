import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Text, View } from "react-native";
import { SettingsHeaderProps as Props } from "./types";

export function SettingsHeader({
  firstName,
  lastName,
  email,
  nickname,
}: Props) {
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <View style={{ alignItems: "center", paddingVertical: 28 }}>
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: "#00FF94",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          shadowColor: "#00FF94",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text
          style={{ fontSize: 28, fontFamily: "Poppins_700Bold", color: "#000" }}
        >
          {initials}
        </Text>
      </View>

      <ThemedText
        style={{ fontFamily: "Poppins_600SemiBold", fontSize: 18 }}
        lightColor="#111"
        darkColor="#fff"
      >
        {firstName} {lastName}
      </ThemedText>

      <ThemedText
        style={{ fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 3 }}
        lightColor="#888"
        darkColor="#aaa"
      >
        {email}
      </ThemedText>

      {nickname ? (
        <View
          style={{
            marginTop: 10,
            backgroundColor: "#00FF9422",
            paddingHorizontal: 14,
            paddingVertical: 5,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#00FF9455",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Poppins_500Medium",
              color: "#00cc77",
            }}
          >
            @{nickname}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
