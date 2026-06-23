import React, { useMemo, useState } from "react";
import { Modal, View, ScrollView, TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";
import InputField from "@/components/InputField";
import CustomButton from "@/components/ui/CustomButton";
import DropdownModal from "@/components/ui/DropdownModal";
import { ThemedText } from "./ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

interface TimePickerFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  errorMessage?: string;
  onChange: (value: string) => void;
}

export default function TimePickerField({
  label,
  value,
  placeholder = "Select Time",
  errorMessage,
  onChange,
}: TimePickerFieldProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [hourModalVisible, setHourModalVisible] = useState(false);
  const [minuteModalVisible, setMinuteModalVisible] = useState(false);

  const [hour, minute] = useMemo(() => {
    if (!value) return ["09", "00"];

    const [h, m] = value.split(":");

    return [h || "09", m || "00"];
  }, [value]);

  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);

  const saveTime = () => {
    onChange(`${selectedHour}:${selectedMinute}`);
    setVisible(false);
  };

  return (
    <>
      <InputField
        label={label}
        selectPicker
        placeholder={placeholder}
        value={value}
        pickerPressed={() => setVisible(true)}
        errorMessage={errorMessage}
        rightIcon={<Entypo name="chevron-down" size={14} color="#777" />}
      />

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingBottom: insets.bottom,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "70%",
            }}
          >
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* HOURS */}
              <View style={{ flex: 1 }}>
                <ThemedText style={{ marginBottom: 8 }}>Hour</ThemedText>

                <ScrollView style={{ maxHeight: 200 }}>
                  {HOURS.map((h) => (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setSelectedHour(h)}
                      style={{
                        padding: 12,
                        backgroundColor:
                          selectedHour === h ? "#eee" : "transparent",
                        borderRadius: 8,
                      }}
                    >
                      <ThemedText>{h}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* MINUTES */}
              <View style={{ flex: 1 }}>
                <ThemedText style={{ marginBottom: 8 }}>Minute</ThemedText>

                <ScrollView style={{ maxHeight: 200 }}>
                  {MINUTES.map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setSelectedMinute(m)}
                      style={{
                        padding: 12,
                        backgroundColor:
                          selectedMinute === m ? "#eee" : "transparent",
                        borderRadius: 8,
                      }}
                    >
                      <ThemedText>{m}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={{ marginTop: 20 }}>
              <TouchableOpacity
                onPress={saveTime}
                style={{
                  backgroundColor: "#00FF94",
                  padding: 14,
                  borderRadius: 10,
                }}
              >
                <ThemedText
                  className="text-center text-lg font-semibold"
                  lightColor="#fff"
                  darkColor="#666"
                >
                  Done
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DropdownModal
        visible={hourModalVisible}
        options={HOURS}
        onSelect={(h) => {
          setSelectedHour(h);
          setHourModalVisible(false);
        }}
        onClose={() => setHourModalVisible(false)}
      />

      <DropdownModal
        visible={minuteModalVisible}
        options={MINUTES}
        onSelect={(m) => {
          setSelectedMinute(m);
          setMinuteModalVisible(false);
        }}
        onClose={() => setMinuteModalVisible(false)}
      />
    </>
  );
}
