import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getChapterMapDescription } from "../features/chapters/chapter-map-copy.mjs";
import { getMeadowHomeReturnState } from "../features/chapters/frozen-ground-return-summary.mjs";
import {
  createEmptyMeadowState,
  saveEvergreenMemory,
} from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";
import { getHearthStatus } from "../features/memory/hearth-status.mjs";
import { getJournalMemoryArchive } from "../features/memory/journal-memory-archive.mjs";
import {
  getStormGardenChapterIntro,
  getStormGardenLandmarkReturnSummary,
  getStormGardenRitualReturnState,
  getStormGardenRitualSaveCopy,
  isStormGardenChapterComplete,
  markStormGardenVisited,
  saveStormGardenRitualMemory,
  stormGardenLandmarks,
  stormGardenRituals,
} from "../features/memory/storm-garden-memory.mjs";

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

test("Storm Garden exposes the approved Sprint 03 rituals in order", () => {
  assert.deepEqual(
    stormGardenRituals.map((ritual) => [ritual.id, ritual.title]),
    [
      ["lightning_tree", "Lightning Tree"],
      ["thorn_patch", "Thorn Patch"],
      ["floodwaters", "Floodwaters"],
      ["scorched_earth", "Scorched Earth"],
      ["shattered_mirror", "Shattered Mirror"],
    ]
  );
  assert.deepEqual(stormGardenLandmarks.map((landmark) => landmark.route), [
    "/lightning-tree",
    "/thorn-patch",
    "/floodwaters",
    "/scorched-earth",
    "/shattered-mirror",
  ]);
});

test("Storm Garden stays closed until Frozen Ground is complete", () => {
  const state = createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z");
  const intro = getStormGardenChapterIntro(state);

  assert.equal(state.chapterState.stormGarden.unlocked, false);
  assert.equal(intro.locked, true);
  assert.equal(intro.subtitle, "Storm Garden waits beyond Chapter One.");
  assert.equal(getChapterMapDescription("storm_garden", 0, false, false), "This path remains closed for now.");
});

test("Storm Garden unlocks after Chapter One is held", () => {
  const state = completeFrozenGround();
  const intro = getStormGardenChapterIntro(state);

  assert.equal(state.chapterState.stormGarden.unlocked, true);
  assert.equal(intro.locked, false);
  assert.equal(intro.title, "The storm gate has opened");
  assert.equal(getChapterMapDescription("storm_garden", 0, false, true), "Storm Garden is open. The world can hold anger without turning it into harm.");
});

test("visiting Storm Garden persists without creating a memory", () => {
  const state = markStormGardenVisited(completeFrozenGround(), "2026-06-12T10:00:00.000Z");

  assert.equal(state.chapterState.stormGarden.visitCount, 1);
  assert.equal(state.worldState.lastVisitedChapterId, "storm_garden");
  assert.equal(state.worldState.totalMemories, 5);
  assert.equal(state.memoryObjects.length, 5);
});

test("Storm Garden ritual memory updates ritual, chapter, world, and crow familiarity", () => {
  const state = saveStormGardenRitualMemory(completeFrozenGround(), "lightning_tree", {
    response: "A sudden impact.",
    detail: "The lightning struck where I could finally name it.",
    createdAt: "2026-06-12T10:01:00.000Z",
  });

  assert.equal(state.chapterState.stormGarden.memoryCount, 1);
  assert.equal(state.chapterState.stormGarden.weatherState, "charged_rain");
  assert.equal(state.worldState.lastVisitedChapterId, "storm_garden");
  assert.equal(state.worldState.lastVisitedRitualId, "lightning_tree");
  assert.equal(state.worldState.wildlifeFamiliarity.crow, 1);
  assert.equal(state.ritualState.lightningTree.entries.length, 1);
  assert.equal(state.memoryObjects.at(-1).chapterId, "storm_garden");
  assert.equal(state.memoryObjects.at(-1).memoryType, "emotion");
});

test("Storm Garden return state names permanent environmental change", () => {
  const state = saveStormGardenRitualMemory(completeFrozenGround(), "thorn_patch", {
    response: "What caught underneath.",
    detail: "The thorns were protecting the hurt.",
    createdAt: "2026-06-12T10:02:00.000Z",
  });

  const returnState = getStormGardenRitualReturnState(state, "thorn_patch");

  assert.equal(returnState.hasReturned, true);
  assert.equal(returnState.entries[0].text, "The thorns were protecting the hurt.");
  assert.equal(returnState.visualState, "first_blooms");
  assert.equal(returnState.visualStateLabel, "A first bloom has appeared among the thorns.");
  assert.equal(returnState.witnessLabel, "A crow has witnessed this place.");
});

test("Storm Garden completes only after all five rituals remember", () => {
  const state = completeStormGarden();

  assert.equal(isStormGardenChapterComplete(state), true);
  assert.equal(state.chapterState.stormGarden.chapterComplete, true);
  assert.equal(getStormGardenChapterIntro(state).subtitle, "Chapter Two is held in the rain.");
});

test("Storm Garden landmark summaries route to remembered rituals", () => {
  const state = saveStormGardenRitualMemory(completeFrozenGround(), "floodwaters", {
    response: "The pressure rose.",
    detail: "The water remembered the pull.",
    createdAt: "2026-06-12T10:03:00.000Z",
  });

  const summary = getStormGardenLandmarkReturnSummary(state, "floodwaters");

  assert.equal(summary.hasMemory, true);
  assert.equal(summary.buttonLabel, "Return to Floodwaters");
  assert.equal(summary.route, "/floodwaters");
  assert.equal(summary.description, "Floodwaters remember the pressure and the channels it carved.");
});

test("Storm Garden save buttons use place-specific language", () => {
  assert.equal(getStormGardenRitualSaveCopy("lightning_tree", false), "Let the tree hold this strike");
  assert.equal(getStormGardenRitualSaveCopy("scorched_earth", true), "The earth is keeping it");
  assert.equal(getStormGardenRitualSaveCopy("shattered_mirror", false), "Let the mirror hold this reflection");
});

test("Home, Journal, and Hearth carry Storm Garden memory forward", () => {
  const state = saveStormGardenRitualMemory(completeFrozenGround(), "shattered_mirror", {
    response: "Where the anger pointed.",
    detail: "The mirror held the direction without throwing it back.",
    createdAt: "2026-06-12T10:04:00.000Z",
  });

  const home = getMeadowHomeReturnState(state);
  const archive = getJournalMemoryArchive(state);
  const hearth = getHearthStatus(state, null);

  assert.equal(home.buttonLabel, "Return to Shattered Mirror");
  assert.equal(home.route, "/shattered-mirror");
  assert.equal(archive[0].place, "Shattered Mirror");
  assert.equal(archive[0].witnessLabel, "A crow has witnessed this place.");
  assert.equal(hearth.latestMemoryLabel, "Latest held memory - Shattered Mirror");
});

test("Supabase migration seeds Storm Garden chapter and rituals", () => {
  const migration = readFileSync("supabase/migrations/202606120001_mvp_01_memory_backbone.sql", "utf8");

  assert.match(migration, /'storm_garden', 'Storm Garden', 'Anger', 2, true/);
  for (const ritualId of ["lightning_tree", "thorn_patch", "floodwaters", "scorched_earth", "shattered_mirror"]) {
    assert.match(migration, new RegExp(`'${ritualId}', 'storm_garden'`));
  }
});
