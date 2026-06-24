import React from "react";

import { useAuth } from "@/features/auth/auth-context";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type MemoryGardenEntryType = "photo" | "note" | "flower" | "voice";

export type MemoryGardenEntry = {
  id: string;
  user_id: string;
  type: MemoryGardenEntryType;
  content: string;
  caption: string | null;
  created_at: string;
};

type AddMemoryGardenEntry = {
  type: MemoryGardenEntryType;
  content: string;
  caption?: string | null;
};

const mockMemoryGardenEntries: MemoryGardenEntry[] = [
  {
    id: "mock-note-1",
    user_id: "local_mock",
    type: "note",
    content: "A small memory held gently beside the water.",
    caption: "Skip a Stone",
    created_at: "2026-06-12T09:00:00.000Z",
  },
  {
    id: "mock-note-2",
    user_id: "local_mock",
    type: "note",
    content: "I can let this move at its own pace.",
    caption: "Floating Leaf Boat",
    created_at: "2026-06-11T09:00:00.000Z",
  },
  {
    id: "mock-flower-1",
    user_id: "local_mock",
    type: "flower",
    content: "Rose",
    caption: "For what still blooms.",
    created_at: "2026-06-10T09:00:00.000Z",
  },
];

export function useMemoryGarden(typeFilter?: string) {
  const { user } = useAuth();
  const [entries, setEntries] = React.useState<MemoryGardenEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fallbackEntries = React.useMemo(() => filterEntries(mockMemoryGardenEntries, typeFilter), [typeFilter]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!hasSupabaseConfig || !supabase || !user) {
      setEntries(fallbackEntries);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("memory_garden")
        .select("id,user_id,type,content,caption,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (typeFilter && typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      const { data, error: queryError } = await query;
      if (queryError) {
        throw queryError;
      }

      setEntries((data ?? []) as MemoryGardenEntry[]);
    } catch (caught) {
      setError(getErrorMessage(caught));
      setEntries(fallbackEntries);
    } finally {
      setLoading(false);
    }
  }, [fallbackEntries, typeFilter, user]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const addEntry = React.useCallback(
    async (entry: AddMemoryGardenEntry) => {
      const localEntry: MemoryGardenEntry = {
        id: `local_${Date.now()}`,
        user_id: user?.id ?? "local_mock",
        type: entry.type,
        content: entry.content,
        caption: entry.caption ?? null,
        created_at: new Date().toISOString(),
      };

      if (!hasSupabaseConfig || !supabase || !user) {
        setEntries((current) => prependIfVisible(current, localEntry, typeFilter));
        return localEntry;
      }

      try {
        const { data, error: insertError } = await supabase
          .from("memory_garden")
          .insert({
            user_id: user.id,
            type: entry.type,
            content: entry.content,
            caption: entry.caption ?? null,
          })
          .select("id,user_id,type,content,caption,created_at")
          .single();

        if (insertError) {
          throw insertError;
        }

        const savedEntry = data as MemoryGardenEntry;
        setEntries((current) => prependIfVisible(current, savedEntry, typeFilter));
        return savedEntry;
      } catch (caught) {
        setError(getErrorMessage(caught));
        setEntries((current) => prependIfVisible(current, localEntry, typeFilter));
        return localEntry;
      }
    },
    [typeFilter, user]
  );

  const deleteEntry = React.useCallback(
    async (id: string) => {
      setEntries((current) => current.filter((entry) => entry.id !== id));

      if (!hasSupabaseConfig || !supabase || !user) {
        return;
      }

      try {
        const { error: deleteError } = await supabase.from("memory_garden").delete().eq("id", id).eq("user_id", user.id);
        if (deleteError) {
          throw deleteError;
        }
      } catch (caught) {
        setError(getErrorMessage(caught));
        void refresh();
      }
    },
    [refresh, user]
  );

  return { entries, loading, error, refresh, addEntry, deleteEntry };
}

function filterEntries(entries: MemoryGardenEntry[], typeFilter?: string) {
  if (!typeFilter || typeFilter === "all") {
    return entries;
  }

  return entries.filter((entry) => entry.type === typeFilter);
}

function prependIfVisible(entries: MemoryGardenEntry[], entry: MemoryGardenEntry, typeFilter?: string) {
  if (typeFilter && typeFilter !== "all" && entry.type !== typeFilter) {
    return entries;
  }

  return [entry, ...entries.filter((current) => current.id !== entry.id)];
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "The garden is keeping this locally for now.";
}
