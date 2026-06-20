import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getChapterMapDescription } from "../features/chapters/chapter-map-copy.mjs";
import { getMeadowHomeReturnState } from "../features/chapters/frozen-ground-return-summary.mjs";
import { saveCrossroadsRitualMemory, crossroadsRituals } from "../features/memory/crossroads-memory.mjs";
import { createEmptyMeadowState, saveEvergreenMemory } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";
import { getHearthStatus } from "../features/memory/hearth-status.mjs";
import { getJournalMemoryArchive } from "../features/memory/journal-memory-archive.mjs";
import { saveMoorsRitualMemory, moorsRituals } from "../features/memory/moors-memory.mjs";
import { saveStormGardenRitualMemory, stormGardenRituals } from "../features/memory/storm-garden-memory.mjs";
import {
  firstBloomLandmarks,
  firstBloomRituals,
  getFirstBloomChapterIntro,
  getFirstBloomLandmarkReturnSummary,
  getFirstBloomRitualReturnState,
  getFirstBloomRitualSaveCopy,
  isFirstBloomChapterComplete,
  markFirstBloomVisited,
  saveFirstBloomRitualMemory,
} from "../features/memory/first-bloom-memory.mjs";

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

test("First Bloom exposes the approved Sprint 06 rituals in order", () => {
  assert.deepEqual(
    firstBloomRituals.map((ritual) => [ritual.id, ritual.title]),
    [
      ["grounding", "Grounding"],
      ["opening", "Opening"],
      ["anchoring", "Anchoring"],
      ["emergence", "Emergence"],
      ["integration", "Integration"],
    ]
  );
  assert.deepEqual(firstBloomLandmarks.map((landmark) => landmark.route), [
    "/grounding",
    "/opening",
    "/anchoring",
    "/emergence",
    "/integration",
  ]);
});

test("First Bloom stays closed until The Moors is complete", () => {
  const state = completeCrossroads();
  const intro = getFirstBloomChapterIntro(state);

  assert.equal(state.chapterState.firstBloom.unlocked, false);
  assert.equal(intro.locked, true);
  assert.equal(intro.subtitle, "First Bloom waits beyond The Moors.");
  assert.equal(getChapterMapDescription("first_bloom", 0, true, true, true, true, false), "This path remains closed for now.");
});

test("First Bloom unlocks after Chapter Four is held", () => {
  const state = completeMoors();
  const intro = getFirstBloomChapterIntro(state);

  assert.equal(state.chapterState.firstBloom.unlocked, true);
  assert.equal(intro.locked, false);
  assert.equal(intro.title, "A soft place has opened");
  assert.equal(getChapterMapDescription("first_bloom", 0, true, true, true, true, true), "First Bloom is open. The world can hold growth without hurry.");
});

test("visiting First Bloom persists without creating a memory", () => {
  const state = markFirstBloomVisited(completeMoors(), "2026-06-12T13:00:00.000Z");

  assert.equal(state.chapterState.firstBloom.visitCount, 1);
  assert.equal(state.worldState.lastVisitedChapterId, "first_bloom");
  assert.equal(state.memoryObjects.length, 20);
});

test("First Bloom ritual memory updates ritual, chapter, world, and wildlife familiarity", () => {
  const before = completeMoors();
  const state = saveFirstBloomRitualMemory(before, "grounding", {
    response: "A root under the present moment.",
    detail: "A root found the ground beneath the fog.",
    createdAt: "2026-06-12T13:01:00.000Z",
  });

  assert.equal(state.chapterState.firstBloom.memoryCount, 1);
  assert.equal(state.chapterState.firstBloom.weatherState, "first_growth");
  assert.equal(state.worldState.lastVisitedChapterId, "first_bloom");
  assert.equal(state.worldState.lastVisitedRitualId, "grounding");
  assert.equal(state.worldState.wildlifeFamiliarity.robin, (before.worldState.wildlifeFamiliarity.robin || 0) + 1);
  assert.equal(state.worldState.wildlifeFamiliarity.bee, (before.worldState.wildlifeFamiliarity.bee || 0) + 1);
  assert.equal(state.ritualState.grounding.entries.length, 1);
  assert.equal(state.memoryObjects.at(-1).chapterId, "first_bloom");
  assert.equal(state.memoryObjects.at(-1).memoryType, "growth");
});

