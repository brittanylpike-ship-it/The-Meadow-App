import { isFrozenGroundChapterComplete } from "./evergreen-tree-memory.mjs";

const FROZEN_GROUND_ID = "frozen_ground";

export const frozenGroundRituals = [
  {
    id: "frosted_window",
    stateKey: "frostedWindow",
    title: "Frosted Window",
    memoryType: "comfort",
    prompt: "What small comfort can you see from here?",
    options: [
      "A small light in the room.",
      "A chair that still knows the shape of rest.",
      "A book left open.",
      "A cup warming both hands.",
      "Something I cannot name yet.",
    ],
    returnMessage: "The Frosted Window kept what you cleared here.",
    wildlifeWitnesses: ["robin", "moth"],
  },
  {
    id: "frozen_pond",
    stateKey: "frozenPond",
    title: "Frozen Pond",
    memoryType: "emotion",
    prompt: "What feels held under the ice today?",
    options: [
      "A feeling I have not touched.",
      "A word caught beneath the surface.",
      "A quiet ache.",
      "A place where I went still.",
      "Something beginning to move.",
    ],
    returnMessage: "The Frozen Pond held the shape beneath the ice.",
    wildlifeWitnesses: ["hare", "heron"],
  },
  {
    id: "quiet_hour",
    stateKey: "quietHour",
    title: "Quiet Hour",
    memoryType: "survival",
    prompt: "Where did the hour find you?",
    options: [
      "In the longest part of the day.",
      "At the edge of sleep.",
      "Beside a small light.",
      "In a room gone quiet.",
      "With one breath I could keep.",
    ],
    returnMessage: "Quiet Hour kept this moment without asking it to pass.",
    wildlifeWitnesses: ["owl", "fox"],
  },
  {
    id: "footprints",
    stateKey: "footprints",
    title: "Footprints",
    memoryType: "growth",
    prompt: "What step became visible today?",
    options: [
      "I came back.",
      "I stood where I was.",
      "I followed a small path.",
      "I noticed I was still here.",
      "I took no step, and that counted.",
    ],
    returnMessage: "The Footprints kept the path where you crossed.",
    wildlifeWitnesses: ["deer", "sparrow"],
  },
];

export function saveFrozenGroundRitualMemory(state, ritualId, input) {
  const ritual = findRitual(ritualId);
  const next = structuredClone(state);
  const createdAt = input.createdAt;
  const response = input.response?.trim() || ritual.options[0];
  const detail = input.detail?.trim() || "";
  const memoryId = createMemoryId(createdAt, next.memoryObjects.length + 1, next.userId, ritual.id);
  const entryId = `entry_${ritual.id}_${next.memoryObjects.length + 1}`;
  const existing = next.ritualState[ritual.stateKey] ?? createEmptyRitualState(ritual, createdAt);

  const entry = {
    id: entryId,
    memoryId,
    text: detail || response,
    response,
    createdAt,
  };

  next.memoryObjects.push({
    id: memoryId,
    userId: next.userId,
    memoryType: ritual.memoryType,
    chapterId: FROZEN_GROUND_ID,
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
    updatedAt: createdAt,
  };

  next.chapterState.frozenGround.visitCount += 1;
  next.chapterState.frozenGround.memoryCount += 1;
  next.chapterState.frozenGround.chapterComplete = isFrozenGroundChapterComplete(next);
  next.chapterState.stormGarden.unlocked = next.chapterState.frozenGround.chapterComplete;
  next.chapterState.frozenGround.updatedAt = createdAt;

  next.worldState.totalMemories += 1;
  next.worldState.lastVisitedChapterId = FROZEN_GROUND_ID;
  next.worldState.lastVisitedRitualId = ritual.id;
  for (const witness of ritual.wildlifeWitnesses) {
    next.worldState.wildlifeFamiliarity[witness] = (next.worldState.wildlifeFamiliarity[witness] || 0) + 1;
  }
  next.worldState.updatedAt = createdAt;

  return next;
}

export function getFrozenGroundRitualReturnState(state, ritualId) {
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
    wildlifeWitnesses: ritual.wildlifeWitnesses,
    witnessLabel: witnessLabelFor(ritual.wildlifeWitnesses),
    message: entries.length > 0 ? ritual.returnMessage : `${ritual.title} is waiting quietly.`,
  };
}

export function getFrozenGroundRitualById(ritualId) {
  return findRitual(ritualId);
}

function createEmptyRitualState(ritual, createdAt) {
  return {
    ritualId: ritual.id,
    chapterId: FROZEN_GROUND_ID,
    visitCount: 0,
    entries: [],
    visualState: visualStateFor(ritual.id, 0),
    updatedAt: createdAt,
  };
}

function findRitual(ritualId) {
  const ritual = frozenGroundRituals.find((candidate) => candidate.id === ritualId);
  if (!ritual) {
    throw new Error(`Unknown Frozen Ground ritual: ${ritualId}`);
  }
  return ritual;
}

function visualStateFor(ritualId, memoryCount) {
  if (ritualId === "frosted_window") return memoryCount > 0 ? "cleared_glass" : "frosted";
  if (ritualId === "frozen_pond") return memoryCount > 0 ? "first_crack" : "sealed_ice";
  if (ritualId === "quiet_hour") return memoryCount > 0 ? "lantern_hour" : "still_clock";
  if (ritualId === "footprints") return memoryCount > 0 ? "single_trail" : "unmarked_snow";
  return "quiet";
}

export function getFrozenGroundRitualSaveCopy(ritualId, isSaving) {
  const ritual = findRitual(ritualId);
  const place = {
    frosted_window: "window",
    frozen_pond: "pond",
    quiet_hour: "hour",
    footprints: "path",
  }[ritual.id];

  return isSaving ? `The ${place} is keeping it` : `Let the ${place} keep this`;
}

function visualStateLabelFor(visualState) {
  const labels = {
    frosted: "The glass is still fully frosted.",
    cleared_glass: "A small clearing has opened in the frost.",
    sealed_ice: "The pond remains sealed and still.",
    first_crack: "A clean line has opened in the ice.",
    still_clock: "The hour is quiet and unhurried.",
    lantern_hour: "A lantern holds the hour softly.",
    unmarked_snow: "The snow is waiting without a path.",
    single_trail: "A single trail remains visible in the snow.",
  };

  return labels[visualState] ?? "This place is holding its shape.";
}

function witnessLabelFor(witnesses) {
  if (!witnesses.length) {
    return "The quiet has witnessed this place.";
  }

  if (witnesses.length === 1) {
    return `${articleFor(witnesses[0])} ${witnesses[0]} has witnessed this place.`;
  }

  const [first, second] = witnesses;
  return `${articleFor(first)} ${first} and ${articleFor(second).toLowerCase()} ${second} have witnessed this place.`;
}

function articleFor(value) {
  return /^[aeiou]/i.test(value) ? "An" : "A";
}

function createMemoryId(createdAt, sequence, userId, ritualId) {
  return uuidFromSeed(`${userId}:${ritualId}:${createdAt}:${sequence}`);
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
