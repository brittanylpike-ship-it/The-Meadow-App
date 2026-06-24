import type { MeadowState } from "../memory/evergreen-tree-memory.mjs";

export function getHomeLatestMemoryCard(state: MeadowState | undefined | null): {
  title: string;
  body: string;
  place: string;
  route: string;
  buttonLabel: string;
} | null;
