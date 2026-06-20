export const EVERGREEN_THOUGHTS = [
  "It doesn't feel real.",
  "I still expect them to call.",
  "I forgot for a moment.",
  "I thought I saw them.",
  "I keep looking for them.",
  "I still wait.",
];

const FROZEN_GROUND_ID = "frozen_ground";
const STORM_GARDEN_ID = "storm_garden";
const CROSSROADS_ID = "crossroads";
const THE_MOORS_ID = "the_moors";
const FIRST_BLOOM_ID = "first_bloom";
const EVERGREEN_TREE_ID = "evergreen_tree";

const frozenGroundRitualStateById = {
  frosted_window: {
    stateKey: "frostedWindow",
    visualState: "frosted",
  },
  frozen_pond: {
    stateKey: "frozenPond",
    visualState: "sealed_ice",
  },
  quiet_hour: {
    stateKey: "quietHour",
    visualState: "still_clock",
  },
  footprints: {
    stateKey: "footprints",
    visualState: "unmarked_snow",
  },
};

const placeNamesByRitualId = {
  evergreen_tree: "Evergreen Tree",
  frosted_window: "Frosted Window",
  frozen_pond: "Frozen Pond",
  quiet_hour: "Quiet Hour",
  footprints: "Footprints",
  lightning_tree: "Lightning Tree",
  thorn_patch: "Thorn Patch",
  floodwaters: "Floodwaters",
  scorched_earth: "Scorched Earth",
  shattered_mirror: "Shattered Mirror",
  worn_path: "Worn Path",
  offering: "Offering",
  candle: "Candle",
  searching_for_signs: "Searching For Signs",
  waiting_gate: "Waiting Gate",
  canopy_cloak: "Canopy Cloak",
  mire: "Mire",
  bramble: "Bramble",
  fog: "Fog",
  vanishing_path: "Vanishing Path",
  grounding: "Grounding",
  opening: "Opening",
  anchoring: "Anchoring",
  emergence: "Emergence",
  integration: "Integration",
};

const routesByRitualId = {
  evergreen_tree: "/evergreen-tree",
  frosted_window: "/frosted-window",
  frozen_pond: "/frozen-pond",
  quiet_hour: "/quiet-hour",
  footprints: "/footprints",
  lightning_tree: "/lightning-tree",
  thorn_patch: "/thorn-patch",
  floodwaters: "/floodwaters",
  scorched_earth: "/scorched-earth",
  shattered_mirror: "/shattered-mirror",
  worn_path: "/worn-path",
  offering: "/offering",
  candle: "/candle",
  searching_for_signs: "/searching-for-signs",
  waiting_gate: "/waiting-gate",
  canopy_cloak: "/canopy-cloak",
  mire: "/mire",
  bramble: "/bramble",
  fog: "/fog",
  vanishing_path: "/vanishing-path",
  grounding: "/grounding",
  opening: "/opening",
  anchoring: "/anchoring",
  emergence: "/emergence",
  integration: "/integration",
};

export function createEmptyMeadowState(userId, createdAt) {
  return {
    userId,
    worldState: {
      userId,
      totalMemories: 0,
      lastVisitedChapterId: null,
      lastVisitedRitualId: null,
      wildlifeFamiliarity: {},
      createdAt,
      updatedAt: createdAt,
    },
    chapterState: {
      frozenGround: {
        chapterId: FROZEN_GROUND_ID,
        unlocked: true,
        visitCount: 0,
        memoryCount: 0,
        chapterComplete: false,
        weatherState: "still_snow",
        updatedAt: createdAt,
      },
      stormGarden: {
        chapterId: STORM_GARDEN_ID,
        unlocked: false,
        visitCount: 0,
        memoryCount: 0,
        chapterComplete: false,
        weatherState: "waiting_clouds",
        updatedAt: createdAt,
      },
      crossroads: {
        chapterId: CROSSROADS_ID,
        unlocked: false,
        visitCount: 0,
        memoryCount: 0,
        chapterComplete: false,
        weatherState: "closed_lanterns",
        updatedAt: createdAt,
      },
      theMoors: {
        chapterId: THE_MOORS_ID,
        unlocked: false,
        visitCount: 0,
        memoryCount: 0,
        chapterComplete: false,
        weatherState: "closed_fog",
        updatedAt: createdAt,
      },
      firstBloom: {
        chapterId: FIRST_BLOOM_ID,
        unlocked: false,
        visitCount: 0,
        memoryCount: 0,
        chapterComplete: false,
        weatherState: "closed_field",
        updatedAt: createdAt,
      },
    },
    ritualState: {
      evergreenTree: {
        ritualId: EVERGREEN_TREE_ID,
        chapterId: FROZEN_GROUND_ID,
        visitCount: 0,
        tags: [],
        branchFullness: "sparse",
        lanternWarmth: "dim",
        rootVisibility: "hidden",
        wildlifeWitnesses: ["rabbit", "chickadee"],
        updatedAt: createdAt,
      },
    },
    memoryObjects: [],
  };
}

