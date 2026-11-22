import React from "react";
import { TouchableWithoutFeedback, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { openWebPage, PRIVACY_URL, TERMS_URL } from "@/constants/legal";

interface TermsCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ checked, onToggle }) => {
  return (
    <TouchableWithoutFeedback onPress={onToggle}>
      <View className="flex flex-row items-start gap-3">
        <View
          className={`h-6 w-6 rounded-md border-2 items-center justify-center ${
            checked
              ? "bg-[#00FF94] border-[#00FF94]"
              : "bg-white border-gray-400"
          }`}
        >
          {checked && <Ionicons name="checkmark" size={16} color="white" />}
        </View>

        <View className="flex-1">
          <ThemedText className="text-sm text-gray-700">
            I agree to the{" "}
            <ThemedText
              className="text-[#00FF94] underline"
              accessibilityRole="link"
              onPress={() => openWebPage(TERMS_URL)}
            >
              Terms and Conditions
            </ThemedText>{" "}
            and{" "}
            <ThemedText
              className="text-[#00FF94] underline"
              accessibilityRole="link"
              onPress={() => openWebPage(PRIVACY_URL)}
            >
              Privacy Policy
            </ThemedText>
          </ThemedText>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default TermsCheckbox;
