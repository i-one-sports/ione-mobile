import React from "react";
import { Pressable, Text, View } from "react-native";

export interface SegmentedTab<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  tabs: SegmentedTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  isDark: boolean;
}

export function SegmentedControl<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  isDark,
}: Props<T>) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: isDark ? "#181818" : "#ECECEC",
        borderRadius: 30,
        padding: 4,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              paddingVertical: 9,
              borderRadius: 30,
              backgroundColor: isActive ? "#00FF94" : "transparent",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: isActive ? "#fff" : isDark ? "#555" : "#888",
              }}
            >
              {tab.label}
            </Text>
            {tab.count !== undefined && tab.count > 0 && (
              <View
                style={{
                  backgroundColor: isActive
                    ? "rgba(0,0,0,0.15)"
                    : isDark
                      ? "#2A2A2A"
                      : "#D8D8D8",
                  borderRadius: 8,
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  minWidth: 18,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    color: isActive ? "#fff" : isDark ? "#555" : "#888",
                  }}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
