import { markMeadowChapterVisited } from "./evergreen-tree-memory.mjs";

const THE_MOORS_ID = "the_moors";

export const moorsRituals = [
  {
    id: "canopy_cloak",
    stateKey: "canopyCloak",
    title: "Canopy Cloak",
    memoryType: "survival",
    prompt: "Where does the weight cover everything?",
    options: [
      "The weight that covers everything.",
      "A heaviness over the whole day.",
      "A place where light felt far away.",
      "A covering I could not lift.",
      "The shade I had to sit beneath.",
    ],
    returnMessage: "Canopy Cloak remembers the weight without asking it to lift.",
  },
  {
    id: "mire",
    stateKey: "mire",
    title: "Mire",
    memoryType: "survival",
    prompt: "Where did moving feel difficult?",
    options: [
      "Stuckness and difficulty moving.",
      "A place I could not step out of.",
      "Standing still because everything was heavy.",
      "The bog under the day.",
      "A stone where I could stand.",
    ],
    returnMessage: "Mire remembers where standing still was all that could happen.",
  },
  {
    id: "bramble",
    stateKey: "bramble",
    title: "Bramble",
    memoryType: "survival",
    prompt: "What pressed in from every side?",
    options: [
      "Everything pressing in.",
      "Too much around me.",
      "A pressure I could not push back.",
      "The narrowest breath.",
      "A small opening in the bramble.",
    ],
    returnMessage: "Bramble remembers the pressure and the opening that remained.",
  },
  {
    id: "fog",
    stateKey: "fog",
    title: "Fog",
    memoryType: "survival",
    prompt: "What is unclear right now?",
    options: [
      "Nothing is clear.",
      "A landmark I cannot see.",
      "A familiar place hidden.",
      "The next hour.",
      "A shape beginning to return.",
    ],
    returnMessage: "Fog remembers what became familiar without making everything clear.",
  },
  {
    id: "vanishing_path",
    stateKey: "vanishingPath",
    title: "Vanishing Path",
    memoryType: "survival",
    prompt: "Where does the future disappear?",
    options: [
      "The future cannot be seen.",
      "The path went dark.",
      "A next step I cannot find.",
      "A tunnel of not knowing.",
      "The way that still exists even unseen.",
    ],
    returnMessage: "Vanishing Path remembers that the way forward could not be seen.",
  },
];

export const moorsLandmarks = moorsRituals.map((ritual) => ({
  id: ritual.id,
  title: ritual.title,
  emotionalThread: threadFor(ritual.id),
  description: descriptionFor(ritual.id),
  route: routeFor(ritual.id),
  enabled: true,
}));

export function markMoorsVisited(state, visitedAt) {
  const next = markMeadowChapterVisited(state, THE_MOORS_ID, visitedAt);
  next.chapterState.theMoors.unlocked = true;
  return next;
}

export function saveMoorsRitualMemory(state, ritualId, input) {
  const ritual = findRitual(ritualId);
  const next = structuredClone(state);
  next.chapterState.theMoors.unlocked = true;

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
    chapterId: THE_MOORS_ID,
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
    wildlifeWitnesses: ["owl"],
    updatedAt: createdAt,
  };

  next.chapterState.theMoors.visitCount += 1;
  next.chapterState.theMoors.memoryCount += 1;
  next.chapterState.theMoors.chapterComplete = isMoorsChapterComplete(next);
  next.chapterState.firstBloom.unlocked = next.chapterState.theMoors.chapterComplete;
  next.chapterState.theMoors.weatherState = weatherStateFor(next.chapterState.theMoors.memoryCount, next.chapterState.theMoors.chapterComplete);
  next.chapterState.theMoors.updatedAt = createdAt;

  next.worldState.totalMemories += 1;
  next.worldState.lastVisitedChapterId = THE_MOORS_ID;
  next.worldState.lastVisitedRitualId = ritual.id;
  next.worldState.wildlifeFamiliarity.owl = (next.worldState.wildlifeFamiliarity.owl || 0) + 1;
  next.worldState.updatedAt = createdAt;

  return next;
}

export function getMoorsChapterIntro(state) {
  const moors = state?.chapterState?.theMoors;
  const unlocked = Boolean(moors?.unlocked);

  if (!unlocked) {
    return {
      locked: true,
      subtitle: "The Moors waits beyond Crossroads.",
      title: "The fog is still closed",
      body: "Crossroads must be held before the heavy path opens.",
    };
  }

  if (moors?.chapterComplete) {
    return {
      locked: false,
      subtitle: "Chapter Four is held in the fog.",
      title: "The Moors remembers the weight",
      body: "The canopy, mire, bramble, fog, and path all hold what could not be solved.",
    };
  }

  if ((moors?.memoryCount ?? 0) > 0) {
    return {
      locked: false,
      subtitle: "The Moors has begun to remember what felt heavy.",
      title: "The fog knows one landmark",
      body: "This place can hold stillness without hurrying it forward.",
    };
  }

  return {
    locked: false,
    subtitle: "A foggy chapter for weight, stillness, and paths not yet visible.",
    title: "The fog has opened a way",
    body: "This place can hold weight without trying to solve it.",
  };
}

