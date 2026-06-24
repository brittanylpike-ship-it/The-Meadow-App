import type { MeadowState } from "./evergreen-tree-memory.mjs";

export type FirstBloomRitualId = "grounding" | "opening" | "anchoring" | "emergence" | "integration";

export type FirstBloomRitual = {
  id: FirstBloomRitualId;
  stateKey: FirstBloomRitualId;
  title: string;
  memoryType: "growth" | "integration";
  prompt: string;
  options: string[];
  returnMessage: string;
};

export const firstBloomRituals: FirstBloomRitual[];
export const firstBloomLandmarks: Array<{
  id: FirstBloomRitualId;
  title: string;
  emotionalThread: string;
  description: string;
  route: string;
  enabled: boolean;
}>;

export function markFirstBloomVisited(state: MeadowState, visitedAt: string): MeadowState;
export function saveFirstBloomRitualMemory(
  state: MeadowState,
  ritualId: FirstBloomRitualId,
  input: { response: string; detail?: string; createdAt: string }
): MeadowState;
export function getFirstBloomChapterIntro(state: MeadowState | undefined | null): {
  locked: boolean;
  subtitle: string;
  title: string;
  body: string;
};
export function getFirstBloomRitualReturnState(state: MeadowState, ritualId: FirstBloomRitualId): {
  title: string;
  prompt: string;
  options: string[];
  hasReturned: boolean;
  entries: Array<{ id: string; memoryId: string; text: string; response: string; createdAt: string; dateLabel: string }>;
  visualState: string;
  visualStateLabel: string;
  wildlifeWitnesses: string[];
  witnessLabel: string;
  message: string;
};
export function getFirstBloomLandmarkReturnSummary(
  state: MeadowState | undefined | null,
  landmarkId: FirstBloomRitualId
): {
  hasMemory: boolean;
  memoryCount: number;
  description: string;
  buttonLabel: string;
  route: string;
};
export function isFirstBloomChapterComplete(state: MeadowState | undefined | null): boolean;
export function getFirstBloomRitualById(ritualId: FirstBloomRitualId): FirstBloomRitual;
export function getFirstBloomRitualSaveCopy(ritualId: FirstBloomRitualId, isSaving: boolean): string;
