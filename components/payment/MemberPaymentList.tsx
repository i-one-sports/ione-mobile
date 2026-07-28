import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { PaymentStatus } from "@/components/typings/payment";
import PaymentStatusBadge from "./PaymentStatusBadge";

interface Member {
  _id: string;
  firstName: string;
  lastName?: string;
  nickname?: string;
  paymentStatus: PaymentStatus;
}

interface Props {
  members: Member[];
  isDark: boolean;
  accent: string;
  total?: number;
  paid?: number;
}

export default function MemberPaymentList({
  members,
  isDark,
  accent,
  total,
  paid,
}: Props) {
  const cardBg = isDark ? "#111" : "#F9FAFB";
  const cardBorder = isDark ? "#222" : "#F0F0F0";
  const mutedColor = isDark ? "#666" : "#999";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder },
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Players</ThemedText>
        {total !== undefined && paid !== undefined && (
          <Text style={[styles.counter, { color: accent }]}>
            {paid}/{total} paid
          </Text>
        )}
      </View>

      {members.map((member, i) => {
        const displayName = member.nickname || member.firstName || "Player";
        const initials = (member.firstName?.[0] ?? "P").toUpperCase();
        return (
          <View
            key={member._id}
            style={[
              styles.row,
              i < members.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: cardBorder,
              },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: `${accent}20` }]}>
              <Text style={[styles.avatarText, { color: accent }]}>
                {initials}
              </Text>
            </View>
            <Text style={[styles.name, { color: isDark ? "#fff" : "#111" }]}>
              {displayName}
            </Text>
            <PaymentStatusBadge status={member.paymentStatus} />
          </View>
        );
      })}

      {members.length === 0 && (
        <Text style={[styles.empty, { color: mutedColor }]}>
          No players yet
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  counter: {
    fontSize: 13,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  empty: {
    padding: 16,
    fontSize: 13,
    textAlign: "center",
  },
});
