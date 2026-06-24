import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { router, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "react-native";

import { MeadowTabBar } from "@/components/meadow-tab-bar";
import { meadowTheme } from "@/constants/meadow-theme";
import { AuthProvider } from "@/features/auth/auth-context";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

const queryClient = new QueryClient();

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [authRouteResolved, setAuthRouteResolved] = React.useState(false);

  React.useEffect(() => {
    if (!authRouteResolved) {
      return;
    }

    void SplashScreen.hideAsync();
  }, [authRouteResolved]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthRouteObserver onResolved={() => setAuthRouteResolved(true)} />
        <StatusBar style="dark" backgroundColor={meadowTheme.colors.linen} />
        <View style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}>
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: meadowTheme.colors.linen },
              headerShadowVisible: false,
              headerStyle: { backgroundColor: meadowTheme.colors.linen },
              headerTintColor: meadowTheme.colors.ink,
              headerTitleStyle: { fontFamily: meadowTheme.fonts.header }
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="chapters" options={{ headerShown: false }} />
            <Stack.Screen name="journal/archive" options={{ title: "Journal Archive" }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="frozen-ground" options={{ title: "Frozen Ground" }} />
            <Stack.Screen name="evergreen-tree" options={{ title: "Evergreen Tree" }} />
            <Stack.Screen name="frosted-window" options={{ title: "Frosted Window" }} />
            <Stack.Screen name="frozen-pond" options={{ title: "Frozen Pond" }} />
            <Stack.Screen name="quiet-hour" options={{ title: "Quiet Hour" }} />
            <Stack.Screen name="footprints" options={{ title: "Footprints" }} />
            <Stack.Screen name="storm-garden" options={{ title: "Storm Garden" }} />
            <Stack.Screen name="lightning-tree" options={{ title: "Lightning Tree" }} />
            <Stack.Screen name="thorn-patch" options={{ title: "Thorn Patch" }} />
            <Stack.Screen name="floodwaters" options={{ title: "Floodwaters" }} />
            <Stack.Screen name="scorched-earth" options={{ title: "Scorched Earth" }} />
            <Stack.Screen name="shattered-mirror" options={{ title: "Shattered Mirror" }} />
            <Stack.Screen name="crossroads" options={{ title: "Crossroads" }} />
            <Stack.Screen name="worn-path" options={{ title: "Worn Path" }} />
            <Stack.Screen name="offering" options={{ title: "Offering" }} />
            <Stack.Screen name="candle" options={{ title: "Candle" }} />
            <Stack.Screen name="searching-for-signs" options={{ title: "Searching For Signs" }} />
            <Stack.Screen name="waiting-gate" options={{ title: "Waiting Gate" }} />
            <Stack.Screen name="the-moors" options={{ title: "The Moors" }} />
            <Stack.Screen name="canopy-cloak" options={{ title: "Canopy Cloak" }} />
            <Stack.Screen name="mire" options={{ title: "Mire" }} />
            <Stack.Screen name="bramble" options={{ title: "Bramble" }} />
            <Stack.Screen name="fog" options={{ title: "Fog" }} />
            <Stack.Screen name="vanishing-path" options={{ title: "Vanishing Path" }} />
            <Stack.Screen name="first-bloom" options={{ title: "First Bloom" }} />
            <Stack.Screen name="grounding" options={{ title: "Grounding" }} />
            <Stack.Screen name="opening" options={{ title: "Opening" }} />
            <Stack.Screen name="anchoring" options={{ title: "Anchoring" }} />
            <Stack.Screen name="emergence" options={{ title: "Emergence" }} />
            <Stack.Screen name="integration" options={{ title: "Integration" }} />
            <Stack.Screen name="memory-garden" options={{ title: "Memory Garden" }} />
            <Stack.Screen name="companions" options={{ title: "The Witnessing Companions" }} />
            <Stack.Screen name="winter-chapter" options={{ title: "Winter Chapter" }} />
            <Stack.Screen name="storm-chapter" options={{ title: "Storm Chapter" }} />
            <Stack.Screen name="journey-chapter" options={{ title: "Journey Chapter" }} />
            <Stack.Screen name="shadow-forest-chapter" options={{ title: "Shadow Forest Chapter" }} />
            <Stack.Screen name="spring-chapter" options={{ title: "Spring Chapter" }} />
            <Stack.Screen name="reflection-pool" options={{ title: "The Reflection Pool" }} />
            <Stack.Screen name="keepsake-box" options={{ title: "The Keepsake Box" }} />
            <Stack.Screen name="tea-rooms" options={{ title: "Tea Rooms" }} />
            <Stack.Screen name="greenhouse" options={{ title: "The Greenhouse" }} />
            <Stack.Screen name="post-office" options={{ title: "The Post Office" }} />
            <Stack.Screen name="post-detail" options={{ title: "The Letter" }} />
            <Stack.Screen name="courtyard" options={{ title: "The Courtyard" }} />
            <Stack.Screen name="hearth/moderation" options={{ title: "Moderation Queue" }} />
          </Stack>
          <MeadowTabBar />
        </View>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthRouteObserver({ onResolved }: { onResolved: () => void }) {
  const pathname = usePathname();

  React.useEffect(() => {
    let mounted = true;

    async function resolveInitialRoute() {
      const onboardingComplete = await AsyncStorage.getItem("meadow_onboarding_complete");
      const session = await readSessionSnapshot();
      const onboardingSatisfied = Boolean(onboardingComplete) || session.seededQa;

      if (!mounted) {
        return;
      }

      if (!onboardingSatisfied && !isPublicAuthPath(pathname)) {
        onResolved();
        router.replace("/onboarding");
        return;
      }

      if (session.hasSession && isPublicAuthPath(pathname) && pathname !== "/onboarding") {
        onResolved();
        router.replace("/(tabs)");
        return;
      }

      if (!session.hasSession && onboardingComplete && !isPublicAuthPath(pathname)) {
        onResolved();
        router.replace("/(auth)/login");
        return;
      }

      onResolved();
    }

    void resolveInitialRoute();

    const subscription = hasSupabaseConfig && supabase
      ? supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) {
            return;
          }

          const onboardingComplete = await AsyncStorage.getItem("meadow_onboarding_complete");
          const sessionSnapshot = await readSessionSnapshot();

          if ((session || sessionSnapshot.hasSession) && isPublicAuthPath(pathname)) {
            router.replace(onboardingComplete || sessionSnapshot.seededQa ? "/(tabs)" : "/onboarding");
            return;
          }

          if (sessionSnapshot.hasSession && !isPublicAuthPath(pathname)) {
            return;
          }

          if (isPublicAuthPath(pathname)) {
            return;
          }

          router.replace(onboardingComplete ? "/(auth)/login" : "/onboarding");
        }).data.subscription
      : null;

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [pathname]);

  return null;
}

async function readSessionSnapshot() {
  const storedSession = await readLocalSessionSnapshot();
  if (storedSession && isSeededQaSession(storedSession)) {
    return { hasSession: true, seededQa: true };
  }

  if (hasSupabaseConfig && supabase) {
    const { data } = await supabase.auth.getSession();
    return { hasSession: Boolean(data.session), seededQa: false };
  }

  return { hasSession: Boolean(storedSession), seededQa: false };
}

async function readLocalSessionSnapshot() {
  if (process.env.EXPO_OS === "web" && typeof globalThis.localStorage !== "undefined") {
    return globalThis.localStorage.getItem("the_meadow_session");
  }

  return SecureStore.getItemAsync("the_meadow_session");
}

function isSeededQaSession(storedSession: string | null) {
  if (!storedSession) {
    return false;
  }

  try {
    const parsed = JSON.parse(storedSession) as { email?: string };
    return parsed.email?.endsWith("@qa.local") ?? false;
  } catch {
    return false;
  }
}

function isPublicAuthPath(pathname: string) {
  return (
    pathname === "/auth" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/(auth)")
  );
}
