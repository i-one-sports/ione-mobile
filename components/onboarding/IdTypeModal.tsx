import { SubmitVerificationPayload } from "@/components/typings/api";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity } from "react-native";

const ID_TYPES: {
  label: string;
  value: SubmitVerificationPayload["idType"];
}[] = [
  { label: "BVN", value: "BVN" },
  { label: "NIN", value: "NIN" },
  { label: "Driver's License", value: "DRIVERS_LICENSE" },
  { label: "International Passport", value: "PASSPORT" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: SubmitVerificationPayload["idType"]) => void;
  isDark: boolean;
}

export { ID_TYPES };

export default function IdTypeModal({
  visible,
  onClose,
  onSelect,
  isDark,
}: Props) {
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
          {ID_TYPES.map((opt, i) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                onSelect(opt.value);
                onClose();
              }}
              style={{
                paddingVertical: 15,
                paddingHorizontal: 20,
                borderBottomWidth: i < ID_TYPES.length - 1 ? 1 : 0,
                borderBottomColor: isDark ? "#2a2a2a" : "#f2f2f2",
              }}
            >
              <Text style={{ fontSize: 14, color: isDark ? "#fff" : "#111" }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
