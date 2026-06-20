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

const witnessLabelsByRitualId = {
  frosted_window: "A robin and a moth have witnessed this place.",
  frozen_pond: "A hare and a heron have witnessed this place.",
  quiet_hour: "An owl and a fox have witnessed this place.",
  footprints: "A deer and a sparrow have witnessed this place.",
  lightning_tree: "A crow has witnessed this place.",
  thorn_patch: "A crow has witnessed this place.",
  floodwaters: "A crow has witnessed this place.",
  scorched_earth: "A crow has witnessed this place.",
  shattered_mirror: "A crow has witnessed this place.",
  worn_path: "A snail has witnessed this place.",
  offering: "A snail has witnessed this place.",
  candle: "A moth has witnessed this place.",
  searching_for_signs: "A moth has witnessed this place.",
  waiting_gate: "A snail and a moth have witnessed this place.",
  canopy_cloak: "An owl has witnessed this place.",
  mire: "An owl has witnessed this place.",
  bramble: "An owl has witnessed this place.",
  fog: "An owl has witnessed this place.",
  vanishing_path: "An owl has witnessed this place.",
  grounding: "A robin and a bee have witnessed this place.",
  opening: "A robin and a bee have witnessed this place.",
  anchoring: "A robin and a bee have witnessed this place.",
  emergence: "A robin and a bee have witnessed this place.",
  integration: "A robin and a bee have witnessed this place.",
};

export function getJournalMemoryArchive(state) {
  return [...(state?.memoryObjects ?? [])]
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .map((memory) => ({
      id: memory.id,
      place: placeNamesByRitualId[memory.ritualId] ?? memory.context ?? "The Meadow",
      text: memory.customText || memory.selectedThought || "",
      supportingText: memory.customText ? memory.selectedThought : memory.context,
      dateLabel: formatArchiveDate(memory.createdAt),
      ritualId: memory.ritualId,
      route: routesByRitualId[memory.ritualId] ?? "/frozen-ground",
      buttonLabel: `Return to ${placeNamesByRitualId[memory.ritualId] ?? "The Meadow"}`,
      witnessLabel: witnessLabelsByRitualId[memory.ritualId] ?? null,
    }));
}

export function getJournalSubtitle(state) {
  const memoryCount = state?.memoryObjects?.length ?? 0;
  return memoryCount > 0
    ? "What you left in the world can be found here, still held."
    : "The Journal will gather what the world has kept.";
}

function formatArchiveDate(value) {
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
