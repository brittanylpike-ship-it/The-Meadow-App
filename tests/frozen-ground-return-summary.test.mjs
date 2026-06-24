import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyMeadowState, saveEvergreenMemory } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";
import {
  getFrozenGroundLandmarkReturnSummary,
  getMeadowHomeReturnState,
} from "../features/chapters/frozen-ground-return-summary.mjs";

test("summarizes return state for every Frozen Ground landmark", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "frozen_pond",
    {
      response: "A quiet ache.",
      detail: "A word under the ice.",
      createdAt: "2026-06-12T09:04:00.000Z",
    }
  );

  const remembered = getFrozenGroundLandmarkReturnSummary(state, "frozen_pond");
  assert.equal(remembered.hasMemory, true);
  assert.equal(remembered.memoryCount, 1);
  assert.equal(remembered.description, "The Frozen Pond held the shape beneath the ice.");
  assert.equal(remembered.buttonLabel, "Return to Frozen Pond");

  const waiting = getFrozenGroundLandmarkReturnSummary(state, "quiet_hour");
  assert.equal(waiting.hasMemory, false);
  assert.equal(waiting.memoryCount, 0);
  assert.equal(waiting.buttonLabel, "Enter this place");
});

test("home return state follows the latest remembered ritual across Chapter One", () => {
  let state = createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z");
  state = saveEvergreenMemory(state, {
    thought: "I still wait.",
    context: "Night",
    offering: "The porch light stayed on.",
    createdAt: "2026-06-12T09:01:00.000Z",
  });
  state = saveFrozenGroundRitualMemory(state, "footprints", {
    response: "I came back.",
    detail: "The path was still there.",
    createdAt: "2026-06-12T09:04:00.000Z",
  });

  const home = getMeadowHomeReturnState(state);

  assert.equal(home.subtitle, "The Footprints kept the path where you crossed.");
  assert.equal(home.body, "What you left is still held in Frozen Ground.");
  assert.equal(home.buttonLabel, "Return to Footprints");
  assert.equal(home.route, "/footprints");
});