test("First Bloom return state grows without forcing resolution", () => {
  const state = saveFirstBloomRitualMemory(completeMoors(), "emergence", {
    response: "Something small came above the soil.",
    detail: "A first bloom appeared without asking me to be finished.",
    createdAt: "2026-06-12T13:04:00.000Z",
  });

  const returnState = getFirstBloomRitualReturnState(state, "emergence");

  assert.equal(returnState.hasReturned, true);
  assert.equal(returnState.entries[0].text, "A first bloom appeared without asking me to be finished.");
  assert.equal(returnState.visualState, "first_bloom");
  assert.equal(returnState.visualStateLabel, "A first bloom has appeared without hurrying the field.");
  assert.equal(returnState.witnessLabel, "A robin and a bee have witnessed this place.");
});

test("First Bloom completes only after all five rituals remember", () => {
  const state = completeFirstBloom();

  assert.equal(isFirstBloomChapterComplete(state), true);
  assert.equal(state.chapterState.firstBloom.chapterComplete, true);
  assert.equal(getFirstBloomChapterIntro(state).subtitle, "Chapter Five is held in soft growth.");
});

test("First Bloom landmark summaries route to remembered rituals", () => {
  const state = saveFirstBloomRitualMemory(completeMoors(), "integration", {
    response: "A living meadow can hold more than one season.",
    detail: "The meadow held winter, fog, and new growth together.",
    createdAt: "2026-06-12T13:05:00.000Z",
  });

  const summary = getFirstBloomLandmarkReturnSummary(state, "integration");

  assert.equal(summary.hasMemory, true);
  assert.equal(summary.buttonLabel, "Return to Integration");
  assert.equal(summary.route, "/integration");
  assert.equal(summary.description, "Integration remembers the meadow becoming one living place.");
});

test("First Bloom save buttons use place-specific language", () => {
  assert.equal(getFirstBloomRitualSaveCopy("grounding", false), "Let the roots hold this");
  assert.equal(getFirstBloomRitualSaveCopy("opening", true), "The bud is keeping it");
  assert.equal(getFirstBloomRitualSaveCopy("integration", false), "Let the meadow hold this together");
});

test("Home, Journal, and Hearth carry First Bloom memory forward", () => {
  const state = saveFirstBloomRitualMemory(completeMoors(), "opening", {
    response: "A bud that can stay closed until it is ready.",
    detail: "A bud loosened without becoming a demand.",
    createdAt: "2026-06-12T13:02:00.000Z",
  });

  const home = getMeadowHomeReturnState(state);
  const archive = getJournalMemoryArchive(state);
  const hearth = getHearthStatus(state, null);

  assert.equal(home.buttonLabel, "Return to Opening");
  assert.equal(home.route, "/opening");
  assert.equal(archive[0].place, "Opening");
  assert.equal(archive[0].witnessLabel, "A robin and a bee have witnessed this place.");
  assert.equal(hearth.latestMemoryLabel, "Latest held memory - Opening");
});

test("Supabase migration seeds First Bloom chapter and rituals", () => {
  const migration = readFileSync("supabase/migrations/202606120001_mvp_01_memory_backbone.sql", "utf8");

  assert.match(migration, /'first_bloom', 'First Bloom', 'Integration', 5, true/);
  for (const ritualId of ["grounding", "opening", "anchoring", "emergence", "integration"]) {
    assert.match(migration, new RegExp(`'${ritualId}', 'first_bloom'`));
  }
});
