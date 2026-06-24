import { markMeadowChapterVisited } from "./evergreen-tree-memory.mjs";

const FIRST_BLOOM_ID = "first_bloom";

export const firstBloomRituals = [
  {
    id: "grounding",
    stateKey: "grounding",
    title: "Grounding",
    memoryType: "growth",
    prompt: "What can meet the ground today?",
    options: [
      "A root under the present moment.",
      "One steady place beneath me.",
      "A small way to be here.",
      "The ground that held after the fog.",
      "A root that does not need to hurry.",
    ],
    returnMessage: "Grounding remembers where the roots found the present moment.",
  },
  {
    id: "opening",
    stateKey: "opening",
    title: "Opening",
    memoryType: "growth",
    prompt: "What can open without being forced?",
    options: [
      "A bud that can stay closed until it is ready.",
      "A small softening.",
      "An opening I do not need to rush.",
      "A place where light can enter gently.",
      "The beginning of room around me.",
    ],
    returnMessage: "Opening remembers the bud that did not need to hurry.",
  },
  {
    id: "anchoring",
    stateKey: "anchoring",
    title: "Anchoring",
    memoryType: "growth",
    prompt: "What helps you stay connected?",
    options: [
      "A root network under the day.",
      "A person, place, or practice that steadies me.",
      "A connection that remains.",
      "Something that helps me belong to this hour.",
      "A quiet anchor in the meadow.",
    ],
    returnMessage: "Anchoring remembers the root network that stayed connected.",
  },
  {
    id: "emergence",
    stateKey: "emergence",
    title: "Emergence",
    memoryType: "growth",
    prompt: "What has begun to come above the soil?",
    options: [
      "Something small came above the soil.",
      "A first sign of life returning.",
      "A bloom that does not erase winter.",
      "A small green thing.",
      "A beginning I can notice.",
    ],
    returnMessage: "Emergence remembers the bloom without asking the field to be finished.",
  },
  {
    id: "integration",
    stateKey: "integration",
    title: "Integration",
    memoryType: "integration",
    prompt: "What can live together now?",
    options: [
      "A living meadow can hold more than one season.",
      "Winter and bloom in the same world.",
      "The past and this hour together.",
      "A grief that belongs inside a life.",
      "A meadow becoming whole without being fixed.",
    ],
    returnMessage: "Integration remembers the meadow becoming one living place.",
  },
];

export const firstBloomLandmarks = firstBloomRituals.map((ritual) => ({
  id: ritual.id,
  title: ritual.title,
  emotionalThread: threadFor(ritual.id),
  description: descriptionFor(ritual.id),
  route: routeFor(ritual.id),
  enabled: true,
}));

export function markFirstBloomVisited(state, visitedAt) {
  const next = markMeadowChapterVisited(state, FIRST_BLOOM_ID, visitedAt);
  next.chapterState.firstBloom.unlocked = true;
  return next;
}

export function saveFirstBloomRitualMemory(state, ritualId, input) {
  const ritual = findRitual(ritualId);
  const next = structuredClone(state);
  next.chapterState.firstBloom.unlocked = true;

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
    chapterId: FIRST_BLOOM_ID,
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
    wildlifeWitnesses: ["robin", "bee"],
    updatedAt: createdAt,
  };

  next.chapterState.firstBloom.visitCount += 1;
  next.chapterState.firstBloom.memoryCount += 1;
  next.chapterState.firstBloom.chapterComplete = isFirstBloomChapterComplete(next);
  next.chapterState.firstBloom.weatherState = weatherStateFor(next.chapterState.firstBloom.memoryCount, next.chapterState.firstBloom.chapterComplete);
  next.chapterState.firstBloom.updatedAt = createdAt;

  next.worldState.totalMemories += 1;
  next.worldState.lastVisitedChapterId = FIRST_BLOOM_ID;
  next.worldState.lastVisitedRitualId = ritual.id;
  next.worldState.wildlifeFamiliarity.robin = (next.worldState.wildlifeFamiliarity.robin || 0) + 1;
  next.worldState.wildlifeFamiliarity.bee = (next.worldState.wildlifeFamiliarity.bee || 0) + 1;
  next.worldState.updatedAt = createdAt;

  return next;
}

export function getFirstBloomChapterIntro(state) {
  const firstBloom = state?.chapterState?.firstBloom;
  const unlocked = Boolean(firstBloom?.unlocked);

  if (!unlocked) {
    return {
      locked: true,
      subtitle: "First Bloom waits beyond The Moors.",
      title: "The field is still closed",
      body: "The Moors must be held before soft growth opens.",
    };
  }

  if (firstBloom?.chapterComplete) {
    return {
      locked: false,
      subtitle: "Chapter Five is held in soft growth.",
      title: "First Bloom remembers what can live",
      body: "The roots, bud, anchors, bloom, and meadow all hold growth without erasing what came before.",
    };
  }

  if ((firstBloom?.memoryCount ?? 0) > 0) {
    return {
      locked: false,
      subtitle: "First Bloom has begun to remember soft growth.",
      title: "The field has one living sign",
      body: "This place can hold a beginning without turning it into a demand.",
    };
  }

  return {
    locked: false,
    subtitle: "A soft chapter for roots, openings, anchors, and growth that does not hurry.",
    title: "A soft place has opened",
    body: "This place can hold growth without asking grief to disappear.",
  };
}

