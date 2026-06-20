import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getMeadowHomeReturnState } from "../features/chapters/frozen-ground-return-summary.mjs";
import { saveCrossroadsRitualMemory, crossroadsRituals } from "../features/memory/crossroads-memory.mjs";
import { createEmptyMeadowState, saveEvergreenMemory } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFirstBloomRitualMemory, firstBloomRituals } from "../features/memory/first-bloom-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";
import { getJournalMemoryArchive } from "../features/memory/journal-memory-archive.mjs";
import {
  buildMemoryGardenItems,
  getMemoryGardenEntry,
  getMemoryGardenReturnState,
  isMemoryGardenUnlocked,
} from "../features/memory/memory-garden.mjs";
import { saveMoorsRitualMemory, moorsRituals } from "../features/memory/moors-memory.mjs";
import { saveStormGardenRitualMemory, stormGardenRituals } from "../features/memory/storm-garden-memory.mjs";
import { toMeadowMemorySupabaseMutation } from "../features/memory/supabase-memory-mapper.mjs";

function completeFrozenGround() {
  let state = createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z");
  state = saveEvergreenMemory(state, {
    thought: "I still wait.",
    context: "Morning",
    offering: "The branch held the morning.",
    createdAt: "2026-06-12T09:01:00.000Z",
  });
  state = saveFrozenGroundRitualMemory(state, "frosted_window", {
    response: "A small light in the room.",
    detail: "The window cleared a little.",
    createdAt: "2026-06-12T09:02:00.000Z",
  });
  state = saveFrozenGroundRitualMemory(state, "frozen_pond", {
    response: "A feeling I have not touched.",
    detail: "The pond held the ache.",
    createdAt: "2026-06-12T09:03:00.000Z",
  });
  state = saveFrozenGroundRitualMemory(state, "quiet_hour", {
    response: "Beside a small light.",
    detail: "The hour stayed with me.",
    createdAt: "2026-06-12T09:04:00.000Z",
  });
  return saveFrozenGroundRitualMemory(state, "footprints", {
    response: "I came back.",
    detail: "The path remembered.",
    createdAt: "2026-06-12T09:05:00.000Z",
  });
}

function completeStormGarden() {
  let state = completeFrozenGround();
  for (const [index, ritual] of stormGardenRituals.entries()) {
    state = saveStormGardenRitualMemory(state, ritual.id, {
      response: ritual.options[0],
      detail: `storm memory ${index + 1}`,
      createdAt: `2026-06-12T10:0${index}:00.000Z`,
    });
  }
  return state;
}

function completeCrossroads() {
  let state = completeStormGarden();
  for (const [index, ritual] of crossroadsRituals.entries()) {
    state = saveCrossroadsRitualMemory(state, ritual.id, {
      response: ritual.options[0],
      detail: `crossroads memory ${index + 1}`,
      createdAt: `2026-06-12T11:0${index}:00.000Z`,
    });
  }
  return state;
}

function completeMoors() {
  let state = completeCrossroads();
  for (const [index, ritual] of moorsRituals.entries()) {
    state = saveMoorsRitualMemory(state, ritual.id, {
      response: ritual.options[0],
      detail: `moors memory ${index + 1}`,
      createdAt: `2026-06-12T12:0${index}:00.000Z`,
    });
  }
  return state;
}

function completeFirstBloom() {
  let state = completeMoors();
  for (const [index, ritual] of firstBloomRituals.entries()) {
    state = saveFirstBloomRitualMemory(state, ritual.id, {
      response: ritual.options[0],
      detail: `first bloom memory ${index + 1}`,
      createdAt: `2026-06-12T13:0${index}:00.000Z`,
    });
  }
  return state;
}

test("Memory Garden opens only after First Bloom is held", () => {
  const before = completeMoors();
  const after = completeFirstBloom();

  assert.equal(isMemoryGardenUnlocked(before), false);
  assert.equal(getMemoryGardenEntry(before).available, false);
  assert.equal(getMemoryGardenEntry(before).route, "/first-bloom");
  assert.equal(isMemoryGardenUnlocked(after), true);
  assert.equal(getMemoryGardenEntry(after).available, true);
  assert.equal(getMemoryGardenEntry(after).route, "/memory-garden");
});

test("Memory Garden generates landscape items only from stored memories", () => {
  const state = completeFirstBloom();
  const items = buildMemoryGardenItems(state);
  const memoryIds = new Set(state.memoryObjects.map((memory) => memory.id));

  assert.equal(items.filter((item) => item.kind === "seed").length, state.memoryObjects.length);
  assert.equal(items.every((item) => memoryIds.has(item.memoryId)), true);
  assert.equal(items.some((item) => item.kind === "flower" && item.memoryType === "growth"), true);
  assert.equal(items.some((item) => item.kind === "flower" && item.memoryType === "survival"), true);
  assert.equal(items.some((item) => item.kind === "root" && item.connectionKey === "cross-chapter"), true);
  assert.equal(items.some((item) => item.kind === "tree" && item.chapterId === "first_bloom"), true);
  assert.equal(items.some((item) => item.kind === "lantern" && item.witnesses.includes("owl")), true);
  assert.equal(items.some((item) => item.kind === "stone" && item.memoryType === "integration"), true);
});

test("Memory Garden return state is a place, not a dashboard", () => {
  const state = completeFirstBloom();
  const garden = getMemoryGardenReturnState(state);

  assert.equal(garden.unlocked, true);
  assert.equal(garden.title, "The Memory Garden");
  assert.equal(garden.evolutionState, "young_garden");
  assert.equal(garden.intro, "The garden has begun to grow from what the Meadow remembers.");
  assert.equal(garden.sections.map((section) => section.id).join(","), "seeds,flowers,roots,trees,lanterns,stones");
  assert.doesNotMatch(garden.intro, /\d|%|score|level|achievement|streak/i);
});

test("Journal offers the Memory Garden while the six-tab shell includes the garden", () => {
  const state = completeFirstBloom();
  const archive = getJournalMemoryArchive(state);
  const home = getMeadowHomeReturnState(state);

  assert.equal(getMemoryGardenEntry(state).buttonLabel, "Enter Memory Garden");
  assert.equal(archive[0].route, "/integration");
  assert.equal(home.route, "/integration");
});

test("Supabase mutation includes generated Memory Garden rows for persistence", () => {
  const state = completeFirstBloom();
  const mutation = toMeadowMemorySupabaseMutation(state);

  assert.equal(mutation.memoryGardenItems.length > state.memoryObjects.length, true);
  assert.equal(mutation.memoryGardenItems.every((row) => row.user_id === state.userId), true);
  assert.equal(mutation.memoryGardenItems.some((row) => row.item_kind === "seed"), true);
  assert.equal(mutation.memoryGardenItems.some((row) => row.item_kind === "lantern"), true);
});

test("Supabase migration creates Memory Garden persistence table", () => {
  const migration = readFileSync("supabase/migrations/202606120001_mvp_01_memory_backbone.sql", "utf8");

  assert.match(migration, /create table if not exists public\.memory_garden_items/);
  assert.match(migration, /unique \(user_id, memory_object_id, item_kind\)/);
});
