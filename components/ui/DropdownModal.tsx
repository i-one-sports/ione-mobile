import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface DropdownModalProps {
  visible: boolean;
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
  isDark?: boolean;
}

export default function DropdownModal({
  visible,
  options,
  onSelect,
  onClose,
  isDark: isDarkProp,
}: DropdownModalProps) {
  const colorScheme = useColorScheme();
  const isDark = isDarkProp ?? colorScheme === "dark";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: isDark ? "#1a1a1a" : "#fff",
            borderRadius: 16,
            overflow: "hidden",
          }}
          onPress={() => {}}
        >
          {options.map((opt, i) => (
            <TouchableOpacity
              key={opt}
              onPress={() => {
                onSelect(opt);
                onClose();
              }}
              style={{
                paddingVertical: 15,
                paddingHorizontal: 20,
                borderBottomWidth: i < options.length - 1 ? 1 : 0,
                borderBottomColor: isDark ? "#2a2a2a" : "#f2f2f2",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#fff" : "#111",
                  textTransform: "capitalize",
                }}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
