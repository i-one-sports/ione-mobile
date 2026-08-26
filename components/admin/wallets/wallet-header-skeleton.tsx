import React from "react";
import { Animated, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function WalletHeaderSkeleton() {
  const opacity = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <LinearGradient
      colors={["#00492A", "#61C89D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Available Balance */}
        <View
          style={{
            width: 100,
            height: 14,
            borderRadius: 5,
            backgroundColor: "rgba(255,255,255,0.25)",
          }}
        />

        {/* Status */}
        <Animated.View
          style={{
            opacity,
            width: 60,
            height: 22,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.25)",
          }}
        />
      </View>

      {/* Balance */}
      <Animated.View
        style={{
          opacity,
          width: 180,
          height: 42,
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255,0.25)",
          marginTop: 8,
          marginBottom: 12,
        }}
      />
    </LinearGradient>
  );
}
