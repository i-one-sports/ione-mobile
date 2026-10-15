import { useEffect, useState } from "react";
import EventSource from "react-native-sse";
import * as SecureStore from "expo-secure-store";
import { PoolSnapshot } from "@/components/typings/payment";

/**
 * Live paid/remaining for a POOL session via
 * GET /wallet/session/:sessionId/payment-stream.
 *
 * Every event carries the full pool state (never a delta), and the first
 * event after a (re)connect is a fresh snapshot, so we just keep the latest.
 */
export default function usePoolStream(sessionId?: string, enabled = true) {
  const [snapshot, setSnapshot] = useState<PoolSnapshot | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId || !enabled) return;

    let es: EventSource | null = null;
    let cancelled = false;

    const connect = async () => {
      const token = await SecureStore.getItemAsync("i-one");
      if (cancelled) return;

      es = new EventSource(
        `${process.env.EXPO_PUBLIC_API_URL}/i-one/wallet/session/${sessionId}/payment-stream`,
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
            (data.type === "pool_snapshot" || data.type === "pool_update") &&
            data.snapshot
          ) {
            setSnapshot(data.snapshot);
          }
        } catch {
          // ignore malformed events
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
