import React, { useEffect } from "react";
import Svg, { Polygon } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useColorScheme } from "nativewind";

type Props = {
  size?: number;
};

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default function PolygonSkeleton({ size = 48 }: Props) {
  const { colorScheme } = useColorScheme();

  const fill = colorScheme === "dark" ? "#374151" : "#E5E7EB";

  const opacity = useSharedValue(0.5);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.5, { duration: 700 }),
      ),
      -1,
      false,
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.96, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedSvg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={animatedStyle}
    >
      <Polygon points="50,5 95,35 78,90 22,90 5,35" fill={fill} />
    </AnimatedSvg>
  );
}
