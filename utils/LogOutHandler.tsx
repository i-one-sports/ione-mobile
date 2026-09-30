import { logOut } from "@/api/authThunks";
import store, { persistor } from "@/redux/store";
import { router } from "expo-router";

export async function handleLogout() {
  try {
    await store.dispatch(logOut());
    await persistor.purge();
    router.replace("/(onboarding)/signin");
  } catch (error) {
    console.log("Logout failed:", error);
  }
}
