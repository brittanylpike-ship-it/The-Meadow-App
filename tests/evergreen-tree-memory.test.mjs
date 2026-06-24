import assert from "node:assert/strict";
import test from "node:test";

import {
  createEmptyMeadowState,
  getEvergreenReturnState,
  saveEvergreenMemory,
} from "../features/memory/evergreen-tree-memory.mjs";

test("saving an Evergreen Tree thought persists memory across ritual, chapter, and world state", () => {
  const state = createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z");

  const next = saveEvergreenMemory(state, {
    thought: "I still expect them to call.",
    context: "Morning",
    offering: "Their name still rises before I remember.",
    createdAt: "2026-06-12T09:03:00.000Z",
  });

  assert.equal(next.memoryObjects.length, 1);
  assert.equal(next.ritualState.evergreenTree.visitCount, 1);
  assert.equal(next.ritualState.evergreenTree.tags.length, 1);
  assert.equal(next.chapterState.frozenGround.memoryCount, 1);
  assert.equal(next.worldState.totalMemories, 1);
  assert.equal(next.worldState.lastVisitedRitualId, "evergreen_tree");
  assert.equal(next.ritualState.evergreenTree.lanternWarmth, "kindled");
});

test("returning to Evergreen Tree shows old tags and evolved visual state", () => {
  let state = createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z");

  state = saveEvergreenMemory(state, {
    thought: "I keep looking for them.",
    context: "Quiet Moments",
    offering: "At the kitchen window.",
    createdAt: "2026-06-12T09:04:00.000Z",
  });

  state = saveEvergreenMemory(state, {
    thought: "I thought I saw them.",
    context: "Everywhere",
    offering: "A coat in the crowd.",
    createdAt: "2026-06-13T09:04:00.000Z",
  });

  const returnState = getEvergreenReturnState(state);

  assert.equal(returnState.hasReturned, true);
  assert.equal(returnState.tags.length, 2);
  assert.equal(returnState.tags[0].dateLabel, "June 12, 2026");
  assert.equal(returnState.visibleEvolution, "few_tags");
  assert.equal(returnState.wildlifeWitnesses.includes("rabbit"), true);
  assert.equal(returnState.message, "The tree kept what you left here.");
});
