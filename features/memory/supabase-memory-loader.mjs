import { createEmptyMeadowState } from "./evergreen-tree-memory.mjs";

const FROZEN_GROUND_ID = "frozen_ground";
const STORM_GARDEN_ID = "storm_garden";
const CROSSROADS_ID = "crossroads";
const THE_MOORS_ID = "the_moors";
const FIRST_BLOOM_ID = "first_bloom";
const EVERGREEN_TREE_ID = "evergreen_tree";
const FROZEN_GROUND_RITUALS = [
  { id: EVERGREEN_TREE_ID, title: "Evergreen Tree", state: { tags: [] }, visualState: "sparse" },
  { id: "frosted_window", title: "Frosted Window", state: { entries: [], visual_state: "frosted" }, visualState: "frosted" },
  { id: "frozen_pond", title: "Frozen Pond", state: { entries: [], visual_state: "sealed_ice" }, visualState: "sealed_ice" },
  { id: "quiet_hour", title: "Quiet Hour", state: { entries: [], visual_state: "still_clock" }, visualState: "still_clock" },
  { id: "footprints", title: "Footprints", state: { entries: [], visual_state: "unmarked_snow" }, visualState: "unmarked_snow" },
];
const STORM_GARDEN_RITUALS = [
  { id: "lightning_tree", title: "Lightning Tree", state: { entries: [], visual_state: "fresh_damage" }, visualState: "fresh_damage" },
  { id: "thorn_patch", title: "Thorn Patch", state: { entries: [], visual_state: "mostly_thorns" }, visualState: "mostly_thorns" },
  { id: "floodwaters", title: "Floodwaters", state: { entries: [], visual_state: "flood" }, visualState: "flood" },
  { id: "scorched_earth", title: "Scorched Earth", state: { entries: [], visual_state: "burned" }, visualState: "burned" },
  { id: "shattered_mirror", title: "Shattered Mirror", state: { entries: [], visual_state: "few_reflections" }, visualState: "few_reflections" },
];
const CROSSROADS_RITUALS = [
  { id: "worn_path", title: "Worn Path", state: { entries: [], visual_state: "faint_path" }, visualState: "faint_path" },
  { id: "offering", title: "Offering", state: { entries: [], visual_state: "empty_stone" }, visualState: "empty_stone" },
  { id: "candle", title: "Candle", state: { entries: [], visual_state: "unlit_wick" }, visualState: "unlit_wick" },
  { id: "searching_for_signs", title: "Searching For Signs", state: { entries: [], visual_state: "single_feather" }, visualState: "single_feather" },
  { id: "waiting_gate", title: "Waiting Gate", state: { entries: [], visual_state: "closed_gate" }, visualState: "closed_gate" },
];
const MOORS_RITUALS = [
  { id: "canopy_cloak", title: "Canopy Cloak", state: { entries: [], visual_state: "heavy_canopy" }, visualState: "heavy_canopy" },
  { id: "mire", title: "Mire", state: { entries: [], visual_state: "deep_mire" }, visualState: "deep_mire" },
  { id: "bramble", title: "Bramble", state: { entries: [], visual_state: "closed_bramble" }, visualState: "closed_bramble" },
  { id: "fog", title: "Fog", state: { entries: [], visual_state: "dense_fog" }, visualState: "dense_fog" },
  { id: "vanishing_path", title: "Vanishing Path", state: { entries: [], visual_state: "dark_path" }, visualState: "dark_path" },
];
const FIRST_BLOOM_RITUALS = [
  { id: "grounding", title: "Grounding", state: { entries: [], visual_state: "quiet_roots" }, visualState: "quiet_roots" },
  { id: "opening", title: "Opening", state: { entries: [], visual_state: "closed_bud" }, visualState: "closed_bud" },
  { id: "anchoring", title: "Anchoring", state: { entries: [], visual_state: "shallow_roots" }, visualState: "shallow_roots" },
  { id: "emergence", title: "Emergence", state: { entries: [], visual_state: "waiting_stem" }, visualState: "waiting_stem" },
  { id: "integration", title: "Integration", state: { entries: [], visual_state: "open_meadow" }, visualState: "open_meadow" },
];
const MEADOW_RITUALS = [...FROZEN_GROUND_RITUALS, ...STORM_GARDEN_RITUALS, ...CROSSROADS_RITUALS, ...MOORS_RITUALS, ...FIRST_BLOOM_RITUALS];

