import { Alert } from "react-native";
import { router } from "expo-router";
import { deleteAccount } from "@/api/authThunks";
import { persistor, type AppDispatch } from "@/redux/store";

// "Delete account" for players (Profile) and pitch owners (Settings):
// confirm, delete on the server, then clear local data and go back to the
// start of onboarding. If the server refuses (active session, tournament,
// wallet balance...), show its reason and keep the user signed in.
export function confirmDeleteAccount(
  dispatch: AppDispatch,
  setBusy: (busy: boolean) => void,
) {
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
            Alert.alert("Account not deleted", reason);
          }
        },
      },
    ],
    { cancelable: true },
  );
}
