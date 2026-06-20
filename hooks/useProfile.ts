import React from "react";

import { useAuth } from "@/features/auth/auth-context";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type MeadowProfile = {
  id: string;
  email: string | null;
  display_name?: string | null;
  pronouns?: string | null;
  bio?: string | null;
  created_at?: string | null;
  current_chapter?: number | null;
  journey_complete?: boolean | null;
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<MeadowProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);

    if (!hasSupabaseConfig || !supabase || !user) {
      setProfile(localProfileFor(user));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;

      setProfile((data as MeadowProfile | null) ?? localProfileFor(user));
    } catch {
      setProfile(localProfileFor(user));
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { profile, loading, refresh };
}

function localProfileFor(user: { id: string; email: string } | null): MeadowProfile | null {
  if (!user) return null;

  const name = user.email.split("@")[0]?.replace(/[._-]+/g, " ") || "Meadow Friend";
  return {
    id: user.id,
    email: user.email,
    display_name: titleCase(name),
    pronouns: null,
    bio: "Finding my way back to myself, one breath at a time.",
    created_at: new Date(Date.now() - 8 * 86_400_000).toISOString(),
    current_chapter: 2,
    journey_complete: false,
  };
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
