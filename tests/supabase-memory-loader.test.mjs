import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMissingMeadowBootstrapRows,
  fromEvergreenSupabaseRows,
} from "../features/memory/supabase-memory-loader.mjs";

test("reconstructs Meadow return state from Supabase memory backbone rows", () => {
  const userId = "9b2c6f0f-0000-4000-9000-000000000001";

  const state = fromEvergreenSupabaseRows(userId, {
    worldState: {
      user_id: userId,
      total_memories: 2,
      last_visited_chapter_id: "frozen_ground",
      last_visited_ritual_id: "evergreen_tree",
      wildlife_familiarity: { rabbit: 2, chickadee: 2 },
      created_at: "2026-06-12T09:00:00.000Z",
      updated_at: "2026-06-13T09:10:00.000Z",
    },
    chapterState: {
      chapter_id: "frozen_ground",
      visit_count: 2,
      memory_count: 2,
      weather_state: "still_snow",
      state: { unlocked: true },
      updated_at: "2026-06-13T09:10:00.000Z",
    },
    ritualState: {
      chapter_id: "frozen_ground",
      ritual_id: "evergreen_tree",
      visit_count: 2,
      branch_fullness: "few_tags",
      lantern_warmth: "kindled",
      root_visibility: "beneath_snow",
      wildlife_witnesses: ["rabbit", "chickadee"],
      state: {
        tags: [
          {
            id: "tag_remote_1",
            memoryId: "remote-memory-1",
            text: "The porch light stayed on.",
            thought: "I still wait.",
            context: "Night",
            branch: "lower_left",
            createdAt: "2026-06-12T09:10:00.000Z",
          },
        ],
      },
      updated_at: "2026-06-13T09:10:00.000Z",
    },
    memoryObjects: [
      {
        id: "remote-memory-1",
        user_id: userId,
        memory_type: "thought",
        chapter_id: "frozen_ground",
        ritual_id: "evergreen_tree",
        selected_thought: "I still wait.",
        context: "Night",
        custom_text: "The porch light stayed on.",
        branch: "lower_left",
        visual_state: { tag_id: "tag_remote_1" },
        created_at: "2026-06-12T09:10:00.000Z",
      },
      {
        id: "remote-memory-2",
        user_id: userId,
        memory_type: "thought",
        chapter_id: "frozen_ground",
        ritual_id: "evergreen_tree",
        selected_thought: "I thought I saw them.",
        context: "Morning",
        custom_text: "",
        branch: "lower_right",
        visual_state: { tag_id: "tag_remote_2" },
        created_at: "2026-06-13T09:10:00.000Z",
      },
    ],
  }, "2026-06-14T09:00:00.000Z");

  assert.equal(state.userId, userId);
  assert.equal(state.worldState.totalMemories, 2);
  assert.equal(state.chapterState.frozenGround.memoryCount, 2);
  assert.equal(state.ritualState.evergreenTree.tags.length, 2);
  assert.equal(state.ritualState.evergreenTree.tags[0].text, "The porch light stayed on.");
  assert.equal(state.ritualState.evergreenTree.tags[1].text, "I thought I saw them.");
  assert.equal(state.memoryObjects[1].id, "remote-memory-2");
});

test("builds only missing Supabase bootstrap rows for a new Meadow account", () => {
  const user = {
    id: "9b2c6f0f-0000-4000-9000-000000000002",
    email: "new@example.com",
  };

  const missing = buildMissingMeadowBootstrapRows(user, {
    profile: null,
    worldState: null,
    chapterState: null,
    ritualState: null,
    ritualStates: [],
  }, "2026-06-12T09:00:00.000Z");

  assert.equal(missing.profile?.id, user.id);
  assert.equal(missing.profile?.email, user.email);
  assert.equal(missing.worldState?.user_id, user.id);
  assert.equal(missing.chapterState?.chapter_id, "frozen_ground");
  assert.equal(missing.ritualState?.ritual_id, "evergreen_tree");
  assert.deepEqual(missing.ritualStates.map((row) => row.ritual_id), [
    "evergreen_tree",
    "frosted_window",
    "frozen_pond",
    "quiet_hour",
    "footprints",
    "lightning_tree",
    "thorn_patch",
    "floodwaters",
    "scorched_earth",
    "shattered_mirror",
    "worn_path",
    "offering",
    "candle",
    "searching_for_signs",
    "waiting_gate",
    "canopy_cloak",
    "mire",
    "bramble",
    "fog",
    "vanishing_path",
    "grounding",
    "opening",
    "anchoring",
    "emergence",
    "integration",
  ]);
  assert.deepEqual(missing.chapterStates.map((row) => row.chapter_id), ["frozen_ground", "storm_garden", "crossroads", "the_moors", "first_bloom"]);
  assert.deepEqual(missing.ritualStates.find((row) => row.ritual_id === "frozen_pond")?.state, {
    entries: [],
    visual_state: "sealed_ice",
  });

  const noneMissing = buildMissingMeadowBootstrapRows(user, {
    profile: { id: user.id },
    worldState: { user_id: user.id },
    chapterState: { user_id: user.id, chapter_id: "frozen_ground" },
    ritualState: { user_id: user.id, ritual_id: "evergreen_tree" },
    ritualStates: [
      { user_id: user.id, ritual_id: "evergreen_tree" },
      { user_id: user.id, ritual_id: "frosted_window" },
      { user_id: user.id, ritual_id: "frozen_pond" },
      { user_id: user.id, ritual_id: "quiet_hour" },
      { user_id: user.id, ritual_id: "footprints" },
      { user_id: user.id, ritual_id: "lightning_tree" },
      { user_id: user.id, ritual_id: "thorn_patch" },
      { user_id: user.id, ritual_id: "floodwaters" },
      { user_id: user.id, ritual_id: "scorched_earth" },
      { user_id: user.id, ritual_id: "shattered_mirror" },
      { user_id: user.id, ritual_id: "worn_path" },
      { user_id: user.id, ritual_id: "offering" },
      { user_id: user.id, ritual_id: "candle" },
      { user_id: user.id, ritual_id: "searching_for_signs" },
      { user_id: user.id, ritual_id: "waiting_gate" },
      { user_id: user.id, ritual_id: "canopy_cloak" },
      { user_id: user.id, ritual_id: "mire" },
      { user_id: user.id, ritual_id: "bramble" },
      { user_id: user.id, ritual_id: "fog" },
      { user_id: user.id, ritual_id: "vanishing_path" },
      { user_id: user.id, ritual_id: "grounding" },
      { user_id: user.id, ritual_id: "opening" },
      { user_id: user.id, ritual_id: "anchoring" },
      { user_id: user.id, ritual_id: "emergence" },
      { user_id: user.id, ritual_id: "integration" },
    ],
    chapterStates: [
      { user_id: user.id, chapter_id: "frozen_ground" },
      { user_id: user.id, chapter_id: "storm_garden" },
      { user_id: user.id, chapter_id: "crossroads" },
      { user_id: user.id, chapter_id: "the_moors" },
      { user_id: user.id, chapter_id: "first_bloom" },
    ],
  }, "2026-06-12T09:00:00.000Z");

  assert.deepEqual(noneMissing, {
    profile: null,
    worldState: null,
    chapterState: null,
    chapterStates: [],
    ritualState: null,
    ritualStates: [],
  });
});

