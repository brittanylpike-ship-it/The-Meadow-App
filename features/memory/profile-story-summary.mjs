import { isFrozenGroundChapterComplete } from "./evergreen-tree-memory.mjs";

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

export function getProfileStorySummary(state) {
  const memories = state?.memoryObjects ?? [];
  const latest = memories[memories.length - 1];

  if (!latest) {
    return "The landscape has not received a memory yet.";
  }

  if (isFrozenGroundChapterComplete(state)) {
    return "Chapter One rests in Frozen Ground, remembered place by place.";
  }

  const place = placeNamesByRitualId[latest.ritualId] ?? "The Meadow";
  return `Your latest memory rests at ${place}.`;
}
