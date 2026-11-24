import { Alert } from "react-native";
import { router } from "expo-router";
import { deleteAccount } from "@/api/authThunks";
import { getMyCurrentSession } from "@/api/sessions";
import { persistor, type AppDispatch } from "@/redux/store";

// "Delete account" for players (Profile) and pitch owners (Settings):
// confirm, delete on the server, then clear local data and go back to the
// start of onboarding. If the server refuses (active session, tournament,
// wallet balance...), show its reason and keep the user signed in.
export function confirmDeleteAccount(
  dispatch: AppDispatch,
  setBusy: (busy: boolean) => void,
  isOwner = false,
) {
  const openCurrentSession = async () => {
    try {
      const current = await dispatch(getMyCurrentSession()).unwrap();
      if (current?._id) {
        router.push({
          pathname: "/joinsession",
          params: { sessionId: current._id },
        });
        return;
      }

      Alert.alert(
        "No current session",
        "You're not in a session any more. Try deleting your account again.",
      );
    } catch {
      Alert.alert(
        "Couldn't load your session",
        "Open the Sessions tab to find it.",
      );
    }
  };

  Alert.alert(
    "Delete account",
    "This permanently deletes your i-One account and signs you out. You can't undo this.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await dispatch(deleteAccount()).unwrap();
            await persistor.purge().catch(() => {});
            router.replace("/(onboarding)");
            Alert.alert(
              "Account deleted",
              "Your i-One account has been deleted.",
            );
          } catch (err: any) {
            setBusy(false);
            const reason =
              typeof err?.msg === "string"
                ? err.msg
                : err?.msg?.message ||
                  "We couldn't delete your account. Please try again.";
            // A shortcut to what's blocking it: the session the server counts
            // (GET /sessions/my-current uses the same rule as deletion), or
            // the wallet. Only owners have a wallet screen.
            const code = err?.details?.code;
            const shortcut =
              code === "IN_SESSION"
                ? { text: "View session", onPress: openCurrentSession }
                : isOwner &&
                    (code === "WALLET_BALANCE" || code === "WITHDRAWAL_PENDING")
                  ? {
                      text: "Go to wallet",
                      onPress: () => router.navigate("/admin/wallets"),
                    }
                  : null;
            // Wait for the full-screen loader to close first: iOS drops an
            // alert opened while a modal is still animating away.
            setTimeout(() => {
              Alert.alert(
                "Account not deleted",
                reason,
                shortcut
                  ? [{ text: "OK", style: "cancel" }, shortcut]
                  : undefined,
              );
            }, 500);
          }
        },
      },
    ],
    { cancelable: true },
  );
}