export function fromEvergreenSupabaseRows(userId, rows, now) {
  const state = createEmptyMeadowState(userId, now);
  const worldRow = rows.worldState;
  const chapterRow = rows.chapterState;
  const chapterRows = rows.chapterStates ?? (chapterRow ? [chapterRow] : []);
  const ritualRows = rows.ritualStates ?? (rows.ritualState ? [rows.ritualState] : []);
  const ritualRow = ritualRows.find((row) => row?.ritual_id === EVERGREEN_TREE_ID) ?? rows.ritualState;
  const memoryRows = [...(rows.memoryObjects || [])].sort((a, b) =>
    String(a.created_at || "").localeCompare(String(b.created_at || ""))
  );
  const evergreenMemoryRows = memoryRows.filter((row) => (row.ritual_id ?? EVERGREEN_TREE_ID) === EVERGREEN_TREE_ID);

  if (worldRow) {
    state.worldState = {
      userId,
      totalMemories: worldRow.total_memories ?? memoryRows.length,
      lastVisitedChapterId: worldRow.last_visited_chapter_id ?? null,
      lastVisitedRitualId: worldRow.last_visited_ritual_id ?? null,
      wildlifeFamiliarity: worldRow.wildlife_familiarity ?? {},
      createdAt: worldRow.created_at ?? now,
      updatedAt: worldRow.updated_at ?? worldRow.created_at ?? now,
    };
  }

  for (const row of chapterRows) {
    if (!row) continue;
    const stateKey = chapterStateKeyFor(row.chapter_id);
    if (!stateKey) continue;

    state.chapterState[stateKey] = {
      ...state.chapterState[stateKey],
      chapterId: row.chapter_id ?? state.chapterState[stateKey].chapterId,
      unlocked: row.state?.unlocked ?? state.chapterState[stateKey].unlocked,
      visitCount: row.visit_count ?? 0,
      memoryCount: row.memory_count ?? memoryRows.filter((memoryRow) => memoryRow.chapter_id === row.chapter_id).length,
      chapterComplete: row.state?.chapter_complete ?? state.chapterState[stateKey].chapterComplete ?? false,
      weatherState: row.weather_state ?? state.chapterState[stateKey].weatherState,
      updatedAt: row.updated_at ?? now,
    };
  }

  state.memoryObjects = memoryRows.map((row) => ({
    id: row.id,
    userId: row.user_id ?? userId,
    memoryType: row.memory_type ?? "thought",
    chapterId: row.chapter_id ?? FROZEN_GROUND_ID,
    ritualId: row.ritual_id ?? EVERGREEN_TREE_ID,
    selectedThought: row.selected_thought ?? "",
    context: row.context ?? "",
    customText: row.custom_text ?? "",
    createdAt: row.created_at ?? now,
  }));

  const tags = mergePersistedTagsWithMemoryRows(ritualRow?.state?.tags ?? [], evergreenMemoryRows);

  if (ritualRow) {
    state.ritualState.evergreenTree = {
      ritualId: ritualRow.ritual_id ?? EVERGREEN_TREE_ID,
      chapterId: ritualRow.chapter_id ?? FROZEN_GROUND_ID,
      visitCount: ritualRow.visit_count ?? tags.length,
      tags,
      branchFullness: ritualRow.branch_fullness ?? branchFullnessFor(tags.length),
      lanternWarmth: ritualRow.lantern_warmth ?? lanternWarmthFor(tags.length),
      rootVisibility: ritualRow.root_visibility ?? rootVisibilityFor(tags.length),
      wildlifeWitnesses: ritualRow.wildlife_witnesses ?? ["rabbit", "chickadee"],
      updatedAt: ritualRow.updated_at ?? now,
    };
  } else {
    state.ritualState.evergreenTree.tags = tags;
    state.ritualState.evergreenTree.visitCount = tags.length;
    state.ritualState.evergreenTree.branchFullness = branchFullnessFor(tags.length);
    state.ritualState.evergreenTree.lanternWarmth = lanternWarmthFor(tags.length);
    state.ritualState.evergreenTree.rootVisibility = rootVisibilityFor(tags.length);
  }

  for (const row of ritualRows) {
    if (!row || row.ritual_id === EVERGREEN_TREE_ID) continue;

    const stateKey = stateKeyForRitual(row.ritual_id);
    if (!stateKey) continue;

    const ritualMemoryRows = memoryRows.filter((memoryRow) => memoryRow.ritual_id === row.ritual_id);
    const entries = mergePersistedEntriesWithMemoryRows(row.state?.entries ?? [], ritualMemoryRows, row.ritual_id);

    state.ritualState[stateKey] = {
      ritualId: row.ritual_id,
      chapterId: row.chapter_id ?? FROZEN_GROUND_ID,
      visitCount: row.visit_count ?? entries.length,
      entries,
      visualState: row.state?.visual_state ?? row.branch_fullness ?? visualStateFor(row.ritual_id, entries.length),
      updatedAt: row.updated_at ?? now,
    };
  }

  return state;
}