export function saveEvergreenMemory(state, input) {
  const next = structuredClone(state);
  const memoryId = createMemoryId(input.createdAt, next.memoryObjects.length + 1, next.userId);
  const tagId = `tag_${next.ritualState.evergreenTree.tags.length + 1}`;
  const selectedThought = input.thought?.trim() || "Write my own.";
  const offering = input.offering?.trim() || "";
  const createdAt = input.createdAt;

  const memoryObject = {
    id: memoryId,
    userId: next.userId,
    memoryType: "thought",
    chapterId: FROZEN_GROUND_ID,
    ritualId: EVERGREEN_TREE_ID,
    selectedThought,
    context: input.context,
    customText: offering,
    createdAt,
  };

  const tag = {
    id: tagId,
    memoryId,
    text: offering || selectedThought,
    thought: selectedThought,
    context: input.context,
    branch: chooseBranch(next.ritualState.evergreenTree.tags.length),
    createdAt,
  };

  next.memoryObjects.push(memoryObject);
  next.ritualState.evergreenTree.tags.push(tag);
  next.ritualState.evergreenTree.visitCount += 1;
  next.ritualState.evergreenTree.branchFullness = branchFullnessFor(next.ritualState.evergreenTree.tags.length);
  next.ritualState.evergreenTree.lanternWarmth = lanternWarmthFor(next.ritualState.evergreenTree.tags.length);
  next.ritualState.evergreenTree.rootVisibility = rootVisibilityFor(next.ritualState.evergreenTree.tags.length);
  next.ritualState.evergreenTree.updatedAt = createdAt;

  next.chapterState.frozenGround.visitCount += 1;
  next.chapterState.frozenGround.memoryCount += 1;
  next.chapterState.frozenGround.chapterComplete = isFrozenGroundChapterComplete(next);
  next.chapterState.stormGarden.unlocked = next.chapterState.frozenGround.chapterComplete;
  next.chapterState.frozenGround.updatedAt = createdAt;

  next.worldState.totalMemories += 1;
  next.worldState.lastVisitedChapterId = FROZEN_GROUND_ID;
  next.worldState.lastVisitedRitualId = EVERGREEN_TREE_ID;
  next.worldState.wildlifeFamiliarity.rabbit = (next.worldState.wildlifeFamiliarity.rabbit || 0) + 1;
  next.worldState.wildlifeFamiliarity.chickadee = (next.worldState.wildlifeFamiliarity.chickadee || 0) + 1;
  next.worldState.updatedAt = createdAt;

  return next;
}

export function markMeadowChapterVisited(state, chapterId, visitedAt) {
  if (chapterId !== FROZEN_GROUND_ID && chapterId !== STORM_GARDEN_ID && chapterId !== CROSSROADS_ID && chapterId !== THE_MOORS_ID && chapterId !== FIRST_BLOOM_ID) {
    throw new Error(`Unknown Meadow chapter: ${chapterId}`);
  }

  const next = structuredClone(state);
  if (chapterId === FROZEN_GROUND_ID) {
    next.chapterState.frozenGround.visitCount += 1;
    next.chapterState.frozenGround.updatedAt = visitedAt;
  } else {
    const chapterKey = chapterId === STORM_GARDEN_ID ? "stormGarden" : chapterId === CROSSROADS_ID ? "crossroads" : chapterId === THE_MOORS_ID ? "theMoors" : "firstBloom";
    next.chapterState[chapterKey].visitCount += 1;
    next.chapterState[chapterKey].updatedAt = visitedAt;
  }
  next.worldState.lastVisitedChapterId = chapterId;
  next.worldState.updatedAt = visitedAt;
  return next;
}

