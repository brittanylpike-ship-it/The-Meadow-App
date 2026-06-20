import type { MeadowState } from "../memory/evergreen-tree-memory.mjs";

export function getFrozenGroundChapterIntro(state: MeadowState | undefined | null): {
  subtitle: string;
  title: string;
  body: string;
};
