import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";
import { SettingsSectionProps as Props } from "./types";

export function SettingsSection({ title, children }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const count = React.Children.count(children);

  return (
    <View style={{ marginBottom: 24 }}>
      <ThemedText
        style={{
          fontFamily: "Poppins_600SemiBold",
          fontSize: 11,
          letterSpacing: 0.8,
          marginBottom: 8,
          marginLeft: 4,
        }}
        lightColor="#999"
        darkColor="#666"
      >
        {title.toUpperCase()}
      </ThemedText>

      <View
        style={{
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: isDark ? "#141414" : "#fff",
          borderWidth: 1,
          borderColor: isDark ? "#242424" : "#efefef",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        {React.Children.map(children, (child, index) => (
          <View key={index}>
            {child}
            {index < count - 1 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: isDark ? "#242424" : "#f5f5f5",
                  marginLeft: 68,
                }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
