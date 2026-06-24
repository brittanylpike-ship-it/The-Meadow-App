import type { MeadowState } from "../memory/evergreen-tree-memory.mjs";

export function getChapterReturnIntro(state: MeadowState | undefined | null): {
  subtitle: string;
  title: string;
  body: string;
};