export function buildMissingMeadowBootstrapRows(user, existing, now) {
  const existingRitualRows = existing.ritualStates ?? (existing.ritualState ? [existing.ritualState] : []);
  const existingRitualIds = new Set(existingRitualRows.map((row) => row?.ritual_id).filter(Boolean));
  const existingChapterRows = existing.chapterStates ?? (existing.chapterState ? [existing.chapterState] : []);
  const existingChapterIds = new Set(existingChapterRows.map((row) => row?.chapter_id).filter(Boolean));
  const chapterStates = [
    { id: FROZEN_GROUND_ID, weatherState: "still_snow", unlocked: true },
    { id: STORM_GARDEN_ID, weatherState: "waiting_clouds", unlocked: false },
    { id: CROSSROADS_ID, weatherState: "closed_lanterns", unlocked: false },
    { id: THE_MOORS_ID, weatherState: "closed_fog", unlocked: false },
    { id: FIRST_BLOOM_ID, weatherState: "closed_field", unlocked: false },
  ]
    .filter((chapter) => !existingChapterIds.has(chapter.id))
    .map((chapter) => createBootstrapChapterStateRow(user.id, chapter, now));
  const ritualStates = MEADOW_RITUALS
    .filter((ritual) => !existingRitualIds.has(ritual.id))
    .map((ritual, index) => createBootstrapRitualStateRow(user.id, ritual, index + 1, now));
  const evergreenRitualState = ritualStates.find((row) => row.ritual_id === EVERGREEN_TREE_ID) ?? null;

  return {
    profile: existing.profile
      ? null
      : {
          id: user.id,
          email: user.email ?? null,
          preferences: {},
          created_at: now,
          updated_at: now,
        },
    worldState: existing.worldState
      ? null
      : {
          user_id: user.id,
          total_memories: 0,
          last_visited_chapter_id: null,
          last_visited_ritual_id: null,
          wildlife_familiarity: {},
          created_at: now,
          updated_at: now,
        },
    chapterState: existing.chapterState
      ? null
      : chapterStates.find((row) => row.chapter_id === FROZEN_GROUND_ID) ?? null,
    chapterStates,
    ritualState: existing.ritualState
      ? null
      : evergreenRitualState,
    ritualStates,
  };
}

function createBootstrapRitualStateRow(userId, ritual, sortOrder, now) {
  return {
    user_id: userId,
    chapter_id: chapterIdForRitual(ritual.id),
    ritual_id: ritual.id,
    visit_count: 0,
    branch_fullness: ritual.visualState,
    lantern_warmth: "dim",
    root_visibility: "hidden",
    wildlife_witnesses: witnessesForRitual(ritual.id),
    state: ritual.state,
    created_at: now,
    updated_at: now,
  };
}

function createBootstrapChapterStateRow(userId, chapter, now) {
  return {
    user_id: userId,
    chapter_id: chapter.id,
    visit_count: 0,
    memory_count: 0,
    weather_state: chapter.weatherState,
    state: { unlocked: chapter.unlocked, chapter_complete: false },
    created_at: now,
    updated_at: now,
  };
}

