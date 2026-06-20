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
import { saveStormGardenRitualMemory, stormGardenRituals } from "../features/memory/storm-garden-memory.mjs";
import {
  getMoorsChapterIntro,
  getMoorsLandmarkReturnSummary,
  getMoorsRitualReturnState,
  getMoorsRitualSaveCopy,
  isMoorsChapterComplete,
  markMoorsVisited,
  moorsLandmarks,
  moorsRituals,
  saveMoorsRitualMemory,
} from "../features/memory/moors-memory.mjs";

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

test("The Moors exposes the approved Sprint 05 rituals in order", () => {
  assert.deepEqual(
    moorsRituals.map((ritual) => [ritual.id, ritual.title]),
    [
      ["canopy_cloak", "Canopy Cloak"],
      ["mire", "Mire"],
      ["bramble", "Bramble"],
      ["fog", "Fog"],
      ["vanishing_path", "Vanishing Path"],
    ]
  );
  assert.deepEqual(moorsLandmarks.map((landmark) => landmark.route), [
    "/canopy-cloak",
    "/mire",
    "/bramble",
    "/fog",
    "/vanishing-path",
  ]);
});

test("The Moors stays closed until Crossroads is complete", () => {
  const state = completeStormGarden();
  const intro = getMoorsChapterIntro(state);

  assert.equal(state.chapterState.theMoors.unlocked, false);
  assert.equal(intro.locked, true);
  assert.equal(intro.subtitle, "The Moors waits beyond Crossroads.");
  assert.equal(getChapterMapDescription("the_moors", 0, true, true, true, false), "This path remains closed for now.");
});

test("The Moors unlocks after Chapter Three is held", () => {
  const state = completeCrossroads();
  const intro = getMoorsChapterIntro(state);

  assert.equal(state.chapterState.theMoors.unlocked, true);
  assert.equal(intro.locked, false);
  assert.equal(intro.title, "The fog has opened a way");
  assert.equal(getChapterMapDescription("the_moors", 0, true, true, true, true), "The Moors is open. The world can hold weight without trying to solve it.");
});

test("visiting The Moors persists without creating a memory", () => {
  const state = markMoorsVisited(completeCrossroads(), "2026-06-12T12:00:00.000Z");

  assert.equal(state.chapterState.theMoors.visitCount, 1);
  assert.equal(state.worldState.lastVisitedChapterId, "the_moors");
  assert.equal(state.memoryObjects.length, 15);
});

test("Moors ritual memory updates ritual, chapter, world, and owl familiarity", () => {
  const before = completeCrossroads();
  const state = saveMoorsRitualMemory(before, "canopy_cloak", {
    response: "The weight that covers everything.",
    detail: "The canopy held the heaviness without asking it to lift.",
    createdAt: "2026-06-12T12:01:00.000Z",
  });

  assert.equal(state.chapterState.theMoors.memoryCount, 1);
  assert.equal(state.chapterState.theMoors.weatherState, "known_fog");
  assert.equal(state.worldState.lastVisitedChapterId, "the_moors");
  assert.equal(state.worldState.lastVisitedRitualId, "canopy_cloak");
  assert.equal(state.worldState.wildlifeFamiliarity.owl, before.worldState.wildlifeFamiliarity.owl + 1);
  assert.equal(state.ritualState.canopyCloak.entries.length, 1);
  assert.equal(state.memoryObjects.at(-1).chapterId, "the_moors");
  assert.equal(state.memoryObjects.at(-1).memoryType, "survival");
});

test("The Moors return state holds weight without resolving it", () => {
  const state = saveMoorsRitualMemory(completeCrossroads(), "fog", {
    response: "Nothing is clear.",
    detail: "A landmark became familiar inside the fog.",
    createdAt: "2026-06-12T12:04:00.000Z",
  });

  const returnState = getMoorsRitualReturnState(state, "fog");

  assert.equal(returnState.hasReturned, true);
  assert.equal(returnState.entries[0].text, "A landmark became familiar inside the fog.");
  assert.equal(returnState.visualState, "familiar_landmark");
  assert.equal(returnState.visualStateLabel, "One landmark has become familiar inside the fog.");
  assert.equal(returnState.witnessLabel, "An owl has witnessed this place.");
});

test("The Moors completes only after all five rituals remember", () => {
  const state = completeMoors();

  assert.equal(isMoorsChapterComplete(state), true);
  assert.equal(state.chapterState.theMoors.chapterComplete, true);
  assert.equal(getMoorsChapterIntro(state).subtitle, "Chapter Four is held in the fog.");
});

test("Moors landmark summaries route to remembered rituals", () => {
  const state = saveMoorsRitualMemory(completeCrossroads(), "vanishing_path", {
    response: "The future cannot be seen.",
    detail: "The path stayed dark, but it stayed.",
    createdAt: "2026-06-12T12:05:00.000Z",
  });

  const summary = getMoorsLandmarkReturnSummary(state, "vanishing_path");

  assert.equal(summary.hasMemory, true);
  assert.equal(summary.buttonLabel, "Return to Vanishing Path");
  assert.equal(summary.route, "/vanishing-path");
  assert.equal(summary.description, "Vanishing Path remembers that the way forward could not be seen.");
});

test("Moors save buttons use place-specific language", () => {
  assert.equal(getMoorsRitualSaveCopy("canopy_cloak", false), "Let the canopy hold this weight");
  assert.equal(getMoorsRitualSaveCopy("mire", true), "The mire is keeping it");
  assert.equal(getMoorsRitualSaveCopy("vanishing_path", false), "Let the path hold this uncertainty");
});

test("Home, Journal, and Hearth carry Moors memory forward", () => {
  const state = saveMoorsRitualMemory(completeCrossroads(), "mire", {
    response: "Stuckness and difficulty moving.",
    detail: "A stone rose where I stood still.",
    createdAt: "2026-06-12T12:02:00.000Z",
  });

  const home = getMeadowHomeReturnState(state);
  const archive = getJournalMemoryArchive(state);
  const hearth = getHearthStatus(state, null);

  assert.equal(home.buttonLabel, "Return to Mire");
  assert.equal(home.route, "/mire");
  assert.equal(archive[0].place, "Mire");
  assert.equal(archive[0].witnessLabel, "An owl has witnessed this place.");
  assert.equal(hearth.latestMemoryLabel, "Latest held memory - Mire");
});

test("Supabase migration seeds The Moors chapter and rituals", () => {
  const migration = readFileSync("supabase/migrations/202606120001_mvp_01_memory_backbone.sql", "utf8");

  assert.match(migration, /'the_moors', 'The Moors', 'Depression', 4, true/);
  for (const ritualId of ["canopy_cloak", "mire", "bramble", "fog", "vanishing_path"]) {
    assert.match(migration, new RegExp(`'${ritualId}', 'the_moors'`));
  }
});
