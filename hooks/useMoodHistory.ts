import React from "react";

import { useAuth } from "@/features/auth/auth-context";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type MoodEntry = {
  id: string;
  mood: string;
  created_at: string;
  title?: string | null;
  content_preview?: string | null;
};

type JournalEntryRow = {
  id: string;
  mood: string | null;
  created_at: string;
  body: string | null;
};

const fallbackMoodHistory: MoodEntry[] = [
  {
    id: "local-heavy",
    mood: "heavy",
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
    content_preview: "Today felt like carrying stones...",
  },
  {
    id: "local-tender",
    mood: "tender",
    created_at: new Date(Date.now() - 172_800_000).toISOString(),
    content_preview: "Something small moved me today...",
  },
  {
    id: "local-quiet",
    mood: "quiet",
    created_at: new Date(Date.now() - 259_200_000).toISOString(),
    content_preview: "I sat by the window for a long time...",
  },
  {
    id: "local-hopeful",
    mood: "hopeful",
    created_at: new Date(Date.now() - 345_600_000).toISOString(),
    content_preview: "I noticed something light today...",
  },
  {
    id: "local-numb",
    mood: "numb",
    created_at: new Date(Date.now() - 432_000_000).toISOString(),
    content_preview: "Nothing much. I got through it.",
  },
  {
    id: "local-okay",
    mood: "okay",
    created_at: new Date(Date.now() - 518_400_000).toISOString(),
    content_preview: "An ordinary day. That is enough.",
  },
];

export function useMoodHistory() {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = React.useState<MoodEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);

    if (!hasSupabaseConfig || !supabase || !user) {
      setMoodHistory(fallbackMoodHistory);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id,mood,created_at,body")
        .eq("user_id", user.id)
        .not("mood", "is", null)
        .order("created_at", { ascending: false })
        .limit(60);

      if (error) {
        throw error;
      }

      setMoodHistory(((data ?? []) as JournalEntryRow[]).map(toMoodEntry));
    } catch {
      setMoodHistory(fallbackMoodHistory);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { moodHistory, loading, refresh };
}

function toMoodEntry(entry: JournalEntryRow): MoodEntry {
  return {
    id: entry.id,
    mood: entry.mood ?? "quiet",
    created_at: entry.created_at,
    content_preview: entry.body?.slice(0, 80) ?? null,
  };
}
