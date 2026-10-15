import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/ui/CustomButton";
import { PoolSnapshot } from "@/components/typings/payment";
import { formatKoboAsNaira, koboToNaira, nairaToKobo } from "@/utils/currency";

interface Props {
  pool: PoolSnapshot;
  myUserId?: string;
  isDark: boolean;
  accent: string;
  paying: boolean;
  /** A checkout of ours is waiting for Paystack to confirm. */
  awaitingConfirmation: boolean;
  /** Amount in kobo (base, before commission). */
  onPay: (amountKobo: number) => void;
  onDone: () => void;
}

export default function PoolPaymentPanel({
  pool,
  myUserId,
  isDark,
  accent,
  paying,
  awaitingConfirmation,
  onPay,
  onDone,
}: Props) {
  const cardBg = isDark ? "#111" : "#F9FAFB";
  const cardBorder = isDark ? "#222" : "#F0F0F0";
  const mutedColor = isDark ? "#666" : "#999";
  const textColor = isDark ? "#fff" : "#111";

  const suggested = Math.min(pool.fairShare, pool.available);
  const [amountText, setAmountText] = useState("");
  const [touched, setTouched] = useState(false);

  // Pre-fill with the fair share until the player types their own amount.
  useEffect(() => {
    if (!touched && suggested > 0) {
      setAmountText(String(koboToNaira(suggested)));
    }
  }, [suggested, touched]);

  const amountKobo = nairaToKobo(Number(amountText.replace(/,/g, "")) || 0);
  // Below minContribution is only allowed when it exactly clears what's left.
  const validationError = (() => {
    if (!amountText) return null;
    if (amountKobo <= 0) return "Enter an amount";
    if (amountKobo > pool.available)
      return `You can pay at most ${formatKoboAsNaira(pool.available)} right now`;
    if (amountKobo < pool.minContribution && amountKobo !== pool.available)
      return `Minimum contribution is ${formatKoboAsNaira(pool.minContribution)}`;
    return null;
  })();
  const canPay =
    amountKobo > 0 && !validationError && !paying && !awaitingConfirmation;

  const pick = (kobo: number) => {
    setTouched(true);
    setAmountText(String(koboToNaira(kobo)));
  };

  const progress =
    pool.target > 0
      ? Math.min((pool.paid + pool.reserved) / pool.target, 1)
      : 0;
  const paidProgress =
    pool.target > 0 ? Math.min(pool.paid / pool.target, 1) : 0;

  const myTotal =
    pool.contributors.find((c) => c.userId === myUserId)?.amount ?? 0;

  return (
    <View>
      {/* Pot progress */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: cardBorder },
        ]}
      >
        <View style={styles.rowBetween}>
          <ThemedText style={styles.title}>Session pot</ThemedText>
          {pool.fullyFunded && (
            <View style={[styles.pill, { backgroundColor: "#0D2B1F" }]}>
              <Text
                style={{ color: "#00FF94", fontSize: 12, fontWeight: "700" }}
              >
                Fully paid
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.bigAmount, { color: textColor }]}>
          {formatKoboAsNaira(pool.paid)}
          <Text style={{ fontSize: 15, color: mutedColor, fontWeight: "500" }}>
            {"  "}of {formatKoboAsNaira(pool.target)}
          </Text>
        </Text>

        <View
          style={[
            styles.track,
            { backgroundColor: isDark ? "#222" : "#E5E7EB" },
          ]}
        >
          {/* Reserved (checkouts in progress) sits behind the paid portion */}
          <View
            style={[
              styles.fill,
              { width: `${progress * 100}%`, backgroundColor: "#FFB80080" },
            ]}
          />
          <View
            style={[
              styles.fill,
              { width: `${paidProgress * 100}%`, backgroundColor: accent },
            ]}
          />
        </View>

        <View style={[styles.rowBetween, { marginTop: 10 }]}>
          <Text style={{ color: mutedColor, fontSize: 13 }}>
            {pool.fullyFunded
              ? "The pitch is covered"
              : `${formatKoboAsNaira(pool.remaining)} remaining`}
          </Text>
          {pool.reserved > 0 && !pool.fullyFunded && (
            <Text style={{ color: "#FFB800", fontSize: 12 }}>
              {formatKoboAsNaira(pool.reserved)} being paid
            </Text>
          )}
        </View>

        {myTotal > 0 && (
          <Text style={{ color: accent, fontSize: 13, marginTop: 8 }}>
            {`You've put in ${formatKoboAsNaira(myTotal)}`}
          </Text>
        )}
      </View>

      {/* Contribute */}
      {pool.fullyFunded ? (
        <CustomButton primary title="Done" onPress={onDone} />
      ) : awaitingConfirmation ? (
        <View
          style={[
            styles.card,
            styles.infoRow,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <MaterialIcons name="hourglass-top" size={18} color="#FFB800" />
          <Text style={[styles.infoText, { color: mutedColor }]}>
            {
              "Waiting for Paystack to confirm your payment. The pot will update automatically. If you didn't finish paying, your share is released after 15 minutes."
            }
          </Text>
        </View>
      ) : pool.available <= 0 ? (
        <View
          style={[
            styles.card,
            styles.infoRow,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <MaterialIcons name="info-outline" size={18} color={mutedColor} />
          <Text style={[styles.infoText, { color: mutedColor }]}>
            {
              "Other players are paying the rest right now. If their payment doesn't go through, it frees up within 15 minutes."
            }
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <ThemedText style={styles.title}>
            {myTotal > 0 ? "Add more" : "Chip in"}
          </ThemedText>
          <Text style={{ color: mutedColor, fontSize: 12, marginTop: 4 }}>
            Pay any amount. One player can cover it all, or everyone can split
            it.
          </Text>

          <View
            style={[
              styles.inputWrap,
              {
                borderColor: validationError ? "#FF4444" : cardBorder,
                backgroundColor: isDark ? "#000" : "#fff",
              },
            ]}
          >
            <Text
              style={{ color: mutedColor, fontSize: 18, fontWeight: "700" }}
            >
              ₦
            </Text>
            <TextInput
              value={amountText}
              onChangeText={(t) => {
                setTouched(true);
                setAmountText(t.replace(/[^0-9]/g, ""));
              }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={mutedColor}
              style={[styles.input, { color: textColor }]}
            />
          </View>
          {validationError && (
            <Text style={{ color: "#FF4444", fontSize: 12, marginTop: 6 }}>
              {validationError}
            </Text>
          )}

          <View style={styles.quickRow}>
            {suggested > 0 && suggested < pool.available && (
              <TouchableOpacity
                onPress={() => pick(suggested)}
                style={[styles.quick, { borderColor: cardBorder }]}
              >
                <Text style={{ color: textColor, fontSize: 12 }}>
                  Fair share · {formatKoboAsNaira(suggested)}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => pick(pool.available)}
              style={[styles.quick, { borderColor: cardBorder }]}
            >
              <Text style={{ color: textColor, fontSize: 12 }}>
                Pay the rest · {formatKoboAsNaira(pool.available)}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: mutedColor, fontSize: 11, marginTop: 12 }}>
            A small service fee is added at checkout.
          </Text>

          <View style={{ marginTop: 14 }}>
            <CustomButton
              primary
              title={
                paying
                  ? "Opening Paystack..."
                  : `Pay ${formatKoboAsNaira(canPay ? amountKobo : 0)}`
              }
              onPress={() => onPay(amountKobo)}
              loading={paying}
              disabled={!canPay}
            />
          </View>
        </View>
      )}

      {/* Contributors */}
      {pool.contributors.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <ThemedText style={[styles.title, { marginBottom: 6 }]}>
            Contributions
          </ThemedText>
          {pool.contributors.map((c, i) => (
            <View
              key={c.userId}
              style={[
                styles.rowBetween,
                { paddingVertical: 10 },
                i < pool.contributors.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: cardBorder,
                },
              ]}
            >
              <Text style={{ color: textColor, fontSize: 13 }}>
                {c.userId === myUserId ? "You" : c.name}
              </Text>
              <Text
                style={{ color: textColor, fontSize: 13, fontWeight: "600" }}
              >
                {formatKoboAsNaira(c.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bigAmount: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 12,
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 12,
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 14,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  quick: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