export function markMeadowRitualVisited(state, ritualId, visitedAt) {
  const next = structuredClone(state);

  if (ritualId === EVERGREEN_TREE_ID) {
    next.ritualState.evergreenTree.visitCount += 1;
    next.ritualState.evergreenTree.updatedAt = visitedAt;
  } else {
    const ritual = frozenGroundRitualStateById[ritualId];
    if (!ritual) {
      throw new Error(`Unknown Meadow ritual: ${ritualId}`);
    }

    const existing = next.ritualState[ritual.stateKey] ?? {
      ritualId,
      chapterId: FROZEN_GROUND_ID,
      visitCount: 0,
      entries: [],
      visualState: ritual.visualState,
      updatedAt: visitedAt,
    };

    next.ritualState[ritual.stateKey] = {
      ...existing,
      visitCount: existing.visitCount + 1,
      updatedAt: visitedAt,
    };
  }

  next.chapterState.frozenGround.visitCount += 1;
  next.chapterState.frozenGround.updatedAt = visitedAt;
  next.worldState.lastVisitedChapterId = FROZEN_GROUND_ID;
  next.worldState.lastVisitedRitualId = ritualId;
  next.worldState.updatedAt = visitedAt;
  return next;
}

export function isFrozenGroundChapterComplete(state) {
  const evergreenHasMemory = (state?.ritualState?.evergreenTree?.tags?.length ?? 0) > 0;
  const frostedWindowHasMemory = (state?.ritualState?.frostedWindow?.entries?.length ?? 0) > 0;
  const frozenPondHasMemory = (state?.ritualState?.frozenPond?.entries?.length ?? 0) > 0;
  const quietHourHasMemory = (state?.ritualState?.quietHour?.entries?.length ?? 0) > 0;
  const footprintsHasMemory = (state?.ritualState?.footprints?.entries?.length ?? 0) > 0;

  return evergreenHasMemory && frostedWindowHasMemory && frozenPondHasMemory && quietHourHasMemory && footprintsHasMemory;
}

export function getLatestMeadowMemory(state) {
  const memories = [...(state?.memoryObjects ?? [])].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  const latest = memories[0];

  if (!latest) {
    return null;
  }

  const place = placeNamesByRitualId[latest.ritualId] ?? latest.context ?? "The Meadow";

  return {
    id: latest.id,
    text: latest.customText || latest.selectedThought || "",
    supportingText: latest.customText ? latest.selectedThought : latest.context,
    place,
    ritualId: latest.ritualId,
    route: routesByRitualId[latest.ritualId] ?? "/frozen-ground",
    createdAt: latest.createdAt,
  };
}

export function getEvergreenSaveCopy(isSaving) {
  return isSaving ? "The tree is keeping it" : "Let the tree keep this";
}

function createMemoryId(createdAt, sequence, userId) {
  return uuidFromSeed(`${userId}:${createdAt}:${sequence}`);
}

function uuidFromSeed(seed) {
  let hash = 2166136261;
  let hex = "";

  for (let index = 0; hex.length < 32; index += 1) {
    const code = seed.charCodeAt(index % seed.length);
    hash ^= code + index;
    hash = Math.imul(hash, 16777619) >>> 0;
    hex += hash.toString(16).padStart(8, "0");
  }

  hex = hex.slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function getEvergreenReturnState(state) {
  const evergreen = state.ritualState.evergreenTree;
  const tags = evergreen.tags.map((tag) => ({
    ...tag,
    dateLabel: formatMemoryDate(tag.createdAt),
  }));

  return {
    hasReturned: evergreen.tags.length > 0,
    tags,
    visibleEvolution: visibleEvolutionFor(evergreen.tags.length),
    branchFullness: evergreen.branchFullness,
    lanternWarmth: evergreen.lanternWarmth,
    rootVisibility: evergreen.rootVisibility,
    wildlifeWitnesses: evergreen.wildlifeWitnesses,
    message: evergreen.tags.length > 0 ? "The tree kept what you left here." : "The tree is waiting quietly.",
  };
}

function formatMemoryDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "A remembered day";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
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

function visibleEvolutionFor(memoryCount) {
  if (memoryCount >= 100) return "living_archive";
  if (memoryCount >= 50) return "archive_canopy";
  if (memoryCount >= 25) return "root_visibility";
  if (memoryCount >= 10) return "memory_branches";
  if (memoryCount >= 5) return "tag_clusters";
  if (memoryCount > 0) return "few_tags";
  return "empty_tree";
}
