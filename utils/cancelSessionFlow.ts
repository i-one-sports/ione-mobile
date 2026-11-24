import { Alert } from "react-native";
import { cancelSession } from "@/api/sessions";
import { type AppDispatch } from "@/redux/store";

/**
 * "Cancel session" for the captain (session screen) and the pitch owner
 * (admin session screen): confirm, POST /sessions/cancel/:id, then show the
 * server's message (it says whether refunds were requested or some failed).
 * The session stays, marked CANCELLED; every paid member is refunded.
 */
export function confirmCancelSession(
  dispatch: AppDispatch,
  {
    sessionId,
    paid,
    onCancelled,
  }: {
    sessionId: string;
    /** Paid session: warn that everyone who paid gets refunded. */
    paid: boolean;
    /** Reload the screen's session after a successful cancel. */
    onCancelled: () => void;
  },
) {
  Alert.alert(
    "Cancel session?",
    paid
      ? "Everyone in this session will be told it's cancelled. Everyone who paid will be refunded; refunds can take up to 10 business days. You can't undo this."
      : "Everyone in this session will be told it's cancelled. You can't undo this.",
    [
      { text: "Keep session", style: "cancel" },
      {
        text: "Cancel session",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await dispatch(cancelSession(sessionId)).unwrap();
            onCancelled();
            Alert.alert(
              "Session cancelled",
              typeof result?.message === "string" &&
                result.message !== "Session cancelled"
                ? result.message
                : "The session has been cancelled.",
            );
          } catch (err: any) {
            // e.g. "Session is already cancelled" (the server may have
            // auto-cancelled it a moment ago): reload so the screen shows it.
            onCancelled();
            Alert.alert(
              "Session not cancelled",
              typeof err?.msg === "string"
                ? err.msg
                : "We couldn't cancel this session. Please try again.",
            );
          }
        },
      },
    ],
    { cancelable: true },
  );
}
