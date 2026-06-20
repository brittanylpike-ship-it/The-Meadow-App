import type { MeadowState } from "./evergreen-tree-memory.mjs";

export function getHearthStatus(
  state: MeadowState | undefined | null,
  syncSummary: { pendingCount: number; status: string } | undefined | null
): {
  title: string;
  body: string;
  actionLabel: string | null;
  latestMemoryText: string | null;
  latestMemoryLabel: string | null;
};
