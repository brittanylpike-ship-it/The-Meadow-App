import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getChapterMapDescription } from "../features/chapters/chapter-map-copy.mjs";
import { getMeadowHomeReturnState } from "../features/chapters/frozen-ground-return-summary.mjs";
import { createEmptyMeadowState, saveEvergreenMemory } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";
import { getHearthStatus } from "../features/memory/hearth-status.mjs";
import { getJournalMemoryArchive } from "../features/memory/journal-memory-archive.mjs";
import {
  saveStormGardenRitualMemory,
  stormGardenRituals,
} from "../features/memory/storm-garden-memory.mjs";
import {
  crossroadsLandmarks,
  crossroadsRituals,
  getCrossroadsChapterIntro,
  getCrossroadsLandmarkReturnSummary,
  getCrossroadsRitualReturnState,
  getCrossroadsRitualSaveCopy,
  isCrossroadsChapterComplete,
  markCrossroadsVisited,
  saveCrossroadsRitualMemory,
} from "../features/memory/crossroads-memory.mjs";

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

test("Crossroads exposes the approved Sprint 04 rituals in order", () => {
  assert.deepEqual(
    crossroadsRituals.map((ritual) => [ritual.id, ritual.title]),
    [
      ["worn_path", "Worn Path"],
      ["offering", "Offering"],
      ["candle", "Candle"],
      ["searching_for_signs", "Searching For Signs"],
      ["waiting_gate", "Waiting Gate"],
    ]
  );
  assert.deepEqual(crossroadsLandmarks.map((landmark) => landmark.route), [
    "/worn-path",
    "/offering",
    "/candle",
    "/searching-for-signs",
    "/waiting-gate",
  ]);
});

test("Crossroads stays closed until Storm Garden is complete", () => {
  const state = completeFrozenGround();
  const intro = getCrossroadsChapterIntro(state);

  assert.equal(state.chapterState.crossroads.unlocked, false);
  assert.equal(intro.locked, true);
  assert.equal(intro.subtitle, "Crossroads waits beyond Storm Garden.");
  assert.equal(getChapterMapDescription("crossroads", 0, true, true, false), "This path remains closed for now.");
});

test("Crossroads unlocks after Chapter Two is held", () => {
  const state = completeStormGarden();
  const intro = getCrossroadsChapterIntro(state);

  assert.equal(state.chapterState.crossroads.unlocked, true);
  assert.equal(intro.locked, false);
  assert.equal(intro.title, "The lanterns are visible");
  assert.equal(getChapterMapDescription("crossroads", 0, true, true, true), "Crossroads is open. The world can hold questions without forcing answers.");
});

test("visiting Crossroads persists without creating a memory", () => {
  const state = markCrossroadsVisited(completeStormGarden(), "2026-06-12T11:00:00.000Z");

  assert.equal(state.chapterState.crossroads.visitCount, 1);
  assert.equal(state.worldState.lastVisitedChapterId, "crossroads");
  assert.equal(state.memoryObjects.length, 10);
});

test("Crossroads ritual memory updates ritual, chapter, world, and snail familiarity", () => {
  const state = saveCrossroadsRitualMemory(completeStormGarden(), "worn_path", {
    response: "The thought that keeps returning.",
    detail: "The path circled back to the same question.",
    createdAt: "2026-06-12T11:01:00.000Z",
  });

  assert.equal(state.chapterState.crossroads.memoryCount, 1);
  assert.equal(state.chapterState.crossroads.weatherState, "lantern_dusk");
  assert.equal(state.worldState.lastVisitedChapterId, "crossroads");
  assert.equal(state.worldState.lastVisitedRitualId, "worn_path");
  assert.equal(state.worldState.wildlifeFamiliarity.snail, 1);
  assert.equal(state.ritualState.wornPath.entries.length, 1);
  assert.equal(state.memoryObjects.at(-1).chapterId, "crossroads");
  assert.equal(state.memoryObjects.at(-1).memoryType, "hope");
});

test("Crossroads return state preserves questions without resolving them", () => {
  const state = saveCrossroadsRitualMemory(completeStormGarden(), "candle", {
    response: "What I would say.",
    detail: "The candle held the sentence I cannot send.",
    createdAt: "2026-06-12T11:03:00.000Z",
  });

  const returnState = getCrossroadsRitualReturnState(state, "candle");

  assert.equal(returnState.hasReturned, true);
  assert.equal(returnState.entries[0].text, "The candle held the sentence I cannot send.");
  assert.equal(returnState.visualState, "wax_history");
  assert.equal(returnState.visualStateLabel, "Wax has begun to gather below the flame.");
  assert.equal(returnState.witnessLabel, "A moth has witnessed this place.");
});

test("Crossroads completes only after all five rituals remember", () => {
  const state = completeCrossroads();

  assert.equal(isCrossroadsChapterComplete(state), true);
  assert.equal(state.chapterState.crossroads.chapterComplete, true);
  assert.equal(getCrossroadsChapterIntro(state).subtitle, "Chapter Three is held at the crossing.");
});

test("Crossroads landmark summaries route to remembered rituals", () => {
  const state = saveCrossroadsRitualMemory(completeStormGarden(), "searching_for_signs", {
    response: "A sign I kept noticing.",
    detail: "The feather stayed near the lantern.",
    createdAt: "2026-06-12T11:04:00.000Z",
  });

  const summary = getCrossroadsLandmarkReturnSummary(state, "searching_for_signs");

  assert.equal(summary.hasMemory, true);
  assert.equal(summary.buttonLabel, "Return to Searching For Signs");
  assert.equal(summary.route, "/searching-for-signs");
  assert.equal(summary.description, "Searching For Signs remembers the pattern without deciding what it means.");
});

test("Crossroads save buttons use place-specific language", () => {
  assert.equal(getCrossroadsRitualSaveCopy("worn_path", false), "Let the path remember this");
  assert.equal(getCrossroadsRitualSaveCopy("offering", true), "The offering stone is keeping it");
  assert.equal(getCrossroadsRitualSaveCopy("waiting_gate", false), "Let the gate hold this waiting");
});

test("Home, Journal, and Hearth carry Crossroads memory forward", () => {
  const state = saveCrossroadsRitualMemory(completeStormGarden(), "waiting_gate", {
    response: "What I am still waiting for.",
    detail: "The gate held the waiting without opening.",
    createdAt: "2026-06-12T11:05:00.000Z",
  });

  const home = getMeadowHomeReturnState(state);
  const archive = getJournalMemoryArchive(state);
  const hearth = getHearthStatus(state, null);

  assert.equal(home.buttonLabel, "Return to Waiting Gate");
  assert.equal(home.route, "/waiting-gate");
  assert.equal(archive[0].place, "Waiting Gate");
  assert.equal(archive[0].witnessLabel, "A snail and a moth have witnessed this place.");
  assert.equal(hearth.latestMemoryLabel, "Latest held memory - Waiting Gate");
});

test("Supabase migration seeds Crossroads chapter and rituals", () => {
  const migration = readFileSync("supabase/migrations/202606120001_mvp_01_memory_backbone.sql", "utf8");

  assert.match(migration, /'crossroads', 'Crossroads', 'Bargaining', 3, true/);
  for (const ritualId of ["worn_path", "offering", "candle", "searching_for_signs", "waiting_gate"]) {
    assert.match(migration, new RegExp(`'${ritualId}', 'crossroads'`));
  }
});
