import type { MeadowState } from "./evergreen-tree-memory.mjs";

export type RemoteMeadowRows = {
  profile?: Record<string, unknown> | null;
  worldState?: Record<string, any> | null;
  chapterState?: Record<string, any> | null;
  chapterStates?: Array<Record<string, any>>;
  ritualState?: Record<string, any> | null;
  ritualStates?: Array<Record<string, any>>;
  memoryObjects?: Array<Record<string, any>>;
};

export function fromEvergreenSupabaseRows(userId: string, rows: RemoteMeadowRows, now: string): MeadowState;

export function buildMissingMeadowBootstrapRows(
  user: { id: string; email?: string | null },
  existing: Pick<RemoteMeadowRows, "profile" | "worldState" | "chapterState" | "chapterStates" | "ritualState" | "ritualStates">,
  now: string
): {
  profile: Record<string, unknown> | null;
  worldState: Record<string, unknown> | null;
  chapterState: Record<string, unknown> | null;
  chapterStates: Array<Record<string, unknown>>;
  ritualState: Record<string, unknown> | null;
  ritualStates: Array<Record<string, unknown>>;
};
