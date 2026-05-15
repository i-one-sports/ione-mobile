import { StyleProp, View, ViewStyle, useColorScheme } from "react-native";
import React, { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function SafeAreaScreen({ children, style, className }: Props) {
  const { top, bottom } = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const bg = colorScheme === "dark" ? "#000" : "#fff";

  return (
    <View
      className={className}
      style={[
        {
          flex: 1,
          backgroundColor: bg,
          paddingTop: top,
          paddingBottom: bottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