export function getFirstBloomRitualReturnState(state, ritualId) {
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
    wildlifeWitnesses: ["robin", "bee"],
    witnessLabel: "A robin and a bee have witnessed this place.",
    message: entries.length > 0 ? ritual.returnMessage : `${ritual.title} is waiting in soft growth.`,
  };
}

export function getFirstBloomLandmarkReturnSummary(state, landmarkId) {
  const landmark = firstBloomLandmarks.find((candidate) => candidate.id === landmarkId);
  const ritual = findRitual(landmarkId);
  const returnState = state ? getFirstBloomRitualReturnState(state, ritual.id) : null;
  const memoryCount = returnState?.entries.length ?? 0;

  return {
    hasMemory: memoryCount > 0,
    memoryCount,
    description: memoryCount > 0 ? returnState.message : landmark?.description ?? "",
    buttonLabel: memoryCount > 0 ? `Return to ${ritual.title}` : "Enter this place",
    route: routeFor(ritual.id),
  };
}

export function isFirstBloomChapterComplete(state) {
  return firstBloomRituals.every((ritual) => (state?.ritualState?.[ritual.stateKey]?.entries?.length ?? 0) > 0);
}

export function getFirstBloomRitualById(ritualId) {
  return findRitual(ritualId);
}

export function getFirstBloomRitualSaveCopy(ritualId, isSaving) {
  if (ritualId === "grounding") return isSaving ? "The roots are keeping it" : "Let the roots hold this";
  if (ritualId === "opening") return isSaving ? "The bud is keeping it" : "Let the bud hold this opening";
  if (ritualId === "anchoring") return isSaving ? "The anchors are keeping it" : "Let the anchors hold this";
  if (ritualId === "emergence") return isSaving ? "The bloom is keeping it" : "Let the bloom hold this beginning";
  return isSaving ? "The meadow is keeping it" : "Let the meadow hold this together";
}

function createEmptyRitualState(ritual, createdAt) {
  return {
    ritualId: ritual.id,
    chapterId: FIRST_BLOOM_ID,
    visitCount: 0,
    entries: [],
    visualState: visualStateFor(ritual.id, 0),
    wildlifeWitnesses: ["robin", "bee"],
    updatedAt: createdAt,
  };
}

function findRitual(ritualId) {
  const ritual = firstBloomRituals.find((candidate) => candidate.id === ritualId);
  if (!ritual) {
    throw new Error(`Unknown First Bloom ritual: ${ritualId}`);
  }
  return ritual;
}

function routeFor(ritualId) {
  return {
    grounding: "/grounding",
    opening: "/opening",
    anchoring: "/anchoring",
    emergence: "/emergence",
    integration: "/integration",
  }[ritualId];
}

function threadFor(ritualId) {
  return {
    grounding: "Root growth",
    opening: "Bud opening",
    anchoring: "Root network",
    emergence: "Bloom emergence",
    integration: "A living meadow",
  }[ritualId];
}

function descriptionFor(ritualId) {
  return {
    grounding: "A rooted place where the present moment can touch the ground.",
    opening: "A bud that opens only as much as it is ready to open.",
    anchoring: "A root network where connection remains visible.",
    emergence: "A first bloom that appears without erasing winter.",
    integration: "A living meadow where more than one season can belong.",
  }[ritualId];
}

function visualStateFor(ritualId, memoryCount) {
  if (ritualId === "grounding") return memoryCount > 0 ? "root_threads" : "quiet_roots";
  if (ritualId === "opening") return memoryCount > 0 ? "opening_bud" : "closed_bud";
  if (ritualId === "anchoring") return memoryCount > 0 ? "root_network" : "shallow_roots";
  if (ritualId === "emergence") return memoryCount > 0 ? "first_bloom" : "waiting_stem";
  if (ritualId === "integration") return memoryCount > 0 ? "living_meadow" : "open_meadow";
  return "soft_growth";
}

function visualStateLabelFor(visualState) {
  const labels = {
    quiet_roots: "The roots wait quietly below the field.",
    root_threads: "New root threads have found the ground.",
    closed_bud: "The bud remains closed and protected.",
    opening_bud: "The bud has begun to open without being forced.",
    shallow_roots: "The anchors are still shallow.",
    root_network: "A root network has begun to connect beneath the field.",
    waiting_stem: "The stem waits below the open air.",
    first_bloom: "A first bloom has appeared without hurrying the field.",
    open_meadow: "The meadow is open and quiet.",
    living_meadow: "The meadow is holding more than one season at once.",
  };

  return labels[visualState] ?? "First Bloom is holding its shape.";
}

function weatherStateFor(memoryCount, complete) {
  if (complete) return "living_meadow";
  if (memoryCount > 0) return "first_growth";
  return "soft_field_open";
}

function createMemoryId(createdAt, sequence, userId, ritualId) {
  return uuidFromSeed(`${userId}:first-bloom:${ritualId}:${createdAt}:${sequence}`);
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
