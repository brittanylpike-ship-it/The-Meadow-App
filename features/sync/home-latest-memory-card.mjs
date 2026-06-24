const placeNamesByRitualId = {
  evergreen_tree: "Evergreen Tree",
  frosted_window: "Frosted Window",
  frozen_pond: "Frozen Pond",
  quiet_hour: "Quiet Hour",
  footprints: "Footprints",
};

const routesByRitualId = {
  evergreen_tree: "/evergreen-tree",
  frosted_window: "/frosted-window",
  frozen_pond: "/frozen-pond",
  quiet_hour: "/quiet-hour",
  footprints: "/footprints",
};

export function getHomeLatestMemoryCard(state) {
  const memories = state?.memoryObjects ?? [];
  const latest = memories[memories.length - 1];

  if (!latest) {
    return null;
  }

  const place = placeNamesByRitualId[latest.ritualId] ?? "The Meadow";

  return {
    title: "Latest held memory",
    body: latest.customText || latest.selectedThought || "",
    place,
    route: routesByRitualId[latest.ritualId] ?? "/frozen-ground",
    buttonLabel: `Return to ${place}`,
  };
}
