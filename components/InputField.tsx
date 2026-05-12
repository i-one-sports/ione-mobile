import {
  Image,
  NativeSyntheticEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

import React, { ReactNode, useState } from "react";

import { Ionicons, Entypo } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";

interface Props extends TextInputProps {
  label: string;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  error?: string | boolean;
  errorMessage?: string;
  inputComponentStyle?: StyleProp<ViewStyle>;
  required?: boolean;
  password?: boolean;
  isPhoneInput?: boolean;
  countryCodeValue?: string;
  openCountryModal?: () => void;
  selectPicker?: boolean;
  rightIcon?: ReactNode;
  pickerPressed?: () => void;
  flagUri?: string;
}

export default function InputField({
  label,
  onBlur,
  error,
  errorMessage,
  style,
  placeholder,
  onChangeText,
  value,
  keyboardType,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  autoFocus,
  flagUri,
  inputComponentStyle,
  multiline,
  placeholderTextColor,
  editable = true,
  maxLength,
  required,
  password = false,
  isPhoneInput = false,
  countryCodeValue,
  openCountryModal,
  selectPicker = false,
  rightIcon,
  pickerPressed,
}: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  // Define colors based on theme
  const colors = {
    primary: "#46BB1C",
    secondary: "#F5FFF2",
    error: "#FF4D4F",
    stroke: "#DADADA",
    text: theme.text,
    background: theme.background,
    icon: theme.icon,
    placeholder: colorScheme === "dark" ? "#9BA1A6" : "#6C757D",
  };

  const getBorderColor = () => {
    if (errorMessage) return colors.error;
    if (isFocused) return colors.primary;
    return colors.stroke;
  };

  const handleOnBlur = (e?: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (onBlur && e) onBlur(e);
  };

  const handleOnFocus = () => {
    setIsFocused(true);
  };

  const handlePasswordVisibility = () => {
    setHidePassword((prevState) => !prevState);
  };

  return (
    <View style={[styles.inputSection]}>
      {label && (
        <View style={styles.labelContainer}>
          <ThemedText
            lightColor={colors.text}
            darkColor={colors.text}
            className="text-base font-medium"
          >
            {label}
            {required && <Text style={{ color: colors.error }}> *</Text>}
          </ThemedText>
        </View>
      )}

      {/* Regular Text Input */}
      {!password && !isPhoneInput && !selectPicker && (
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: getBorderColor(),
              // backgroundColor: colors.secondary,
            },
            inputComponentStyle,
          ]}
        >
          <TextInput
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            accessibilityLabel={label}
            style={[styles.input, { color: colors.text }]}
            cursorColor={colors.primary}
            autoCapitalize={autoCapitalize}
            onChangeText={onChangeText}
            value={value}
            autoComplete={autoComplete}
            autoCorrect={autoCorrect}
            autoFocus={autoFocus}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor || colors.placeholder}
            multiline={multiline}
            editable={editable}
            maxLength={maxLength}
          />
        </View>
      )}

      {/* Password Input */}
      {password && (
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: getBorderColor(),
              // backgroundColor: colors.secondary,
            },
            inputComponentStyle,
          ]}
        >
          <TextInput
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            accessibilityLabel={label}
            style={[styles.input, styles.passwordInput, { color: colors.text }]}
            cursorColor={colors.primary}
            autoCapitalize="none"
            onChangeText={onChangeText}
            value={value}
            secureTextEntry={hidePassword}
            autoFocus={autoFocus}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor || colors.placeholder}
            multiline={multiline}
            editable={editable}
            maxLength={maxLength}
          />
          <Pressable
            hitSlop={20}
            onPress={handlePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={!hidePassword ? "eye" : "eye-off"}
              size={20}
              color={colors.icon}
            />
          </Pressable>
        </View>
      )}

      {/* Phone Input */}
      {isPhoneInput && (
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: getBorderColor(),
              backgroundColor: colors.secondary,
            },
            inputComponentStyle,
          ]}
        >
          <View style={styles.phoneInputContent}>
            {openCountryModal ? (
              <TouchableOpacity
                onPress={openCountryModal}
                style={styles.countrySelector}
              >
                {flagUri && (
                  <Image source={{ uri: flagUri }} style={styles.flagImage} />
                )}
                <ThemedText
                  lightColor={colors.text}
                  darkColor={colors.text}
                  className="text-base font-medium"
                >
                  {countryCodeValue || "NGN"}
                </ThemedText>
                <Entypo name="chevron-down" size={16} color={colors.icon} />
              </TouchableOpacity>
            ) : (
              <View style={styles.countrySelector}>
                {flagUri && (
                  <Image source={{ uri: flagUri }} style={styles.flagImage} />
                )}
                <ThemedText
                  lightColor={colors.text}
                  darkColor="#000"
                  className="text-base font-medium"
                >
                  {countryCodeValue || "NGN"}
                </ThemedText>
              </View>
            )}
            <TextInput
              onFocus={handleOnFocus}
              onBlur={handleOnBlur}
              accessibilityLabel={label}
              style={[styles.input, styles.phoneInput, { color: "#000" }]}
              cursorColor={colors.primary}
              autoCapitalize={autoCapitalize}
              onChangeText={onChangeText}
              value={value}
              autoComplete={autoComplete}
              autoCorrect={autoCorrect}
              autoFocus={autoFocus}
              keyboardType={keyboardType || "phone-pad"}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor || colors.placeholder}
              multiline={multiline}
              editable={editable}
              maxLength={maxLength}
            />
          </View>
        </View>
      )}

      {/* Select Picker */}
      {selectPicker && (
        <Pressable
          onPress={pickerPressed}
          style={[
            styles.inputContainer,
            styles.pickerContainer,
            {
              borderColor: getBorderColor(),
              backgroundColor: colors.secondary,
            },
            inputComponentStyle,
          ]}
        >
          <ThemedText
            lightColor={value ? colors.text : colors.placeholder}
            darkColor={value ? colors.text : colors.placeholder}
            className="text-[11px]"
            style={styles.pickerText}
          >
            {value || placeholder}
          </ThemedText>
          {rightIcon}
        </Pressable>
      )}

      {/* Error Message */}
      {errorMessage && (
        <View style={styles.errorView}>
          <ThemedText
            lightColor={colors.error}
            darkColor={colors.error}
            className="text-sm"
          >
            {errorMessage}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputSection: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 8,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 17,
  },
  input: {
    flex: 1,
    fontSize: 11,
    paddingVertical: 0, // Remove default padding for better control
  },
  passwordInput: {
    paddingRight: 8, // Add some space for the eye icon
  },
  eyeIcon: {
    marginLeft: 8,
    padding: 0,
  },
  phoneInputContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
    marginRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#DADADA", // stroke color
  },
  flagImage: {
    width: 24,
    height: 16,
    marginRight: 8,
    borderRadius: 2,
  },
  phoneInput: {
    flex: 1,
  },
  pickerContainer: {
    justifyContent: "space-between",
  },
  pickerText: {
    flex: 1,
  },
  errorView: {
    marginTop: 6,
  },
});
