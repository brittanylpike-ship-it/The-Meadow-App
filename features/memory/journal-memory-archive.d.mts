import type { MeadowState } from "./evergreen-tree-memory.mjs";

export type JournalMemoryArchiveEntry = {
  id: string;
  place: string;
  text: string;
  supportingText: string;
  dateLabel: string;
  ritualId: string;
  route: string;
  buttonLabel: string;
  witnessLabel: string | null;
};

export function getJournalMemoryArchive(state: MeadowState | undefined | null): JournalMemoryArchiveEntry[];
export function getJournalSubtitle(state: MeadowState | undefined | null): string;
