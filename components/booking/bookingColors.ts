import { useColorScheme } from "react-native";

// Colours for the booking screens (New Session, See the day, Pitch bookings).
export function useBookingColors() {
  const isDark = useColorScheme() === "dark";
  return {
    isDark,
    text: isDark ? "#fff" : "#111",
    muted: isDark ? "#9BA1A6" : "#6D717F",
    accent: isDark ? "#00FF94" : "#00A85A",
    /** Filled call-to-action green (black text on it). */
    cta: "#1DE98B",
    border: isDark ? "#2a2a2a" : "#E5E7EB",
    surface: isDark ? "#151515" : "#fff",
    chipBg: isDark ? "#1a1a1a" : "#F3F4F6",
    freeBorder: isDark ? "#1F6F4A" : "#A7F0CD",
    freeBg: isDark ? "#0D1F17" : "#EAFBF2",
    selectedBg: isDark ? "#fff" : "#111",
    selectedText: isDark ? "#111" : "#fff",
    unavailableBg: isDark ? "#1a1a1a" : "#F1F2F3",
    unavailableText: isDark ? "#555" : "#B5B8BE",
    full: "#E5484D",
    warnBg: isDark ? "#2A2210" : "#FFF7E8",
    warnBorder: isDark ? "#6B5214" : "#F5D28A",
  };
}
