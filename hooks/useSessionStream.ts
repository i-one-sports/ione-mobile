import { useEffect, useRef, useState } from "react";
import EventSource from "react-native-sse";
import * as SecureStore from "expo-secure-store";
import { PoolSnapshot } from "@/components/typings/payment";

/** Each member's payment on GET /sessions/:sessionId/stream. */
export type MemberPayment =
  | "PAID"
  | "PENDING"
  | "COVERED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | null;

export interface SessionSnapshot {
  sessionId: string;
  maxNumber: number;
  isFull: boolean;
  status: "OPEN" | "CANCELLED" | "COMPLETED" | "REFUNDED";
  paymentRequired: boolean;
  paymentMode: "PER_PERSON" | "POOL" | null;
  paymentStatus: "NOT_INITIATED" | "PENDING" | "COMPLETED" | "EXPIRED";
  paymentDeadline?: string | null;
  members: { userId: string; name: string; payment: MemberPayment }[];
  paidCount: number;
  owingCount: number;
  coveredCount: number;
  pool: PoolSnapshot | null;
}

export type SessionUpdateReason =
  | "joined"
  | "member_left"
  | "billing_opened"
  | "paid"
  | "refund_requested"
  | "refunded"
  | "teams_ready"
  | "cancelled"
  | "pool_opened"
  | "reserved"
  | "reservation_released"
  | "recomputed";

/**
 * Live session state from GET /sessions/:sessionId/stream (members, each
 * member's payment, counts, pool). Every message carries the whole state, so
 * we keep the latest; onUpdate gets the reason for side effects (reloads).
 * Only members, the pitch owner or a super-admin may connect.
 */
export default function useSessionStream(
  sessionId: string | undefined,
  enabled: boolean,
  onUpdate?: (reason: SessionUpdateReason) => void,
) {
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [connected, setConnected] = useState(false);

  // Latest callback without reconnecting when it changes.
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    if (!sessionId || !enabled) return;

    let es: EventSource | null = null;
    let cancelled = false;

    const connect = async () => {
      const token = await SecureStore.getItemAsync("i-one");
      if (cancelled) return;

      es = new EventSource(
        `${process.env.EXPO_PUBLIC_API_URL}/i-one/sessions/${sessionId}/stream`,
        {
          withCredentials: true,
          headers: {
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      es.addEventListener("open", () => setConnected(true));

      es.addEventListener("message", (event) => {
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);
          if (
            (data.type === "session_snapshot" ||
              data.type === "session_update") &&
            data.snapshot
          ) {
            setSnapshot(data.snapshot);
            if (data.type === "session_update" && data.reason) {
              onUpdateRef.current?.(data.reason);
            }
          }
        } catch {
          // ignore malformed messages
        }
      });

      es.addEventListener("error", () => setConnected(false));
    };

    connect();

    return () => {
      cancelled = true;
      es?.removeAllEventListeners();
      es?.close();
      setConnected(false);
    };
  }, [sessionId, enabled]);

  return { snapshot, connected };
}
