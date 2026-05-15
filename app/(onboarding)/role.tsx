import SafeAreaScreen from "@/components/SafeAreaScreen";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { Icon } from "@/components/ui/Icon";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type RoleOption = {
  id: string;
  title: string;
  description: string;
  icon: string;
  library: "Ionicons" | "MaterialCommunityIcons";
};

const ROLES: RoleOption[] = [
  {
    id: "player",
    title: "As a Player",
    description:
      "Find teams, join matches, and track your performance on the pitch.",
    icon: "football-outline",
    library: "Ionicons",
  },
  {
    id: "organizer",
    title: "As an Organizer",
    description:
      "Manage pitches, schedule games, and recruit players for your facility.",
    icon: "soccer-field",
    library: "MaterialCommunityIcons",
  },
];

export default function Role() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole((prev) => (prev === role ? null : role));
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    if (selectedRole === "organizer") {
      router.push("/(onboarding)/admin-signup");
    } else {
      router.push({
        pathname: "/(onboarding)/signup",
        params: { owner: "false" },
      });
    }
  };

  const accent = isDark ? "#00FF94" : "#00cc77";

  return (
    <SafeAreaScreen
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 48,
          flexGrow: 1,
          justifyContent: "space-between",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: 28,
              marginBottom: 32,
            }}
          >
            <View>
              <ThemedText
                lightColor="#999"
                darkColor="#666"
                style={{ fontSize: 12, marginBottom: 4 }}
              >
                Welcome to iOne
              </ThemedText>
              <ThemedText style={{ fontSize: 18, fontWeight: "700" }}>
                How Do You Want to Join?
              </ThemedText>
            </View>
            <Icon />
          </View>

          <ThemedText
            lightColor="#6C757D"
            darkColor="#9BA1A6"
            style={{ fontSize: 14, lineHeight: 21, marginBottom: 28 }}
          >
            Choose your role to get the best experience tailored just for you.
          </ThemedText>

          {/* Role cards */}
          <View style={{ gap: 16 }}>
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => handleRoleSelect(role.id)}
                  activeOpacity={0.8}
                  style={{
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: isSelected
                      ? accent
                      : isDark
                        ? "#222"
                        : "#E8E8E8",
                    backgroundColor: isSelected
                      ? isDark
                        ? "#0D2B1F"
                        : "#EDFFF8"
                      : isDark
                        ? "#111"
                        : "#F9FAFB",
                    padding: 18,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: isSelected
                        ? `${accent}22`
                        : isDark
                          ? "#1a1a1a"
                          : "#f0f0f0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {role.library === "MaterialCommunityIcons" ? (
                      <MaterialCommunityIcons
                        name={role.icon as any}
                        size={22}
                        color={isSelected ? accent : isDark ? "#555" : "#aaa"}
                      />
                    ) : (
                      <Ionicons
                        name={role.icon as keyof typeof Ionicons.glyphMap}
                        size={22}
                        color={isSelected ? accent : isDark ? "#555" : "#aaa"}
                      />
                    )}
                  </View>

                  <View style={{ flex: 1, gap: 4 }}>
                    <ThemedText style={{ fontSize: 15, fontWeight: "600" }}>
                      {role.title}
                    </ThemedText>
                    <ThemedText
                      lightColor="#6C757D"
                      darkColor="#9BA1A6"
                      style={{ fontSize: 12, lineHeight: 17 }}
                    >
                      {role.description}
                    </ThemedText>
                  </View>

                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 1.5,
                      borderColor: isSelected
                        ? accent
                        : isDark
                          ? "#444"
                          : "#ccc",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: accent,
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Continue button */}
        <View style={{ marginTop: 40 }}>
          <CustomButton
            primary
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedRole}
          />
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ alignItems: "center", paddingVertical: 14 }}
          >
            <ThemedText
              lightColor="#999"
              darkColor="#666"
              style={{ fontSize: 13 }}
            >
              Already have an account?{" "}
              <ThemedText
                lightColor="#46BB1C"
                darkColor="#00FF94"
                style={{ fontWeight: "600" }}
              >
                Sign In
              </ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}
