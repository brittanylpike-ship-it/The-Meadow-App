import assert from "node:assert/strict";
import test from "node:test";

import { getChapterReturnIntro } from "../features/chapters/chapter-return-intro.mjs";
import { createEmptyMeadowState } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";

test("Chapters intro names Frozen Ground as open before memory", () => {
  const intro = getChapterReturnIntro(createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"));

  assert.deepEqual(intro, {
    subtitle: "The world is the navigation. Frozen Ground is open now.",
    title: "Frozen Ground is open",
    body: "The first path is waiting in the snow.",
  });
});

test("Chapters intro changes once Frozen Ground has begun remembering", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "frozen_pond",
    {
      response: "A quiet ache.",
      detail: "A word under the ice.",
      createdAt: "2026-06-12T09:04:00.000Z",
    }
  );

  const intro = getChapterReturnIntro(state);

  assert.deepEqual(intro, {
    subtitle: "Frozen Ground has begun to remember.",
    title: "Chapter One is holding what you left",
    body: "The path back is no longer empty.",
  });
});
