 
 
import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { ThemedText } from "../ThemedText";
import Spinner from "../Spinner";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  titleStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  primary?: boolean;
  icon?: boolean;
  className?: string;
  isGoogleBtn?: boolean;
}

export default function CustomButton({
  onPress,
  disabled,
  loading,
  title,
  titleStyle,
  style,
  className,
  icon,
  primary = false,
  isGoogleBtn = false,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const buttonDisabled = disabled || loading;

  const getTextColor = () => {
    if (loading) return primary || isGoogleBtn ? "#000" : "#fff";
    if (primary) return "#fff"; // white text on primary button
    if (isGoogleBtn) return "#000"; // black text for google
    return isDark ? "#fff" : "#46BB1C";
  };

  const renderSpinnerOrText = () => {
    if (loading) {
      return (
        <Spinner
          color={primary || isGoogleBtn ? "#000" : "#fff"}
          size={18}
          animating={loading}
        />
      );
    }
    return (
      <ThemedText
        className={className ?? ""}
        type="medium"
        style={[styles.text, { color: getTextColor() }, titleStyle]}
      >
        {title}
      </ThemedText>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={buttonDisabled}
      style={[
        styles.button,
        primary
          ? { backgroundColor: "#00FF94" } // your primary color
          : {
              backgroundColor: isDark ? "#222" : "#fff",
              borderWidth: 1,
              borderColor: isDark ? "#222" : "#46BB1C",
            },
        buttonDisabled ? { opacity: 0.7 } : {},
        style,
      ]}
    >
      <View style={styles.content}>
        {renderSpinnerOrText()}
        {icon ? (
          <Entypo name="chevron-small-right" size={24} color={getTextColor()} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
});