test("builds missing bootstrap rows only for absent Frozen Ground ritual states", () => {
  const user = {
    id: "9b2c6f0f-0000-4000-9000-000000000004",
    email: "partial@example.com",
  };

  const missing = buildMissingMeadowBootstrapRows(user, {
    profile: { id: user.id },
    worldState: { user_id: user.id },
    chapterState: { user_id: user.id, chapter_id: "frozen_ground" },
    ritualState: { user_id: user.id, ritual_id: "evergreen_tree" },
    ritualStates: [
      { user_id: user.id, ritual_id: "evergreen_tree" },
      { user_id: user.id, ritual_id: "frosted_window" },
      { user_id: user.id, ritual_id: "quiet_hour" },
    ],
  }, "2026-06-12T09:00:00.000Z");

  assert.deepEqual(missing.ritualStates.map((row) => row.ritual_id), [
    "frozen_pond",
    "footprints",
    "lightning_tree",
    "thorn_patch",
    "floodwaters",
    "scorched_earth",
    "shattered_mirror",
    "worn_path",
    "offering",
    "candle",
    "searching_for_signs",
    "waiting_gate",
    "canopy_cloak",
    "mire",
    "bramble",
    "fog",
    "vanishing_path",
    "grounding",
    "opening",
    "anchoring",
    "emergence",
    "integration",
  ]);
});

test("reconstructs remaining Frozen Ground ritual entries from Supabase rows", () => {
  const userId = "9b2c6f0f-0000-4000-9000-000000000003";

  const state = fromEvergreenSupabaseRows(userId, {
    worldState: {
      user_id: userId,
      total_memories: 1,
      last_visited_chapter_id: "frozen_ground",
      last_visited_ritual_id: "frozen_pond",
      wildlife_familiarity: {},
      created_at: "2026-06-12T09:00:00.000Z",
      updated_at: "2026-06-12T09:10:00.000Z",
    },
    ritualStates: [
      {
        chapter_id: "frozen_ground",
        ritual_id: "frozen_pond",
        visit_count: 1,
        branch_fullness: "first_crack",
        lantern_warmth: "kindled",
        root_visibility: "beneath_snow",
        wildlife_witnesses: ["rabbit", "chickadee"],
        state: {
          entries: [
            {
              id: "entry_frozen_pond_1",
              memoryId: "f1a9a7f5-20b4-421d-8c1c-1a86477880ef",
              text: "A word under the ice.",
              response: "A quiet ache.",
              createdAt: "2026-06-12T09:10:00.000Z",
            },
          ],
          visual_state: "first_crack",
        },
        updated_at: "2026-06-12T09:10:00.000Z",
      },
    ],
    memoryObjects: [
      {
        id: "f1a9a7f5-20b4-421d-8c1c-1a86477880ef",
        user_id: userId,
        memory_type: "emotion",
        chapter_id: "frozen_ground",
        ritual_id: "frozen_pond",
        selected_thought: "A quiet ache.",
        context: "Frozen Pond",
        custom_text: "A word under the ice.",
        branch: null,
        visual_state: { entry_id: "entry_frozen_pond_1" },
        created_at: "2026-06-12T09:10:00.000Z",
      },
    ],
  }, "2026-06-14T09:00:00.000Z");

  assert.equal(state.ritualState.frozenPond.entries.length, 1);
  assert.equal(state.ritualState.frozenPond.entries[0].text, "A word under the ice.");
  assert.equal(state.worldState.lastVisitedRitualId, "frozen_pond");
});
