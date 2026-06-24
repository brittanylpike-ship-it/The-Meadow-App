import { markMeadowChapterVisited } from "./evergreen-tree-memory.mjs";

const CROSSROADS_ID = "crossroads";

export const crossroadsRituals = [
  {
    id: "worn_path",
    stateKey: "wornPath",
    title: "Worn Path",
    memoryType: "hope",
    prompt: "Which thought keeps returning?",
    options: [
      "The thought that keeps returning.",
      "If only I had known.",
      "If only there were more time.",
      "If only I could ask again.",
      "A path my mind keeps walking.",
    ],
    returnMessage: "Worn Path remembers the question that keeps returning.",
  },
  {
    id: "offering",
    stateKey: "offering",
    title: "Offering",
    memoryType: "offering",
    prompt: "What would you have traded?",
    options: [
      "What I would have traded.",
      "A promise I would have made.",
      "A piece of myself I imagined giving.",
      "Something impossible.",
      "Nothing fair could be traded.",
    ],
    returnMessage: "The Offering remains visible on the stone.",
  },
  {
    id: "candle",
    stateKey: "candle",
    title: "Candle",
    memoryType: "whisper",
    prompt: "What would you say?",
    options: [
      "What I would say.",
      "A sentence I cannot send.",
      "A whisper I keep carrying.",
      "A name in the quiet.",
      "A question for the flame.",
    ],
    returnMessage: "The Candle remembers the whisper and the wax below it.",
  },
  {
    id: "searching_for_signs",
    stateKey: "searchingForSigns",
    title: "Searching For Signs",
    memoryType: "sign",
    prompt: "What sign keeps finding you?",
    options: [
      "A sign I kept noticing.",
      "A feather near the path.",
      "A song at the wrong time.",
      "A coincidence I could not ignore.",
      "A pattern I do not need to prove.",
    ],
    returnMessage: "Searching For Signs remembers the pattern without deciding what it means.",
  },
  {
    id: "waiting_gate",
    stateKey: "waitingGate",
    title: "Waiting Gate",
    memoryType: "hope",
    prompt: "What are you still waiting for?",
    options: [
      "What I am still waiting for.",
      "An answer.",
      "A feeling to change shape.",
      "A door I know may not open.",
      "The waiting itself.",
    ],
    returnMessage: "Waiting Gate remembers what is still waiting without forcing it open.",
  },
];

export const crossroadsLandmarks = crossroadsRituals.map((ritual) => ({
  id: ritual.id,
  title: ritual.title,
  emotionalThread: threadFor(ritual.id),
  description: descriptionFor(ritual.id),
  route: routeFor(ritual.id),
  enabled: true,
}));

export function markCrossroadsVisited(state, visitedAt) {
  const next = markMeadowChapterVisited(state, CROSSROADS_ID, visitedAt);
  next.chapterState.crossroads.unlocked = true;
  return next;
}

export function saveCrossroadsRitualMemory(state, ritualId, input) {
  const ritual = findRitual(ritualId);
  const next = structuredClone(state);
  next.chapterState.crossroads.unlocked = true;

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
    chapterId: CROSSROADS_ID,
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
    wildlifeWitnesses: witnessesFor(ritual.id),
    updatedAt: createdAt,
  };

  next.chapterState.crossroads.visitCount += 1;
  next.chapterState.crossroads.memoryCount += 1;
  next.chapterState.crossroads.chapterComplete = isCrossroadsChapterComplete(next);
  next.chapterState.theMoors.unlocked = next.chapterState.crossroads.chapterComplete;
  next.chapterState.crossroads.weatherState = weatherStateFor(next.chapterState.crossroads.memoryCount, next.chapterState.crossroads.chapterComplete);
  next.chapterState.crossroads.updatedAt = createdAt;

  next.worldState.totalMemories += 1;
  next.worldState.lastVisitedChapterId = CROSSROADS_ID;
  next.worldState.lastVisitedRitualId = ritual.id;
  for (const witness of witnessesFor(ritual.id)) {
    next.worldState.wildlifeFamiliarity[witness] = (next.worldState.wildlifeFamiliarity[witness] || 0) + 1;
  }
  next.worldState.updatedAt = createdAt;

  return next;
}

export function getCrossroadsChapterIntro(state) {
  const crossroads = state?.chapterState?.crossroads;
  const unlocked = Boolean(crossroads?.unlocked);

  if (!unlocked) {
    return {
      locked: true,
      subtitle: "Crossroads waits beyond Storm Garden.",
      title: "The lanterns are still distant",
      body: "Storm Garden must be held before the crossing opens.",
    };
  }

  if (crossroads?.chapterComplete) {
    return {
      locked: false,
      subtitle: "Chapter Three is held at the crossing.",
      title: "Crossroads remembers each question",
      body: "The path, offering, candle, signs, and gate all keep what remains unresolved.",
    };
  }

  if ((crossroads?.memoryCount ?? 0) > 0) {
    return {
      locked: false,
      subtitle: "Crossroads has begun to remember what you asked.",
      title: "The lanterns know your return",
      body: "This place can preserve hope without deciding what it means.",
    };
  }

  return {
    locked: false,
    subtitle: "A reflective chapter for questions, signs, waiting, and return.",
    title: "The lanterns are visible",
    body: "This place can hold questions without forcing answers.",
  };
}

export function getCrossroadsRitualReturnState(state, ritualId) {
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
    wildlifeWitnesses: witnessesFor(ritual.id),
    witnessLabel: witnessLabelFor(witnessesFor(ritual.id)),
    message: entries.length > 0 ? ritual.returnMessage : `${ritual.title} is waiting at the crossing.`,
  };
}

