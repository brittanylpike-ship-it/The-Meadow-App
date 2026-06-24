import type { MeadowState } from "./evergreen-tree-memory.mjs";

export function toMeadowMemorySupabaseMutation(state: MeadowState): {
  worldState: Record<string, unknown>;
  chapterState: Record<string, unknown>;
  ritualState: Record<string, unknown>;
  ritualVisit: Record<string, unknown>;
  thoughtChoice: Record<string, unknown>;
  contextChoice: Record<string, unknown>;
  memoryObject: Record<string, unknown>;
  memoryGardenItems: Array<Record<string, unknown>>;
};

export function toEvergreenSupabaseMutation(state: MeadowState): ReturnType<typeof toMeadowMemorySupabaseMutation>;