function mergePersistedTagsWithMemoryRows(persistedTags, memoryRows) {
  const tagsByMemoryId = new Map(
    persistedTags.map((tag) => [tag.memoryId ?? tag.memory_id, normalizeTag(tag)])
  );

  for (const [index, row] of memoryRows.entries()) {
    if (!tagsByMemoryId.has(row.id)) {
      tagsByMemoryId.set(row.id, tagFromMemoryRow(row, index));
    }
  }

  return [...tagsByMemoryId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function normalizeTag(tag) {
  return {
    id: tag.id,
    memoryId: tag.memoryId ?? tag.memory_id,
    text: tag.text,
    thought: tag.thought,
    context: tag.context,
    branch: tag.branch,
    createdAt: tag.createdAt ?? tag.created_at,
  };
}

function tagFromMemoryRow(row, index) {
  return {
    id: row.visual_state?.tag_id ?? `tag_remote_${index + 1}`,
    memoryId: row.id,
    text: row.custom_text || row.selected_thought || "",
    thought: row.selected_thought || "",
    context: row.context || "",
    branch: row.branch || chooseBranch(index),
    createdAt: row.created_at,
  };
}

function mergePersistedEntriesWithMemoryRows(persistedEntries, memoryRows, ritualId) {
  const entriesByMemoryId = new Map(
    persistedEntries.map((entry) => [entry.memoryId ?? entry.memory_id, normalizeEntry(entry)])
  );

  for (const [index, row] of memoryRows.entries()) {
    if (!entriesByMemoryId.has(row.id)) {
      entriesByMemoryId.set(row.id, entryFromMemoryRow(row, ritualId, index));
    }
  }

  return [...entriesByMemoryId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function normalizeEntry(entry) {
  return {
    id: entry.id,
    memoryId: entry.memoryId ?? entry.memory_id,
    text: entry.text,
    response: entry.response,
    createdAt: entry.createdAt ?? entry.created_at,
  };
}

function entryFromMemoryRow(row, ritualId, index) {
  return {
    id: row.visual_state?.entry_id ?? `entry_${ritualId}_${index + 1}`,
    memoryId: row.id,
    text: row.custom_text || row.selected_thought || "",
    response: row.selected_thought || "",
    createdAt: row.created_at,
  };
}

function stateKeyForRitual(ritualId) {
  const stateKeys = {
    frosted_window: "frostedWindow",
    frozen_pond: "frozenPond",
    quiet_hour: "quietHour",
    footprints: "footprints",
    lightning_tree: "lightningTree",
    thorn_patch: "thornPatch",
    floodwaters: "floodwaters",
    scorched_earth: "scorchedEarth",
    shattered_mirror: "shatteredMirror",
    worn_path: "wornPath",
    offering: "offering",
    candle: "candle",
    searching_for_signs: "searchingForSigns",
    waiting_gate: "waitingGate",
    canopy_cloak: "canopyCloak",
    mire: "mire",
    bramble: "bramble",
    fog: "fog",
    vanishing_path: "vanishingPath",
    grounding: "grounding",
    opening: "opening",
    anchoring: "anchoring",
    emergence: "emergence",
    integration: "integration",
  };

  return stateKeys[ritualId] ?? null;
}

function chapterStateKeyFor(chapterId) {
  if (chapterId === FROZEN_GROUND_ID) return "frozenGround";
  if (chapterId === STORM_GARDEN_ID) return "stormGarden";
  if (chapterId === CROSSROADS_ID) return "crossroads";
  if (chapterId === THE_MOORS_ID) return "theMoors";
  if (chapterId === FIRST_BLOOM_ID) return "firstBloom";
  return null;
}

function chapterIdForRitual(ritualId) {
  if (FIRST_BLOOM_RITUALS.some((ritual) => ritual.id === ritualId)) return FIRST_BLOOM_ID;
  if (MOORS_RITUALS.some((ritual) => ritual.id === ritualId)) return THE_MOORS_ID;
  if (CROSSROADS_RITUALS.some((ritual) => ritual.id === ritualId)) return CROSSROADS_ID;
  return STORM_GARDEN_RITUALS.some((ritual) => ritual.id === ritualId) ? STORM_GARDEN_ID : FROZEN_GROUND_ID;
}

function witnessesForRitual(ritualId) {
  if (chapterIdForRitual(ritualId) === STORM_GARDEN_ID) return ["crow"];
  if (ritualId === "candle" || ritualId === "searching_for_signs") return ["moth"];
  if (ritualId === "waiting_gate") return ["snail", "moth"];
  if (chapterIdForRitual(ritualId) === CROSSROADS_ID) return ["snail"];
  if (chapterIdForRitual(ritualId) === THE_MOORS_ID) return ["owl"];
  if (chapterIdForRitual(ritualId) === FIRST_BLOOM_ID) return ["robin", "bee"];
  return ["rabbit", "chickadee"];
}

function visualStateFor(ritualId, memoryCount) {
  if (ritualId === "frosted_window") return memoryCount > 0 ? "cleared_glass" : "frosted";
  if (ritualId === "frozen_pond") return memoryCount > 0 ? "first_crack" : "sealed_ice";
  if (ritualId === "quiet_hour") return memoryCount > 0 ? "lantern_hour" : "still_clock";
  if (ritualId === "footprints") return memoryCount > 0 ? "single_trail" : "unmarked_snow";
  if (ritualId === "lightning_tree") return memoryCount > 0 ? "first_scar" : "fresh_damage";
  if (ritualId === "thorn_patch") return memoryCount > 0 ? "first_blooms" : "mostly_thorns";
  if (ritualId === "floodwaters") return memoryCount > 0 ? "visible_channels" : "flood";
  if (ritualId === "scorched_earth") return memoryCount > 0 ? "green_shoots" : "burned";
  if (ritualId === "shattered_mirror") return memoryCount > 0 ? "held_reflection" : "few_reflections";
  if (ritualId === "worn_path") return memoryCount > 0 ? "deepened_path" : "faint_path";
  if (ritualId === "offering") return memoryCount > 0 ? "weathering_stone" : "empty_stone";
  if (ritualId === "candle") return memoryCount > 0 ? "wax_history" : "unlit_wick";
  if (ritualId === "searching_for_signs") return memoryCount > 0 ? "signs_accumulating" : "single_feather";
  if (ritualId === "waiting_gate") return memoryCount > 0 ? "remembered_threshold" : "closed_gate";
  if (ritualId === "canopy_cloak") return memoryCount > 0 ? "first_opening" : "heavy_canopy";
  if (ritualId === "mire") return memoryCount > 0 ? "standing_stone" : "deep_mire";
  if (ritualId === "bramble") return memoryCount > 0 ? "breathing_space" : "closed_bramble";
  if (ritualId === "fog") return memoryCount > 0 ? "familiar_landmark" : "dense_fog";
  if (ritualId === "vanishing_path") return memoryCount > 0 ? "path_remains" : "dark_path";
  if (ritualId === "grounding") return memoryCount > 0 ? "root_threads" : "quiet_roots";
  if (ritualId === "opening") return memoryCount > 0 ? "opening_bud" : "closed_bud";
  if (ritualId === "anchoring") return memoryCount > 0 ? "root_network" : "shallow_roots";
  if (ritualId === "emergence") return memoryCount > 0 ? "first_bloom" : "waiting_stem";
  if (ritualId === "integration") return memoryCount > 0 ? "living_meadow" : "open_meadow";
  return "quiet";
}

function chooseBranch(index) {
  const branches = ["lower_left", "lower_right", "middle_left", "middle_right", "upper_center"];
  return branches[index % branches.length];
}

function branchFullnessFor(memoryCount) {
  if (memoryCount >= 50) return "archive_canopy";
  if (memoryCount >= 25) return "rooted_cluster";
  if (memoryCount >= 10) return "memory_branches";
  if (memoryCount >= 5) return "tag_clusters";
  if (memoryCount > 0) return "few_tags";
  return "sparse";
}

function lanternWarmthFor(memoryCount) {
  if (memoryCount >= 25) return "bright";
  if (memoryCount > 0) return "kindled";
  return "dim";
}

function rootVisibilityFor(memoryCount) {
  if (memoryCount >= 25) return "visible";
  if (memoryCount > 0) return "beneath_snow";
  return "hidden";
}
