import assert from "node:assert/strict";
import test from "node:test";

import { getFrozenGroundChapterIntro } from "../features/chapters/frozen-ground-chapter-intro.mjs";
import { createEmptyMeadowState } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";

test("Frozen Ground chapter intro stays still before memory", () => {
  const intro = getFrozenGroundChapterIntro(createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"));

  assert.deepEqual(intro, {
    subtitle: "A still winter chapter for the first shock of absence.",
    title: "The snow is quiet",
    body: "Each place is waiting without asking anything from you.",
  });
});

test("Frozen Ground chapter intro changes after the chapter remembers", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "quiet_hour",
    {
      response: "Beside a small light.",
      detail: "The hour softened at the edge.",
      createdAt: "2026-06-12T09:04:00.000Z",
    }
  );

  const intro = getFrozenGroundChapterIntro(state);

  assert.deepEqual(intro, {
    subtitle: "Frozen Ground has begun to remember what you left.",
    title: "The snow kept a trace",
    body: "Return to any place here and it will meet you with what remains.",
  });
});
