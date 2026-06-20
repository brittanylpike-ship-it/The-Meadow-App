import React from "react";

import { useAuth } from "@/features/auth/auth-context";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type RecentActivityEntry = {
  id: string;
  body: string | null;
  created_at: string;
};

export type ProfileMilestone = {
  id?: string;
  key: string;
  title: string;
  earned_at?: string | null;
};

export type JournalStats = {
  journalCount: number;
  daysActive: number;
  milestoneCount: number;
  recentEntries: RecentActivityEntry[];
  milestones: ProfileMilestone[];
};

export const devJournalStats: JournalStats = {
  journalCount: 12,
  daysActive: 8,
  milestoneCount: 3,
  recentEntries: [
    {
      id: "local-activity-1",
      body: "A quiet morning with tea and soft rain.",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "local-activity-2",
      body: "Grateful for the little things today.",
      created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "local-activity-3",
      body: "I stayed with myself for one more breath.",
      created_at: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    },
  ],
  milestones: [
    { id: "local-first", key: "first-ritual", title: "First Step" },
    { id: "local-diary", key: "dear-diary", title: "Dear Diary" },
    { id: "local-roots", key: "roots", title: "Roots" },
  ],
};

export function useJournalStats() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<JournalStats>(devJournalStats);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);

    if (!hasSupabaseConfig || !supabase || !user) {
      setStats(devJournalStats);
      setLoading(false);
      return;
    }

    try {
      const [journalCount, recentEntries, milestones] = await Promise.all([
        supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("journal_entries").select("id,body,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("milestones").select("id,key,title,earned_at").eq("user_id", user.id).order("earned_at", { ascending: false }),
      ]);

      if (journalCount.error) throw journalCount.error;
      if (recentEntries.error) throw recentEntries.error;
      if (milestones.error) throw milestones.error;

      setStats({
        journalCount: journalCount.count ?? 0,
        daysActive: devJournalStats.daysActive,
        milestoneCount: milestones.data?.length ?? 0,
        recentEntries: (recentEntries.data ?? []) as RecentActivityEntry[],
        milestones: (milestones.data ?? []) as ProfileMilestone[],
      });
    } catch {
      setStats(devJournalStats);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, loading, refresh };
}
