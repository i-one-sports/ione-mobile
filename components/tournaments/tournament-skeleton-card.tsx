import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

interface Props {
  isDark: boolean;
}

export function TournamentSkeletonCard({ isDark }: Props) {
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
  const border = isDark ? "#1E1E1E" : "#DFDFDF";

  return (
    <Animated.View
      style={{
        opacity,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: border,
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Tournament initials / polygon skeleton */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: bone,
          }}
        />

        {/* Tournament name skeleton */}
        <View
          style={{
            flex: 1,
            marginLeft: 12,
            marginRight: 16,
          }}
        >
          <View
            style={{
              height: 16,
              width: "70%",
              maxWidth: 220,
              borderRadius: 8,
              backgroundColor: bone,
            }}
          />
        </View>

        {/* Divider + chevron skeleton */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              height: 48,
              width: 1.5,
              backgroundColor: bone,
              marginRight: 8,
            }}
          />

          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: bone,
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
}
