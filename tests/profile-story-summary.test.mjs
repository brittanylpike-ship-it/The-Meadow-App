import assert from "node:assert/strict";
import test from "node:test";

import { getProfileStorySummary } from "../features/memory/profile-story-summary.mjs";
import { createEmptyMeadowState } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";

test("Profile story summary stays gentle before memories exist", () => {
  const summary = getProfileStorySummary(createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"));

  assert.equal(summary, "The landscape has not received a memory yet.");
});

test("Profile story summary names the latest remembered place without technical wording", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "frosted_window",
    {
      response: "A small light in the room.",
      detail: "The lamp by the chair.",
      createdAt: "2026-06-12T09:04:00.000Z",
    }
  );

  const summary = getProfileStorySummary(state);

  assert.equal(summary, "Your latest memory rests at Frosted Window.");
  assert.equal(summary.includes("object"), false);
});
