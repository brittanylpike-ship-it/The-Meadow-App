import type { MeadowState } from "./evergreen-tree-memory.mjs";

export type MemoryGardenItem = {
  id: string;
  userId: string;
  memoryId: string;
  kind: "seed" | "flower" | "root" | "tree" | "lantern" | "stone";
  memoryType: string;
  chapterId: string;
  ritualId: string;
  place: string;
  growthState: string;
  label: string;
  createdAt: string;
  witnesses?: string[];
  connectionKey?: string;
  connectedMemoryId?: string;
  visualState: Record<string, unknown>;
};

export function isMemoryGardenUnlocked(state?: MeadowState | null): boolean;
export function getMemoryGardenEntry(state?: MeadowState | null): {
  available: boolean;
  title: string;
  body: string;
  buttonLabel: string;
  route: string;
};
export function getMemoryGardenReturnState(state?: MeadowState | null): {
  unlocked: boolean;
  title: string;
  subtitle: string;
  intro: string;
  evolutionState: string;
  items: MemoryGardenItem[];
  sections: Array<{ id: string; title: string; body: string; items: MemoryGardenItem[] }>;
};
export function buildMemoryGardenItems(state: MeadowState): MemoryGardenItem[];
export function toMemoryGardenRows(state: MeadowState): Array<Record<string, unknown>>;
