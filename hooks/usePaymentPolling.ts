import { useCallback, useEffect, useRef, useState } from "react";
import { PaymentStatus } from "@/components/typings/payment";

const TERMINAL_STATUSES: PaymentStatus[] = ["PAID", "FAILED", "REFUNDED"];
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120000;

interface UsePaymentPollingOptions {
  fetchFn: () => Promise<{ status: PaymentStatus } | null>;
  enabled: boolean;
  onSuccess?: () => void;
  onFailure?: () => void;
  onTimeout?: () => void;
}

export default function usePaymentPolling({
  fetchFn,
  enabled,
  onSuccess,
  onFailure,
  onTimeout,
}: UsePaymentPollingOptions) {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // Keep latest callback refs so poll never has to list them as dependencies
  const fetchFnRef = useRef(fetchFn);
  const onSuccessRef = useRef(onSuccess);
  const onFailureRef = useRef(onFailure);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  });
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });
  useEffect(() => {
    onFailureRef.current = onFailure;
  });
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // poll is stable — no callback deps, uses refs instead
  const poll = useCallback(async () => {
    if (!mountedRef.current) return;

    if (Date.now() - startTimeRef.current > POLL_TIMEOUT_MS) {
      stop();
      setTimedOut(true);
      onTimeoutRef.current?.();
      return;
    }

    try {
      const data = await fetchFnRef.current();
      if (!mountedRef.current) return;

      const newStatus = data?.status ?? null;
      if (newStatus) setStatus(newStatus);

      if (newStatus && TERMINAL_STATUSES.includes(newStatus)) {
        stop();
        if (newStatus === "PAID") onSuccessRef.current?.();
        else if (newStatus === "FAILED") onFailureRef.current?.();
      }
    } catch {
      // swallow polling errors silently
    }
  }, [stop]); // stop is stable (empty deps), so poll is stable

  useEffect(() => {
    if (!enabled) return;
    startTimeRef.current = Date.now();
    setTimedOut(false);
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => stop();
  }, [enabled, poll, stop]); // poll and stop are now both stable — effect only re-runs when enabled flips

  return { status, timedOut, stopPolling: stop };
}
