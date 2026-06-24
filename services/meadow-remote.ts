import { buildMissingMeadowBootstrapRows, fromEvergreenSupabaseRows } from "@/features/memory/supabase-memory-loader.mjs";
import type { MeadowState } from "@/features/memory/evergreen-tree-memory.mjs";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

const EVERGREEN_TREE_ID = "evergreen_tree";

type MeadowRemoteUser = {
  id: string;
  email?: string | null;
};

export async function loadRemoteMeadowState(user: MeadowRemoteUser): Promise<MeadowState | null> {
  if (!hasSupabaseConfig || !supabase) {
    return null;
  }

  const now = new Date().toISOString();
  const rows = await fetchRemoteRows(supabase, user.id);
  const missing = buildMissingMeadowBootstrapRows(user, rows, now);
  const ritualStates = mergeRitualStateRows(rows.ritualStates, missing.ritualStates);

  await insertMissingRows(supabase, missing);

  return fromEvergreenSupabaseRows(
    user.id,
    {
      profile: rows.profile ?? missing.profile,
      worldState: rows.worldState ?? missing.worldState,
      chapterState: rows.chapterState ?? missing.chapterState,
      chapterStates: mergeChapterStateRows(rows.chapterStates, missing.chapterStates),
      ritualState: rows.ritualState ?? missing.ritualState,
      ritualStates,
      memoryObjects: rows.memoryObjects,
    },
    now
  );
}

async function fetchRemoteRows(client: typeof supabase, userId: string) {
  const [profile, worldState, chapterStates, ritualStates, memoryObjects] = await Promise.all([
    maybeSingle(client!.from("profiles").select("*").eq("id", userId)),
    maybeSingle(client!.from("world_state").select("*").eq("user_id", userId)),
    many(client!.from("chapter_state").select("*").eq("user_id", userId).order("updated_at", { ascending: true })),
    many(
      client!
        .from("ritual_state")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: true })
    ),
    many(
      client!
        .from("memory_objects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
    ),
  ]);
  const ritualState = ritualStates.find((row) => row.ritual_id === EVERGREEN_TREE_ID) ?? null;
  const chapterState = chapterStates.find((row) => row.chapter_id === "frozen_ground") ?? null;

  return {
    profile,
    worldState,
    chapterState,
    chapterStates,
    ritualState,
    ritualStates,
    memoryObjects,
  };
}

async function maybeSingle(query: { maybeSingle: () => PromiseLike<{ data: unknown; error: unknown }> }) {
  const { data, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }
  return data as Record<string, unknown> | null;
}

async function many(query: PromiseLike<{ data: unknown[] | null; error: unknown }>) {
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return (data ?? []) as Array<Record<string, unknown>>;
}

async function insertMissingRows(
  client: typeof supabase,
  missing: {
    profile: Record<string, unknown> | null;
    worldState: Record<string, unknown> | null;
    chapterState: Record<string, unknown> | null;
    chapterStates: Array<Record<string, unknown>>;
    ritualState: Record<string, unknown> | null;
    ritualStates: Array<Record<string, unknown>>;
  }
) {
  const operations: Array<PromiseLike<{ error: unknown }>> = [];

  if (missing.profile) {
    operations.push(client!.from("profiles").upsert(missing.profile, { onConflict: "id" }));
  }

  if (missing.worldState) {
    operations.push(client!.from("world_state").upsert(missing.worldState, { onConflict: "user_id" }));
  }

  if (missing.chapterState && !missing.chapterStates.length) {
    operations.push(client!.from("chapter_state").upsert(missing.chapterState, { onConflict: "user_id,chapter_id" }));
  }

  if (missing.chapterStates.length) {
    operations.push(client!.from("chapter_state").upsert(missing.chapterStates, { onConflict: "user_id,chapter_id" }));
  }

  if (missing.ritualStates.length) {
    operations.push(client!.from("ritual_state").upsert(missing.ritualStates, { onConflict: "user_id,ritual_id" }));
  } else if (missing.ritualState) {
    operations.push(client!.from("ritual_state").upsert(missing.ritualState, { onConflict: "user_id,ritual_id" }));
  }

  const results = await Promise.all(operations);
  const failure = results.find((result) => result.error);

  if (failure?.error) {
    throw failure.error;
  }
}

function mergeRitualStateRows(
  existingRows: Array<Record<string, unknown>>,
  missingRows: Array<Record<string, unknown>>
) {
  const rowsByRitualId = new Map<string, Record<string, unknown>>();

  for (const row of [...existingRows, ...missingRows]) {
    const ritualId = String(row.ritual_id ?? "");
    if (ritualId) {
      rowsByRitualId.set(ritualId, row);
    }
  }

  return [...rowsByRitualId.values()];
}

function mergeChapterStateRows(
  existingRows: Array<Record<string, unknown>>,
  missingRows: Array<Record<string, unknown>>
) {
  const rowsByChapterId = new Map<string, Record<string, unknown>>();

  for (const row of [...existingRows, ...missingRows]) {
    const chapterId = String(row.chapter_id ?? "");
    if (chapterId) {
      rowsByChapterId.set(chapterId, row);
    }
  }

  return [...rowsByChapterId.values()];
}
