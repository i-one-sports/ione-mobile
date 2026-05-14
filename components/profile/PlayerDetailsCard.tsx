import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";
import { FormattedUserData } from "./types";

interface Props {
  data: FormattedUserData;
}

type IconName = keyof typeof MaterialIcons.glyphMap;

interface RowProps {
  icon: IconName;
  label: string;
  value: string;
  isDark: boolean;
  accent: string;
  isLast?: boolean;
  borderColor: string;
}

function InfoRow({
  icon,
  label,
  value,
  isDark,
  accent,
  isLast,
  borderColor,
}: RowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: borderColor,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: `${accent}20`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <MaterialIcons name={icon} size={18} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText
          lightColor="#999"
          darkColor="#666"
          style={{
            fontSize: 10,
            fontWeight: "500",
            marginBottom: 2,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {label}
        </ThemedText>
        <ThemedText style={{ fontSize: 13, fontWeight: "500" }}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

function SectionCard({
  title,
  children,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <ThemedText
        lightColor="#999"
        darkColor="#555"
        style={{
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: 8,
          marginLeft: 4,
        }}
      >
        {title}
      </ThemedText>
      <View
        style={{
          backgroundColor: isDark ? "#141414" : "#fff",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "#242424" : "#efefef",
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        {children}
      </View>
    </View>
  );
}

export function PlayerDetailsCard({ data }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const accent = isDark ? "#00FF94" : "#00cc77";
  const divider = isDark ? "#1e1e1e" : "#f5f5f5";

  return (
    <>
      <SectionCard title="Contact" isDark={isDark}>
        <InfoRow
          icon="email"
          label="Email"
          value={data.email}
          isDark={isDark}
          accent={accent}
          borderColor={divider}
        />
        <InfoRow
          icon="phone"
          label="Phone"
          value={data.phoneNumber}
          isDark={isDark}
          accent={accent}
          borderColor={divider}
        />
        <InfoRow
          icon="location-on"
          label="Address"
          value={data.address}
          isDark={isDark}
          accent={accent}
          isLast
          borderColor={divider}
        />
      </SectionCard>

      <SectionCard title="Personal Details" isDark={isDark}>
        <InfoRow
          icon="cake"
          label="Date of Birth"
          value={data.dateOfBirth}
          isDark={isDark}
          accent={accent}
          borderColor={divider}
        />
        <InfoRow
          icon="straighten"
          label="Height"
          value={data.height}
          isDark={isDark}
          accent={accent}
          borderColor={divider}
        />
        <InfoRow
          icon="public"
          label="Place of Birth"
          value={data.placeOfBirth}
          isDark={isDark}
          accent={accent}
          isLast
          borderColor={divider}
        />
      </SectionCard>
    </>
  );
}
