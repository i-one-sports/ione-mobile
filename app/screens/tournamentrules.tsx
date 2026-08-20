import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { createTournament } from "@/api/tournamentThunk";
import InputField from "@/components/InputField";
import Loader from "@/components/loader";
import SafeAreaScreen from "@/components/SafeAreaScreen";
import SectionCard from "@/components/ui/SectionCard";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppDispatch } from "@/redux/store";

/* ─── Add/remove list field (rules) ─── */
function RuleListField({
  items,
  onAdd,
  onRemove,
  isDark,
}: {
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  isDark: boolean;
}) {
  const [text, setText] = useState("");
  const muted = isDark ? "#9BA1A6" : "#6C757D";

  const add = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <InputField
            label="Add a rule"
            placeholder="e.g. 3 Points For Wins, 1 Point For Draws"
            value={text}
            onChangeText={setText}
            onSubmitEditing={add}
          />
        </View>
        <TouchableOpacity
          onPress={add}
          style={{
            backgroundColor: "#00FF94",
            borderRadius: 8,
            paddingHorizontal: 18,
            paddingVertical: 15,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#000" }}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ gap: 8 }}>
        {items.map((rule, i) => (
          <View
            key={`${rule}-${i}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#1E2A26" : "#E8FBF2",
              borderRadius: 8,
              paddingLeft: 12,
              paddingRight: 8,
              paddingVertical: 10,
              gap: 8,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#00FF94",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#000" }}>
                {i + 1}
              </Text>
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                color: isDark ? "#F5FFF2" : "#1A1D1F",
              }}
            >
              {rule}
            </Text>
            <TouchableOpacity onPress={() => onRemove(i)} hitSlop={8}>
              <Ionicons name="close" size={16} color={muted} />
            </TouchableOpacity>
          </View>
        ))}
        {items.length === 0 && (
          <Text style={{ fontSize: 12, color: muted }}>No rules added yet</Text>
        )}
      </View>
    </View>
  );
}

export default function TournamentRulesScreen() {
  const params = useLocalSearchParams<{ locationId?: string; data?: string }>();
  const locationId = params.locationId ?? "";

  const data = useMemo(() => {
    try {
      return params.data ? JSON.parse(params.data) : {};
    } catch {
      return {};
    }
  }, [params.data]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useAppDispatch();
  const [rules, setRules] = useState<string[]>(data.rules ?? []);
  const [loading, setLoading] = useState(false);

  const handleCreateTournament = () => {
    if (rules.length === 0) {
      Toast.show({
        type: "error",
        props: { title: "Rules", message: "Add at least one rule" },
      });
      return;
    }
    if (!locationId) {
      Toast.show({
        type: "error",
        props: {
          title: "Error",
          message: "Missing location. Go back and try again.",
        },
      });
      return;
    }

    const payload = {
      name: data.name ?? "",
      description: data.description ?? "",
      type: data.type ?? "knockout",
      prizeMoney: Number(data.prizeMoney) || 0,
      registrationFee: Number(data.registrationFee) || 0,
      minutesPerMatch: Number(data.minutesPerMatch) || 0,
      playersPerTeam: Number(data.playersPerTeam) || 0,
      maxTeams: Number(data.maxTeams) || 0,
      registrationDeadline: data.registrationDeadline ?? "",
      startDate: data.startDate ?? "",
      durationDays: Number(data.durationDays) || 0,
      pitches: data.pitches ?? [],
      teamPrizes: data.teamPrizes ?? [],
      playerPrizes: data.playerPrizes ?? [],
      rules,
    };

    console.log("Create tournament payload:", payload);

    setLoading(true);
    dispatch(createTournament({ locationId, payload }))
      .unwrap()
      .then((response: any) => {
        setLoading(false);
        Toast.show({
          type: "success",
          props: {
            title: "Success",
            message: response?.message || "Tournament created successfully",
          },
        });
        if (response?._id) {
          router.replace({
            pathname: "/tournamentdetail",
            params: {
              tournamentId: response._id,
              tournamentName: response.name ?? "",
            },
          });
        } else {
          router.replace("/tournaments");
        }
      })
      .catch((err: any) => {
        setLoading(false);
        const message =
          err?.msg?.message || err?.msg || "Failed to create tournament";
        Toast.show({ type: "error", props: { title: "Error", message } });
      });
  };

  return (
    <SafeAreaScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          className="mb-[40px] h-full flex-1 py-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 64,
            paddingHorizontal: 32,
            flexGrow: 1,
          }}
        >
          <View className="flex flex-row items-center justify-between">
            <Pressable onPress={() => router.back()}>
              <ThemedText
                lightColor={theme.text}
                darkColor={theme.text}
                className="text-[16px] font-[500] text-black"
              >
                Back
              </ThemedText>
            </Pressable>

            <ThemedText
              lightColor={theme.text}
              darkColor={theme.text}
              className="text-[20px] font-[600] text-black"
            >
              New Tournament
            </ThemedText>

            <Pressable onPress={handleCreateTournament} disabled={loading}>
              <Text
                className={`text-[16px] font-[500] ${loading ? "text-gray-400" : "text-[#0C4D2E]"}`}
              >
                {loading ? "Creating..." : "Create"}
              </Text>
            </Pressable>
          </View>

          <View className="mt-[19px] mb-[32px] flex w-full flex-col items-center gap-2 rounded-[4px] bg-[#03EA8926] px-[17px] py-[21px] text-center">
            <ThemedText
              darkColor={theme.text}
              className="text-[14px] text-center text-[#0C4D2E]"
            >
              You Are Officially The Captain Of This Ball Session!
            </ThemedText>
            <ThemedText
              darkColor={theme.text}
              className="text-[11px] text-[#0C4D2E]"
            >
              You Have [Timer] Before Your Session Is Cancelled
            </ThemedText>
            <ThemedText
              darkColor={theme.text}
              className="text-[11px] text-[#0C4D2E]"
            >
              Team Names Will Be Assigned Randomly
            </ThemedText>
          </View>

          <SectionCard title="Tournament Rules">
            <RuleListField
              items={rules}
              isDark={isDark}
              onAdd={(v) => setRules((prev) => [...prev, v])}
              onRemove={(i) =>
                setRules((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
          </SectionCard>

          <View className="mt-[30px] items-center">
            <TouchableOpacity
              className="rounded-[5px] bg-[#67F095] px-[28px] py-[15px]"
              onPress={handleCreateTournament}
              disabled={loading}
            >
              <Text className="text-[14px] font-[500] text-black">
                {loading ? "Creating..." : "Create Tournament"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Loader visible={loading} />
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
