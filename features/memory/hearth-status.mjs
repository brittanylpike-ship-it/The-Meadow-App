import { getLatestMeadowMemory } from "./evergreen-tree-memory.mjs";

export function getHearthStatus(state, syncSummary) {
  const pendingCount = syncSummary?.pendingCount ?? 0;
  const latestMemory = getLatestMeadowMemory(state);

  if (pendingCount > 0) {
    return {
      title: "Held here, still traveling",
      body:
        pendingCount === 1
          ? "One memory is safe here and waiting for the wider Meadow."
          : "Your memories are safe here and waiting for the wider Meadow.",
      actionLabel: "Try again",
      latestMemoryText: latestMemory?.text ?? null,
      latestMemoryLabel: latestMemory ? `Latest held memory - ${latestMemory.place}` : null,
    };
  }

  const memoryCount = state?.memoryObjects?.length ?? 0;

  if (memoryCount > 0) {
    return {
      title: "The fire is keeping watch",
      body: "What you left in Frozen Ground is still held here.",
      actionLabel: null,
      latestMemoryText: latestMemory?.text ?? null,
      latestMemoryLabel: latestMemory ? `Latest held memory - ${latestMemory.place}` : null,
    };
  }

  return {
    title: "A quiet fire is banked",
    body: "The Hearth will warm what the world has begun to hold.",
    actionLabel: null,
    latestMemoryText: null,
    latestMemoryLabel: null,
  };
}
