import { logOut } from "@/api/authThunks";
import store, { persistor } from "@/redux/store";
import { router } from "expo-router";

export async function handleLogout() {
  try {
    await store.dispatch(logOut());
    // Do NOT call persistor.purge() — it wipes isRegistered from AsyncStorage,
    // causing the app to treat a returning user as brand new on next open.
    router.replace("/(onboarding)/signin");
  } catch (error) {
    console.log("Logout failed:", error);
  }
}
