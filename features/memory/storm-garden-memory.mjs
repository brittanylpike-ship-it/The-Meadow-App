import { markMeadowChapterVisited } from "./evergreen-tree-memory.mjs";

const STORM_GARDEN_ID = "storm_garden";

export const stormGardenRituals = [
  {
    id: "lightning_tree",
    stateKey: "lightningTree",
    title: "Lightning Tree",
    memoryType: "emotion",
    prompt: "Where did the anger arrive suddenly?",
    options: [
      "A sudden impact.",
      "A sentence I could not stop hearing.",
      "A moment that split the day.",
      "A flash I did not choose.",
      "A strike I can finally name.",
    ],
    returnMessage: "The Lightning Tree remembers where the strike landed.",
  },
  {
    id: "thorn_patch",
    stateKey: "thornPatch",
    title: "Thorn Patch",
    memoryType: "emotion",
    prompt: "What caught underneath the anger?",
    options: [
      "What caught underneath.",
      "The hurt beneath the thorn.",
      "A place I kept protected.",
      "A sharp edge around grief.",
      "Something tender under the bramble.",
    ],
    returnMessage: "The Thorn Patch remembers what it was protecting.",
  },
  {
    id: "floodwaters",
    stateKey: "floodwaters",
    title: "Floodwaters",
    memoryType: "emotion",
    prompt: "Where did the pressure rise?",
    options: [
      "The pressure rose.",
      "A current pulled at me.",
      "Too much arrived at once.",
      "I could not find the bank.",
      "The water kept moving.",
    ],
    returnMessage: "Floodwaters remember the pressure and the channels it carved.",
  },
  {
    id: "scorched_earth",
    stateKey: "scorchedEarth",
    title: "Scorched Earth",
    memoryType: "emotion",
    prompt: "What felt burned?",
    options: [
      "What was burned.",
      "The ground after the heat.",
      "A place I thought was gone.",
      "The ash that stayed.",
      "Something surviving under the blackened place.",
    ],
    returnMessage: "Scorched Earth remembers the scar and what may grow around it.",
  },
  {
    id: "shattered_mirror",
    stateKey: "shatteredMirror",
    title: "Shattered Mirror",
    memoryType: "emotion",
    prompt: "Where did the anger point?",
    options: [
      "Where the anger pointed.",
      "A reflection I could not hold.",
      "A shard of blame.",
      "A direction that hurt to see.",
      "The piece that kept reflecting back.",
    ],
    returnMessage: "The Shattered Mirror remembers the reflection without throwing it back.",
  },
];

export const stormGardenLandmarks = stormGardenRituals.map((ritual) => ({
  id: ritual.id,
  title: ritual.title,
  emotionalThread: threadFor(ritual.id),
  description: descriptionFor(ritual.id),
  route: routeFor(ritual.id),
  enabled: true,
}));

export function markStormGardenVisited(state, visitedAt) {
  const next = markMeadowChapterVisited(state, STORM_GARDEN_ID, visitedAt);
  next.chapterState.stormGarden.unlocked = true;
  return next;
}

