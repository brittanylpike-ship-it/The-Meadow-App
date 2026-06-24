import assert from "node:assert/strict";
import test from "node:test";

import { getChapterMapDescription } from "../features/chapters/chapter-map-copy.mjs";
import { getFrozenGroundChapterIntro } from "../features/chapters/frozen-ground-chapter-intro.mjs";
import { getMeadowHomeReturnState } from "../features/chapters/frozen-ground-return-summary.mjs";
import * as evergreenMemory from "../features/memory/evergreen-tree-memory.mjs";
import * as frozenGroundRitualMemory from "../features/memory/frozen-ground-ritual-memory.mjs";
import { getHearthStatus } from "../features/memory/hearth-status.mjs";
import { getJournalMemoryArchive } from "../features/memory/journal-memory-archive.mjs";
import { getProfileStorySummary } from "../features/memory/profile-story-summary.mjs";

const {
  createEmptyMeadowState,
  getEvergreenSaveCopy,
  getLatestMeadowMemory,
  isFrozenGroundChapterComplete,
  markMeadowChapterVisited,
  markMeadowRitualVisited,
  saveEvergreenMemory,
} = evergreenMemory;

const {
  getFrozenGroundRitualReturnState,
  getFrozenGroundRitualSaveCopy,
  saveFrozenGroundRitualMemory,
} = frozenGroundRitualMemory;

function stateWithEveryFrozenGroundPlace() {
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

test("chapter visits are remembered without creating a memory", () => {
  const state = markMeadowChapterVisited(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "frozen_ground",
    "2026-06-12T10:00:00.000Z"
  );

  assert.equal(state.chapterState.frozenGround.visitCount, 1);
  assert.equal(state.worldState.lastVisitedChapterId, "frozen_ground");
  assert.equal(state.worldState.lastVisitedRitualId, null);
  assert.equal(state.memoryObjects.length, 0);
  assert.equal(state.worldState.totalMemories, 0);
  assert.equal(state.worldState.updatedAt, "2026-06-12T10:00:00.000Z");
});

test("ritual visits are remembered before a person leaves words there", () => {
  const state = markMeadowRitualVisited(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "frosted_window",
    "2026-06-12T10:05:00.000Z"
  );

  assert.equal(state.ritualState.frostedWindow.visitCount, 1);
  assert.equal(state.ritualState.frostedWindow.entries.length, 0);
  assert.equal(state.chapterState.frozenGround.visitCount, 1);
  assert.equal(state.worldState.lastVisitedRitualId, "frosted_window");
  assert.equal(state.memoryObjects.length, 0);
});

test("Evergreen visits update the tree without adding tags", () => {
  const state = markMeadowRitualVisited(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "evergreen_tree",
    "2026-06-12T10:05:00.000Z"
  );

  assert.equal(state.ritualState.evergreenTree.visitCount, 1);
  assert.equal(state.ritualState.evergreenTree.tags.length, 0);
  assert.equal(state.worldState.lastVisitedRitualId, "evergreen_tree");
});

test("Frozen Ground ritual return state names visual change and witnesses", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "frozen_pond",
    {
      response: "A feeling I have not touched.",
      detail: "A clean ring opened under the ice.",
      createdAt: "2026-06-12T09:03:00.000Z",
    }
  );

  const returnState = getFrozenGroundRitualReturnState(state, "frozen_pond");

  assert.equal(returnState.visualState, "first_crack");
  assert.equal(returnState.visualStateLabel, "A clean line has opened in the ice.");
  assert.deepEqual(returnState.wildlifeWitnesses, ["hare", "heron"]);
  assert.equal(returnState.witnessLabel, "A hare and a heron have witnessed this place.");
  assert.equal(state.worldState.wildlifeFamiliarity.hare, 1);
  assert.equal(state.worldState.wildlifeFamiliarity.heron, 1);
});

test("Chapter One completion is based on every Frozen Ground place remembering", () => {
  const empty = createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z");
  const complete = stateWithEveryFrozenGroundPlace();

  assert.equal(isFrozenGroundChapterComplete(empty), false);
  assert.equal(isFrozenGroundChapterComplete(complete), true);
  assert.equal(complete.chapterState.frozenGround.chapterComplete, true);
});

test("completed Frozen Ground copy stays emotional instead of gamified", () => {
  const complete = stateWithEveryFrozenGroundPlace();

  assert.deepEqual(getFrozenGroundChapterIntro(complete), {
    subtitle: "Chapter One is held in the snow.",
    title: "Frozen Ground remembers each place",
    body: "The tree, window, pond, hour, and path all carry something you trusted to them.",
  });
  assert.equal(
    getChapterMapDescription("frozen_ground", complete.chapterState.frozenGround.memoryCount, true),
    "Chapter One is held. Frozen Ground remembers every place you entered."
  );
  assert.equal(getProfileStorySummary(complete), "Chapter One rests in Frozen Ground, remembered place by place.");
});

test("Home can return to a visited ritual even before memory exists", () => {
  const state = markMeadowRitualVisited(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "quiet_hour",
    "2026-06-12T10:05:00.000Z"
  );

  const home = getMeadowHomeReturnState(state);

  assert.equal(home.buttonLabel, "Return to Quiet Hour");
  assert.equal(home.route, "/quiet-hour");
  assert.equal(home.body, "The last place you approached is still open.");
  assert.equal(home.body.includes("0"), false);
});

test("Home return copy avoids counts once memory exists", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "footprints",
    {
      response: "I came back.",
      detail: "The path was still there.",
      createdAt: "2026-06-12T09:04:00.000Z",
    }
  );

  const home = getMeadowHomeReturnState(state);

  assert.equal(home.body, "What you left is still held in Frozen Ground.");
  assert.equal(home.body.includes("1 memory"), false);
});

test("save button copy is ritual-specific and never clinical", () => {
  assert.equal(getFrozenGroundRitualSaveCopy("frosted_window", false), "Let the window keep this");
  assert.equal(getFrozenGroundRitualSaveCopy("frozen_pond", true), "The pond is keeping it");
  assert.equal(getFrozenGroundRitualSaveCopy("quiet_hour", false), "Let the hour keep this");
  assert.equal(getFrozenGroundRitualSaveCopy("footprints", true), "The path is keeping it");
  assert.equal(getEvergreenSaveCopy(false), "Let the tree keep this");
  assert.equal(getEvergreenSaveCopy(true), "The tree is keeping it");
});

test("latest memory helper names where the memory rests", () => {
  const state = stateWithEveryFrozenGroundPlace();
  const latest = getLatestMeadowMemory(state);

  assert.equal(latest.text, "The path remembered.");
  assert.equal(latest.place, "Footprints");
  assert.equal(latest.route, "/footprints");
});

test("Journal and Hearth carry the remembered place forward", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "frosted_window",
    {
      response: "A small light in the room.",
      detail: "The lamp by the chair.",
      createdAt: "2026-06-12T09:04:00.000Z",
    }
  );

  const archive = getJournalMemoryArchive(state);
  const hearth = getHearthStatus(state, null);

  assert.equal(archive[0].witnessLabel, "A robin and a moth have witnessed this place.");
  assert.equal(hearth.latestMemoryLabel, "Latest held memory - Frosted Window");
});
