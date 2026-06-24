import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { hasSupabaseConfig, supabase } from "@/services/supabase";

type MeadowUser = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: MeadowUser | null;
  loading: boolean;
  mode: "supabase" | "local";
  enterCreatorPreview: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SESSION_KEY = "the_meadow_session";
const CREATOR_PREVIEW_EMAIL = "creator@qa.local";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeadowUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restore() {
      try {
        const stored = await readLocalSession();
        if (stored && isSeededQaSession(stored)) {
          if (mounted) {
            setUser(JSON.parse(stored) as MeadowUser);
          }
          return;
        }

        if (hasSupabaseConfig && supabase) {
          const { data } = await supabase.auth.getSession();
          const sessionUser = data.session?.user;
          if (mounted && sessionUser?.email) {
            setUser({ id: sessionUser.id, email: sessionUser.email });
          }
        } else {
          if (mounted && stored) {
            setUser(JSON.parse(stored) as MeadowUser);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    restore();

    const subscription = hasSupabaseConfig && supabase
      ? supabase.auth.onAuthStateChange(async (_event, session) => {
          const sessionUser = session?.user;
          if (mounted && sessionUser?.email) {
            setUser({ id: sessionUser.id, email: sessionUser.email });
          } else if (mounted) {
            const stored = await readLocalSession();
            if (stored && isSeededQaSession(stored)) {
              setUser(JSON.parse(stored) as MeadowUser);
              return;
            }

            setUser(null);
          }
        }).data.subscription
      : null;

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      mode: hasSupabaseConfig ? "supabase" : "local",
      async enterCreatorPreview() {
        if (process.env.NODE_ENV === "production") {
          return;
        }

        const localUser = { id: normalizeLocalUserId(CREATOR_PREVIEW_EMAIL), email: CREATOR_PREVIEW_EMAIL };
        await writeLocalSession(JSON.stringify(localUser));
        setUser(localUser);
      },
      async signIn(email: string, password: string) {
        if (hasSupabaseConfig && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (data.user?.email) {
            setUser({ id: data.user.id, email: data.user.email });
          }
          return;
        }

        const localUser = { id: normalizeLocalUserId(email), email };
        await writeLocalSession(JSON.stringify(localUser));
        setUser(localUser);
      },
      async signUp(email: string, password: string) {
        if (hasSupabaseConfig && supabase) {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          if (data.user?.email) {
            setUser({ id: data.user.id, email: data.user.email });
          }
          return;
        }

        const localUser = { id: normalizeLocalUserId(email), email };
        await writeLocalSession(JSON.stringify(localUser));
        setUser(localUser);
      },
      async signOut() {
        if (hasSupabaseConfig && supabase) {
          await supabase.auth.signOut();
        }

        await clearLocalSession();
        setUser(null);
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

function normalizeLocalUserId(email: string) {
  return `local_${email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
}

async function readLocalSession() {
  if (process.env.EXPO_OS === "web" && typeof globalThis.localStorage !== "undefined") {
    return globalThis.localStorage.getItem(SESSION_KEY);
  }

  return SecureStore.getItemAsync(SESSION_KEY);
}

async function writeLocalSession(value: string) {
  if (process.env.EXPO_OS === "web" && typeof globalThis.localStorage !== "undefined") {
    globalThis.localStorage.setItem(SESSION_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, value);
}

async function clearLocalSession() {
  if (process.env.EXPO_OS === "web" && typeof globalThis.localStorage !== "undefined") {
    globalThis.localStorage.removeItem(SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}

function isSeededQaSession(storedSession: string) {
  try {
    const parsed = JSON.parse(storedSession) as { email?: string };
    return parsed.email?.endsWith("@qa.local") ?? false;
  } catch {
    return false;
  }
}
