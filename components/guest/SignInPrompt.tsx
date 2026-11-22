import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import store from "@/redux/store";
import { setReturnRoute } from "@/utils/pendingDeepLink";

// Guests can browse; anything that needs an account (join, book, pay,
// create, vote, officiate...) asks them to sign in first, then brings them
// back to the same screen (see the auth effect in app/_layout.tsx).
//
//   const requireSignIn = useRequireSignIn();
//   onPress={() => requireSignIn("join this session") && join()}

type RequireSignIn = (action?: string) => boolean;

const SignInPromptContext = createContext<RequireSignIn>(() => true);

export const useRequireSignIn = () => useContext(SignInPromptContext);

export function SignInPromptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDark = useColorScheme() === "dark";
  // Keeps "Not now" above the phone's navigation buttons / home indicator.
  const { bottom } = useSafeAreaInsets();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const here = useRef({ pathname, params });
  here.current = { pathname, params };
  const [action, setAction] = useState<string | null>(null);

  const requireSignIn = useCallback<RequireSignIn>((what = "continue") => {
    if (store.getState().auth.isAuthenticated) return true;
    setAction(what);
    return false;
  }, []);

  const go = (path: "/(onboarding)/signin" | "/(onboarding)/role") => {
    const stringParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(here.current.params))
      if (typeof v === "string") stringParams[k] = v;
      else if (Array.isArray(v) && v[0]) stringParams[k] = v[0];
    setReturnRoute({ pathname: here.current.pathname, params: stringParams });
    setAction(null);
    router.push(path);
  };

  const text = isDark ? "#fff" : "#111";
  const muted = isDark ? "#9BA1A6" : "#6D717F";
  const accent = isDark ? "#00FF94" : "#00A85A";

  return (
    <SignInPromptContext.Provider value={requireSignIn}>
      {children}
      <Modal
        visible={action != null}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setAction(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
          onPress={() => setAction(null)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: isDark ? "#151515" : "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: bottom + 16,
              gap: 16,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 40,
                height: 5,
                borderRadius: 3,
                backgroundColor: isDark ? "#2a2a2a" : "#E5E7EB",
              }}
            />
            <View style={{ gap: 8, alignItems: "center" }}>
              <Text
                style={{
                  color: text,
                  fontSize: 20,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                Sign in to {action}
              </Text>
              <Text
                style={{
                  color: muted,
                  fontSize: 14,
                  lineHeight: 20,
                  textAlign: "center",
                }}
              >
                You need an i-One account to join, book or pay. Browsing
                pitches, sessions and tournaments is free.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => go("/(onboarding)/signin")}
              accessibilityRole="button"
              style={{
                paddingVertical: 16,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor: "#1DE98B",
              }}
            >
              <Text style={{ color: "#000", fontSize: 16, fontWeight: "700" }}>
                Sign in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => go("/(onboarding)/role")}
              accessibilityRole="button"
              style={{
                paddingVertical: 16,
                borderRadius: 10,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: accent,
              }}
            >
              <Text style={{ color: accent, fontSize: 16, fontWeight: "600" }}>
                Create account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAction(null)}
              accessibilityRole="button"
              hitSlop={8}
              style={{ alignItems: "center", paddingVertical: 12 }}
            >
              <Text style={{ color: muted, fontSize: 15, fontWeight: "600" }}>
                Not now
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SignInPromptContext.Provider>
  );
}
