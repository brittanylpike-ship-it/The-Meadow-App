import { toMeadowMemorySupabaseMutation } from "@/features/memory/supabase-memory-mapper.mjs";
import { hasSupabaseConfig, supabase } from "@/services/supabase";
import type { MeadowState } from "@/features/memory/evergreen-tree-memory.mjs";

export async function syncMeadowMemory(state: MeadowState) {
  if (!hasSupabaseConfig || !supabase) {
    return;
  }

  const mutation = toMeadowMemorySupabaseMutation(state);

  const operations = [
    supabase.from("world_state").upsert(mutation.worldState, { onConflict: "user_id" }),
    supabase.from("chapter_state").upsert(mutation.chapterState, { onConflict: "user_id,chapter_id" }),
    supabase.from("ritual_state").upsert(mutation.ritualState, { onConflict: "user_id,ritual_id" }),
    supabase.from("ritual_visits").insert(mutation.ritualVisit),
    supabase.from("ritual_choices").insert([mutation.thoughtChoice, mutation.contextChoice]),
    supabase.from("memory_objects").insert(mutation.memoryObject),
    supabase.from("memory_garden_items").upsert(mutation.memoryGardenItems, { onConflict: "user_id,memory_object_id,item_kind" })
  ];

  const results = await Promise.all(operations);
  const failure = results.find((result) => result.error);

  if (failure?.error) {
    throw failure.error;
  }
}

export async function syncEvergreenMemory(state: MeadowState) {
  return syncMeadowMemory(state);
}