export function saveStormGardenRitualMemory(state, ritualId, input) {
  const ritual = findRitual(ritualId);
  const next = structuredClone(state);
  next.chapterState.stormGarden.unlocked = true;

  const createdAt = input.createdAt;
  const response = input.response?.trim() || ritual.options[0];
  const detail = input.detail?.trim() || "";
  const existing = next.ritualState[ritual.stateKey] ?? createEmptyRitualState(ritual, createdAt);
  const memoryId = createMemoryId(createdAt, next.memoryObjects.length + 1, next.userId, ritual.id);
  const entry = {
    id: `entry_${ritual.id}_${existing.entries.length + 1}`,
    memoryId,
    text: detail || response,
    response,
    createdAt,
  };

  next.memoryObjects.push({
    id: memoryId,
    userId: next.userId,
    memoryType: ritual.memoryType,
    chapterId: STORM_GARDEN_ID,
    ritualId: ritual.id,
    selectedThought: response,
    context: ritual.title,
    customText: detail,
    createdAt,
  });

  next.ritualState[ritual.stateKey] = {
    ...existing,
    visitCount: existing.visitCount + 1,
    entries: [...existing.entries, entry],
    visualState: visualStateFor(ritual.id, existing.entries.length + 1),
    wildlifeWitnesses: ["crow"],
    updatedAt: createdAt,
  };

  next.chapterState.stormGarden.visitCount += 1;
  next.chapterState.stormGarden.memoryCount += 1;
  next.chapterState.stormGarden.chapterComplete = isStormGardenChapterComplete(next);
  next.chapterState.crossroads.unlocked = next.chapterState.stormGarden.chapterComplete;
  next.chapterState.stormGarden.weatherState = weatherStateFor(next.chapterState.stormGarden.memoryCount, next.chapterState.stormGarden.chapterComplete);
  next.chapterState.stormGarden.updatedAt = createdAt;

  next.worldState.totalMemories += 1;
  next.worldState.lastVisitedChapterId = STORM_GARDEN_ID;
  next.worldState.lastVisitedRitualId = ritual.id;
  next.worldState.wildlifeFamiliarity.crow = (next.worldState.wildlifeFamiliarity.crow || 0) + 1;
  next.worldState.updatedAt = createdAt;

  return next;
}

export function getStormGardenChapterIntro(state) {
  const storm = state?.chapterState?.stormGarden;
  const unlocked = Boolean(storm?.unlocked);

  if (!unlocked) {
    return {
      locked: true,
      subtitle: "Storm Garden waits beyond Chapter One.",
      title: "The gate is still closed",
      body: "Frozen Ground must be held before the storm opens.",
    };
  }

  if (storm?.chapterComplete) {
    return {
      locked: false,
      subtitle: "Chapter Two is held in the rain.",
      title: "The storm has begun to remember",
      body: "The tree, thorns, waters, earth, and mirror all hold what moved through you.",
    };
  }

  if ((storm?.memoryCount ?? 0) > 0) {
    return {
      locked: false,
      subtitle: "Storm Garden has begun to remember what moved through.",
      title: "The rain knows a path",
      body: "Return to any storm place and it will meet you with what changed.",
    };
  }

  return {
    locked: false,
    subtitle: "A weather-driven chapter for anger that needed somewhere to go.",
    title: "The storm gate has opened",
    body: "This place can hold force without turning it into harm.",
  };
}

export function getStormGardenRitualReturnState(state, ritualId) {
  const ritual = findRitual(ritualId);
  const ritualState = state.ritualState[ritual.stateKey] ?? createEmptyRitualState(ritual, state.worldState.updatedAt);
  const entries = ritualState.entries.map((entry) => ({
    ...entry,
    dateLabel: formatMemoryDate(entry.createdAt),
  }));

  return {
    title: ritual.title,
    prompt: ritual.prompt,
    options: ritual.options,
    hasReturned: entries.length > 0,
    entries,
    visualState: ritualState.visualState,
    visualStateLabel: visualStateLabelFor(ritualState.visualState),
    wildlifeWitnesses: ["crow"],
    witnessLabel: "A crow has witnessed this place.",
    message: entries.length > 0 ? ritual.returnMessage : `${ritual.title} is waiting in the rain.`,
  };
}

export function getStormGardenLandmarkReturnSummary(state, landmarkId) {
  const landmark = stormGardenLandmarks.find((candidate) => candidate.id === landmarkId);
  const ritual = findRitual(landmarkId);
  const returnState = state ? getStormGardenRitualReturnState(state, ritual.id) : null;
  const memoryCount = returnState?.entries.length ?? 0;

  return {
    hasMemory: memoryCount > 0,
    memoryCount,
    description: memoryCount > 0 ? returnState.message : landmark?.description ?? "",
    buttonLabel: memoryCount > 0 ? `Return to ${ritual.title}` : "Enter this place",
    route: routeFor(ritual.id),
  };
}

export function isStormGardenChapterComplete(state) {
  return stormGardenRituals.every((ritual) => (state?.ritualState?.[ritual.stateKey]?.entries?.length ?? 0) > 0);
}