export function getCrossroadsLandmarkReturnSummary(state, landmarkId) {
  const landmark = crossroadsLandmarks.find((candidate) => candidate.id === landmarkId);
  const ritual = findRitual(landmarkId);
  const returnState = state ? getCrossroadsRitualReturnState(state, ritual.id) : null;
  const memoryCount = returnState?.entries.length ?? 0;

  return {
    hasMemory: memoryCount > 0,
    memoryCount,
    description: memoryCount > 0 ? returnState.message : landmark?.description ?? "",
    buttonLabel: memoryCount > 0 ? `Return to ${ritual.title}` : "Enter this place",
    route: routeFor(ritual.id),
  };
}

export function isCrossroadsChapterComplete(state) {
  return crossroadsRituals.every((ritual) => (state?.ritualState?.[ritual.stateKey]?.entries?.length ?? 0) > 0);
}

export function getCrossroadsRitualById(ritualId) {
  return findRitual(ritualId);
}

export function getCrossroadsRitualSaveCopy(ritualId, isSaving) {
  if (ritualId === "worn_path") return isSaving ? "The path is remembering it" : "Let the path remember this";
  if (ritualId === "offering") return isSaving ? "The offering stone is keeping it" : "Let the offering remain";
  if (ritualId === "waiting_gate") return isSaving ? "The gate is keeping it" : "Let the gate hold this waiting";
  if (ritualId === "candle") return isSaving ? "The candle is keeping it" : "Let the candle hold this whisper";
  return isSaving ? "The signs are keeping it" : "Let the signs hold this";
}

function createEmptyRitualState(ritual, createdAt) {
  return {
    ritualId: ritual.id,
    chapterId: CROSSROADS_ID,
    visitCount: 0,
    entries: [],
    visualState: visualStateFor(ritual.id, 0),
    wildlifeWitnesses: witnessesFor(ritual.id),
    updatedAt: createdAt,
  };
}

function findRitual(ritualId) {
  const ritual = crossroadsRituals.find((candidate) => candidate.id === ritualId);
  if (!ritual) {
    throw new Error(`Unknown Crossroads ritual: ${ritualId}`);
  }
  return ritual;
}

function routeFor(ritualId) {
  return {
    worn_path: "/worn-path",
    offering: "/offering",
    candle: "/candle",
    searching_for_signs: "/searching-for-signs",
    waiting_gate: "/waiting-gate",
  }[ritualId];
}

function threadFor(ritualId) {
  return {
    worn_path: "The thought that keeps returning",
    offering: "What would be traded",
    candle: "What would be said",
    searching_for_signs: "Signs and meaning",
    waiting_gate: "What is still waiting",
  }[ritualId];
}

function descriptionFor(ritualId) {
  return {
    worn_path: "A returning path where repeated questions deepen the ground.",
    offering: "A stone for impossible trades and what remains visible over time.",
    candle: "A quiet flame for whispers that persist as wax history.",
    searching_for_signs: "A lantern-marked place where signs accumulate without needing proof.",
    waiting_gate: "A threshold that remembers waiting without forcing it to open.",
  }[ritualId];
}

function witnessesFor(ritualId) {
  if (ritualId === "candle" || ritualId === "searching_for_signs") return ["moth"];
  if (ritualId === "waiting_gate") return ["snail", "moth"];
  return ["snail"];
}

function witnessLabelFor(witnesses) {
  if (witnesses.length === 1) {
    return `${articleFor(witnesses[0])} ${witnesses[0]} has witnessed this place.`;
  }

  return `${articleFor(witnesses[0])} ${witnesses[0]} and ${articleFor(witnesses[1]).toLowerCase()} ${witnesses[1]} have witnessed this place.`;
}

function articleFor(value) {
  return /^[aeiou]/i.test(value) ? "An" : "A";
}

function visualStateFor(ritualId, memoryCount) {
  if (ritualId === "worn_path") return memoryCount > 0 ? "deepened_path" : "faint_path";
  if (ritualId === "offering") return memoryCount > 0 ? "weathering_stone" : "empty_stone";
  if (ritualId === "candle") return memoryCount > 0 ? "wax_history" : "unlit_wick";
  if (ritualId === "searching_for_signs") return memoryCount > 0 ? "signs_accumulating" : "single_feather";
  if (ritualId === "waiting_gate") return memoryCount > 0 ? "remembered_threshold" : "closed_gate";
  return "lantern_waiting";
}

function visualStateLabelFor(visualState) {
  const labels = {
    faint_path: "The path is faint but visible.",
    deepened_path: "The path has deepened where the question returned.",
    empty_stone: "The offering stone waits empty.",
    weathering_stone: "The offering remains visible as the stone weathers.",
    unlit_wick: "The candle waits with an unlit wick.",
    wax_history: "Wax has begun to gather below the flame.",
    single_feather: "A single sign rests near the lantern.",
    signs_accumulating: "Small signs have begun to gather near the path.",
    closed_gate: "The gate waits closed at the threshold.",
    remembered_threshold: "The gate remembers the waiting without opening.",
  };

  return labels[visualState] ?? "The crossing is holding its shape.";
}

function weatherStateFor(memoryCount, complete) {
  if (complete) return "known_lanterns";
  if (memoryCount > 0) return "lantern_dusk";
  return "autumn_waiting";
}

function createMemoryId(createdAt, sequence, userId, ritualId) {
  return uuidFromSeed(`${userId}:crossroads:${ritualId}:${createdAt}:${sequence}`);
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