export function getMoorsRitualReturnState(state, ritualId) {
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
    wildlifeWitnesses: ["owl"],
    witnessLabel: "An owl has witnessed this place.",
    message: entries.length > 0 ? ritual.returnMessage : `${ritual.title} is waiting in the fog.`,
  };
}

export function getMoorsLandmarkReturnSummary(state, landmarkId) {
  const landmark = moorsLandmarks.find((candidate) => candidate.id === landmarkId);
  const ritual = findRitual(landmarkId);
  const returnState = state ? getMoorsRitualReturnState(state, ritual.id) : null;
  const memoryCount = returnState?.entries.length ?? 0;

  return {
    hasMemory: memoryCount > 0,
    memoryCount,
    description: memoryCount > 0 ? returnState.message : landmark?.description ?? "",
    buttonLabel: memoryCount > 0 ? `Return to ${ritual.title}` : "Enter this place",
    route: routeFor(ritual.id),
  };
}

export function isMoorsChapterComplete(state) {
  return moorsRituals.every((ritual) => (state?.ritualState?.[ritual.stateKey]?.entries?.length ?? 0) > 0);
}

export function getMoorsRitualById(ritualId) {
  return findRitual(ritualId);
}

export function getMoorsRitualSaveCopy(ritualId, isSaving) {
  if (ritualId === "canopy_cloak") return isSaving ? "The canopy is keeping it" : "Let the canopy hold this weight";
  if (ritualId === "mire") return isSaving ? "The mire is keeping it" : "Let the mire hold this stillness";
  if (ritualId === "vanishing_path") return isSaving ? "The path is keeping it" : "Let the path hold this uncertainty";
  if (ritualId === "fog") return isSaving ? "The fog is keeping it" : "Let the fog hold this";
  return isSaving ? "The bramble is keeping it" : "Let the bramble hold this pressure";
}

function createEmptyRitualState(ritual, createdAt) {
  return {
    ritualId: ritual.id,
    chapterId: THE_MOORS_ID,
    visitCount: 0,
    entries: [],
    visualState: visualStateFor(ritual.id, 0),
    wildlifeWitnesses: ["owl"],
    updatedAt: createdAt,
  };
}

function findRitual(ritualId) {
  const ritual = moorsRituals.find((candidate) => candidate.id === ritualId);
  if (!ritual) {
    throw new Error(`Unknown Moors ritual: ${ritualId}`);
  }
  return ritual;
}

function routeFor(ritualId) {
  return {
    canopy_cloak: "/canopy-cloak",
    mire: "/mire",
    bramble: "/bramble",
    fog: "/fog",
    vanishing_path: "/vanishing-path",
  }[ritualId];
}

function threadFor(ritualId) {
  return {
    canopy_cloak: "The weight that covers everything",
    mire: "Stuckness",
    bramble: "Pressure pressing in",
    fog: "Nothing is clear",
    vanishing_path: "The future cannot be seen",
  }[ritualId];
}

function descriptionFor(ritualId) {
  return {
    canopy_cloak: "A heavy canopy where weight locations can remain known.",
    mire: "A bog where stillness and standing places can persist.",
    bramble: "A pressing thicket where small openings remain visible.",
    fog: "A soft thick fog where familiar landmarks can slowly return.",
    vanishing_path: "A path that disappears into darkness and still remembers being traveled.",
  }[ritualId];
}

function visualStateFor(ritualId, memoryCount) {
  if (ritualId === "canopy_cloak") return memoryCount > 0 ? "first_opening" : "heavy_canopy";
  if (ritualId === "mire") return memoryCount > 0 ? "standing_stone" : "deep_mire";
  if (ritualId === "bramble") return memoryCount > 0 ? "breathing_space" : "closed_bramble";
  if (ritualId === "fog") return memoryCount > 0 ? "familiar_landmark" : "dense_fog";
  if (ritualId === "vanishing_path") return memoryCount > 0 ? "path_remains" : "dark_path";
  return "fog_waiting";
}

function visualStateLabelFor(visualState) {
  const labels = {
    heavy_canopy: "The canopy hangs low and heavy.",
    first_opening: "A small opening has appeared beneath the canopy.",
    deep_mire: "The mire is deep and slow.",
    standing_stone: "A stone has risen where standing still was possible.",
    closed_bramble: "The bramble presses close.",
    breathing_space: "A small breathing space remains inside the bramble.",
    dense_fog: "The fog is thick and soft.",
    familiar_landmark: "One landmark has become familiar inside the fog.",
    dark_path: "The path disappears into darkness.",
    path_remains: "The path stays present even where it cannot be seen.",
  };

  return labels[visualState] ?? "The Moors is holding its shape.";
}

function weatherStateFor(memoryCount, complete) {
  if (complete) return "familiar_fog";
  if (memoryCount > 0) return "known_fog";
  return "opened_fog";
}

function createMemoryId(createdAt, sequence, userId, ritualId) {
  return uuidFromSeed(`${userId}:moors:${ritualId}:${createdAt}:${sequence}`);
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