export function getStormGardenRitualById(ritualId) {
  return findRitual(ritualId);
}

export function getStormGardenRitualSaveCopy(ritualId, isSaving) {
  const place = {
    lightning_tree: "tree",
    thorn_patch: "thorns",
    floodwaters: "waters",
    scorched_earth: "earth",
    shattered_mirror: "mirror",
  }[findRitual(ritualId).id];

  if (ritualId === "lightning_tree") {
    return isSaving ? "The tree is keeping it" : "Let the tree hold this strike";
  }

  if (ritualId === "shattered_mirror") {
    return isSaving ? "The mirror is keeping it" : "Let the mirror hold this reflection";
  }

  return isSaving ? `The ${place} is keeping it` : `Let the ${place} keep this`;
}

function createEmptyRitualState(ritual, createdAt) {
  return {
    ritualId: ritual.id,
    chapterId: STORM_GARDEN_ID,
    visitCount: 0,
    entries: [],
    visualState: visualStateFor(ritual.id, 0),
    wildlifeWitnesses: ["crow"],
    updatedAt: createdAt,
  };
}

function findRitual(ritualId) {
  const ritual = stormGardenRituals.find((candidate) => candidate.id === ritualId);
  if (!ritual) {
    throw new Error(`Unknown Storm Garden ritual: ${ritualId}`);
  }
  return ritual;
}

function routeFor(ritualId) {
  return {
    lightning_tree: "/lightning-tree",
    thorn_patch: "/thorn-patch",
    floodwaters: "/floodwaters",
    scorched_earth: "/scorched-earth",
    shattered_mirror: "/shattered-mirror",
  }[ritualId];
}

function threadFor(ritualId) {
  return {
    lightning_tree: "Sudden impact",
    thorn_patch: "What caught underneath",
    floodwaters: "Overwhelm",
    scorched_earth: "What was burned",
    shattered_mirror: "Direction of anger",
  }[ritualId];
}

function descriptionFor(ritualId) {
  return {
    lightning_tree: "A struck tree where sudden impact can leave a scar without being erased.",
    thorn_patch: "A bramble where hurt beneath anger can remain visible and protected.",
    floodwaters: "A waterlogged place for pressure, overwhelm, and channels carved by force.",
    scorched_earth: "A burned patch where scars remain and growth may come around them.",
    shattered_mirror: "A broken reflection that can hold where anger pointed without throwing it back.",
  }[ritualId];
}

function visualStateFor(ritualId, memoryCount) {
  if (ritualId === "lightning_tree") return memoryCount > 0 ? "first_scar" : "fresh_damage";
  if (ritualId === "thorn_patch") return memoryCount > 0 ? "first_blooms" : "mostly_thorns";
  if (ritualId === "floodwaters") return memoryCount > 0 ? "visible_channels" : "flood";
  if (ritualId === "scorched_earth") return memoryCount > 0 ? "green_shoots" : "burned";
  if (ritualId === "shattered_mirror") return memoryCount > 0 ? "held_reflection" : "few_reflections";
  return "storm_waiting";
}

function visualStateLabelFor(visualState) {
  const labels = {
    fresh_damage: "The tree waits with fresh damage.",
    first_scar: "A first scar remains visible on the bark.",
    mostly_thorns: "The patch is mostly thorns.",
    first_blooms: "A first bloom has appeared among the thorns.",
    flood: "The water is high and unchanneled.",
    visible_channels: "The water has begun to remember its channels.",
    burned: "The earth is burned and quiet.",
    green_shoots: "Small green shoots have appeared around the scar.",
    few_reflections: "Only a few reflections are visible.",
    held_reflection: "A shard holds the reflection without throwing it back.",
  };

  return labels[visualState] ?? "The storm is holding its shape.";
}

function weatherStateFor(memoryCount, complete) {
  if (complete) return "clearing_rain";
  if (memoryCount > 0) return "charged_rain";
  return "storm_gate_open";
}

function createMemoryId(createdAt, sequence, userId, ritualId) {
  return uuidFromSeed(`${userId}:storm:${ritualId}:${createdAt}:${sequence}`);
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
