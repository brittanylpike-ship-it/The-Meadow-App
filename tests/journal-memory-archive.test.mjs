import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyMeadowState, saveEvergreenMemory } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";
import {
  getJournalMemoryArchive,
  getJournalSubtitle,
} from "../features/memory/journal-memory-archive.mjs";

test("builds a gentle journal archive from remembered ritual memories", () => {
  let state = createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z");
  state = saveEvergreenMemory(state, {
    thought: "I still wait.",
    context: "Night",
    offering: "The porch light stayed on.",
    createdAt: "2026-06-12T09:01:00.000Z",
  });
  state = saveFrozenGroundRitualMemory(state, "quiet_hour", {
    response: "Beside a small light.",
    detail: "The hour softened at the edge.",
    createdAt: "2026-06-12T09:04:00.000Z",
  });

  const archive = getJournalMemoryArchive(state);

  assert.equal(archive.length, 2);
  assert.equal(archive[0].place, "Quiet Hour");
  assert.equal(archive[0].text, "The hour softened at the edge.");
  assert.equal(archive[0].supportingText, "Beside a small light.");
  assert.equal(archive[0].dateLabel, "June 12, 2026");
  assert.equal(archive[0].route, "/quiet-hour");
  assert.equal(archive[0].buttonLabel, "Return to Quiet Hour");
  assert.equal(archive[1].place, "Evergreen Tree");
  assert.equal(archive[1].text, "The porch light stayed on.");
  assert.equal(archive[1].route, "/evergreen-tree");
});

test("journal subtitle stays quiet and non-gamified", () => {
  const empty = createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z");

  assert.equal(getJournalSubtitle(empty), "The Journal will gather what the world has kept.");

  const remembered = saveFrozenGroundRitualMemory(empty, "footprints", {
    response: "I came back.",
    detail: "The path was still there.",
    createdAt: "2026-06-12T09:04:00.000Z",
  });

  assert.equal(getJournalSubtitle(remembered), "What you left in the world can be found here, still held.");
});
