import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColorScheme } from "nativewind";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SettingsRowProps as Props } from "./types";

export function SettingsRow({
  icon,
  iconColor = "#00FF94",
  iconBg,
  label,
  labelColor,
  onPress,
  rightElement,
  showChevron = true,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const bgColor = iconBg ?? `${iconColor}22`;
  const chevronColor = isDark ? "#555" : "#ccc";
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <MaterialIcons name={icon} size={19} color={iconColor} />
      </View>

      <ThemedText
        style={{ fontFamily: "Poppins_500Medium", fontSize: 14, flex: 1 }}
        lightColor={labelColor ?? "#111"}
        darkColor={labelColor ?? "#f0f0f0"}
      >
        {label}
      </ThemedText>

      {rightElement ??
        (showChevron ? (
          <MaterialIcons name="chevron-right" size={20} color={chevronColor} />
        ) : null)}
    </Container>
  );
}
