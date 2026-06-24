import { frozenGroundLandmarks } from "./frozen-ground-landmarks.mjs";
import {
  frozenGroundRituals,
  getFrozenGroundRitualReturnState,
} from "../memory/frozen-ground-ritual-memory.mjs";

const EVERGREEN_TREE_ID = "evergreen_tree";

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

const titlesByRitualId = {
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

export function getFrozenGroundLandmarkReturnSummary(state, landmarkId) {
  const landmark = frozenGroundLandmarks.find((candidate) => candidate.id === landmarkId);

  if (landmarkId === EVERGREEN_TREE_ID) {
    const tagCount = state?.ritualState?.evergreenTree?.tags?.length ?? 0;
    return {
      hasMemory: tagCount > 0,
      memoryCount: tagCount,
      description: tagCount > 0 ? "The tree already holds something from you." : landmark?.description ?? "",
      buttonLabel: tagCount > 0 ? "Return to Evergreen Tree" : "Approach the tree",
      route: routesByRitualId.evergreen_tree,
    };
  }

  const ritual = frozenGroundRituals.find((candidate) => candidate.id === landmarkId);
  if (!ritual) {
    return {
      hasMemory: false,
      memoryCount: 0,
      description: landmark?.description ?? "",
      buttonLabel: "Enter this place",
      route: landmark?.route ?? "/frozen-ground",
    };
  }

  const returnState = state ? getFrozenGroundRitualReturnState(state, ritual.id) : null;
  const memoryCount = returnState?.entries.length ?? 0;

  return {
    hasMemory: memoryCount > 0,
    memoryCount,
    description: memoryCount > 0 ? returnState.message : landmark?.description ?? "",
    buttonLabel: memoryCount > 0 ? `Return to ${ritual.title}` : "Enter this place",
    route: routesByRitualId[ritual.id],
  };
}

export function getMeadowHomeReturnState(state) {
  const totalMemories = state?.worldState?.totalMemories ?? state?.memoryObjects?.length ?? 0;
  const lastRitualId = state?.worldState?.lastVisitedRitualId;

  if (!lastRitualId) {
    return {
      subtitle: "The path opens at Frozen Ground.",
      body: "The Evergreen Tree is waiting in the snow.",
      buttonLabel: "Enter Frozen Ground",
      route: "/frozen-ground",
    };
  }

  const title = titlesByRitualId[lastRitualId] ?? "Frozen Ground";
  const landmarkSummary = getFrozenGroundLandmarkReturnSummary(state, lastRitualId);
  const lastChapterId = state?.worldState?.lastVisitedChapterId;

  return {
    subtitle: landmarkSummary.description,
    body: totalMemories > 0
      ? lastChapterId === "storm_garden"
        ? "What you left is still held in The Meadow."
        : lastChapterId === "crossroads" || lastChapterId === "the_moors" || lastChapterId === "first_bloom"
          ? "What you left is still held in The Meadow."
        : "What you left is still held in Frozen Ground."
      : "The last place you approached is still open.",
    buttonLabel: `Return to ${title}`,
    route: routesByRitualId[lastRitualId] ?? "/frozen-ground",
  };
}
