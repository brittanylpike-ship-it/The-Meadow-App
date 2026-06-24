import assert from "node:assert/strict";
import test from "node:test";

import { getHearthStatus } from "../features/memory/hearth-status.mjs";
import { createEmptyMeadowState } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";

test("Hearth stays quiet before the world has received memory", () => {
  const status = getHearthStatus(createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"), null);

  assert.deepEqual(status, {
    title: "A quiet fire is banked",
    body: "The Hearth will warm what the world has begun to hold.",
    actionLabel: null,
    latestMemoryText: null,
    latestMemoryLabel: null,
  });
});

test("Hearth reflects remembered memory without becoming a dashboard", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "quiet_hour",
    {
      response: "Beside a small light.",
      detail: "The hour softened at the edge.",
      createdAt: "2026-06-12T09:04:00.000Z",
    }
  );

  const status = getHearthStatus(state, { pendingCount: 0, status: "settled" });

  assert.equal(status.title, "The fire is keeping watch");
  assert.equal(status.body, "What you left in Frozen Ground is still held here.");
  assert.equal(status.actionLabel, null);
  assert.equal(status.latestMemoryText, "The hour softened at the edge.");
  assert.equal(status.latestMemoryLabel, "Latest held memory - Quiet Hour");
});

test("Hearth can softly surface pending sync work", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "footprints",
    {
      response: "I came back.",
      detail: "The path was still there.",
      createdAt: "2026-06-12T09:04:00.000Z",
    }
  );

  const status = getHearthStatus(state, { pendingCount: 1, status: "waiting" });

  assert.equal(status.title, "Held here, still traveling");
  assert.equal(status.body, "One memory is safe here and waiting for the wider Meadow.");
  assert.equal(status.actionLabel, "Try again");
});
