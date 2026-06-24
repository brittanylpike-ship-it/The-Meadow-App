import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyMeadowState } from "../features/memory/evergreen-tree-memory.mjs";
import {
  frozenGroundRituals,
  getFrozenGroundRitualReturnState,
  saveFrozenGroundRitualMemory,
} from "../features/memory/frozen-ground-ritual-memory.mjs";

test("each remaining Frozen Ground ritual can save memory and update the landscape state", () => {
  let state = createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z");

  for (const [index, ritual] of frozenGroundRituals.entries()) {
    state = saveFrozenGroundRitualMemory(state, ritual.id, {
      response: ritual.options[0],
      detail: `remembered detail ${index + 1}`,
      createdAt: `2026-06-12T09:0${index}:00.000Z`,
    });
  }

  assert.equal(state.memoryObjects.length, 4);
  assert.equal(state.chapterState.frozenGround.memoryCount, 4);
  assert.equal(state.worldState.totalMemories, 4);
  assert.equal(state.worldState.lastVisitedRitualId, "footprints");

  for (const ritual of frozenGroundRituals) {
    assert.equal(state.ritualState[ritual.stateKey].visitCount, 1);
    assert.equal(state.ritualState[ritual.stateKey].entries.length, 1);
  }
});

test("return state shows that a Frozen Ground ritual remembers what was left there", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "frosted_window",
    {
      response: "A small light in the room.",
      detail: "The lamp by the chair.",
      createdAt: "2026-06-12T09:03:00.000Z",
    }
  );

  const returnState = getFrozenGroundRitualReturnState(state, "frosted_window");

  assert.equal(returnState.hasReturned, true);
  assert.equal(returnState.entries.length, 1);
  assert.equal(returnState.entries[0].text, "The lamp by the chair.");
  assert.equal(returnState.entries[0].dateLabel, "June 12, 2026");
  assert.equal(returnState.message, "The Frosted Window kept what you cleared here.");
});
