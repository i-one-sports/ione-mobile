import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

interface Props {
  isDark: boolean;
}

export function SessionSkeletonCard({ isDark }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });
  const bone = isDark ? "#242424" : "#E8E8E8";
  const cardBg = isDark ? "#111" : "#FFF";
  const border = isDark ? "#1E1E1E" : "#EFEFEF";

  return (
    <Animated.View
      style={{
        opacity,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: cardBg,
        padding: 16,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <View>
          <View
            style={{
              height: 15,
              width: 150,
              borderRadius: 8,
              backgroundColor: bone,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              height: 11,
              width: 90,
              borderRadius: 6,
              backgroundColor: bone,
            }}
          />
        </View>
        <View
          style={{
            height: 26,
            width: 58,
            borderRadius: 13,
            backgroundColor: bone,
          }}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        <View
          style={{
            height: 30,
            width: 80,
            borderRadius: 8,
            backgroundColor: bone,
          }}
        />
        <View
          style={{
            height: 30,
            width: 68,
            borderRadius: 8,
            backgroundColor: bone,
          }}
        />
      </View>

      <View style={{ marginBottom: 8 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 7,
          }}
        >
          <View
            style={{
              height: 11,
              width: 50,
              borderRadius: 6,
              backgroundColor: bone,
            }}
          />
          <View
            style={{
              height: 11,
              width: 36,
              borderRadius: 6,
              backgroundColor: bone,
            }}
          />
        </View>
        <View style={{ height: 5, borderRadius: 3, backgroundColor: bone }} />
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: border,
          marginTop: 10,
          marginBottom: 12,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            height: 11,
            width: 110,
            borderRadius: 6,
            backgroundColor: bone,
          }}
        />
        <View
          style={{
            height: 34,
            width: 68,
            borderRadius: 10,
            backgroundColor: bone,
          }}
        />
      </View>
    </Animated.View>
  );
}
