import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyMeadowState, saveEvergreenMemory } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";
import { toEvergreenSupabaseMutation } from "../features/memory/supabase-memory-mapper.mjs";

test("maps Evergreen Tree state into approved Supabase memory backbone rows", () => {
  const initial = createEmptyMeadowState("9b2c6f0f-0000-4000-9000-000000000001", "2026-06-12T09:00:00.000Z");
  const state = saveEvergreenMemory(initial, {
    thought: "I still wait.",
    context: "Night",
    offering: "The porch light stayed on.",
    createdAt: "2026-06-12T09:10:00.000Z",
  });

  const mutation = toEvergreenSupabaseMutation(state);

  assert.equal(mutation.worldState.user_id, state.userId);
  assert.equal(mutation.worldState.total_memories, 1);
  assert.equal(mutation.chapterState.chapter_id, "frozen_ground");
  assert.equal(mutation.ritualState.ritual_id, "evergreen_tree");
  assert.match(mutation.memoryObject.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(mutation.memoryObject.memory_type, "thought");
  assert.equal(mutation.memoryObject.custom_text, "The porch light stayed on.");
  assert.equal(mutation.memoryObject.branch, state.ritualState.evergreenTree.tags[0].branch);
});

test("maps a remaining Frozen Ground ritual memory into Supabase backbone rows", () => {
  const initial = createEmptyMeadowState("9b2c6f0f-0000-4000-9000-000000000001", "2026-06-12T09:00:00.000Z");
  const state = saveFrozenGroundRitualMemory(initial, "frozen_pond", {
    response: "A quiet ache.",
    detail: "A word under the ice.",
    createdAt: "2026-06-12T09:20:00.000Z",
  });

  const mutation = toEvergreenSupabaseMutation(state);

  assert.equal(mutation.ritualState.ritual_id, "frozen_pond");
  assert.equal(mutation.ritualState.state.entries.length, 1);
  assert.equal(mutation.memoryObject.memory_type, "emotion");
  assert.equal(mutation.memoryObject.custom_text, "A word under the ice.");
  assert.equal(mutation.thoughtChoice.choice_value, "A quiet ache.");
  assert.equal(mutation.contextChoice.choice_value, "Frozen Pond");
});
