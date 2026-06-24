import type { MeadowState } from "./evergreen-tree-memory.mjs";

export type CrossroadsRitualId = "worn_path" | "offering" | "candle" | "searching_for_signs" | "waiting_gate";

export type CrossroadsRitual = {
  id: CrossroadsRitualId;
  stateKey: "wornPath" | "offering" | "candle" | "searchingForSigns" | "waitingGate";
  title: string;
  memoryType: "hope" | "offering" | "whisper" | "sign";
  prompt: string;
  options: string[];
  returnMessage: string;
};

export const crossroadsRituals: CrossroadsRitual[];
export const crossroadsLandmarks: Array<{
  id: CrossroadsRitualId;
  title: string;
  emotionalThread: string;
  description: string;
  route: string;
  enabled: boolean;
}>;

export function markCrossroadsVisited(state: MeadowState, visitedAt: string): MeadowState;
export function saveCrossroadsRitualMemory(
  state: MeadowState,
  ritualId: CrossroadsRitualId,
  input: { response: string; detail?: string; createdAt: string }
): MeadowState;
export function getCrossroadsChapterIntro(state: MeadowState | undefined | null): {
  locked: boolean;
  subtitle: string;
  title: string;
  body: string;
};
export function getCrossroadsRitualReturnState(state: MeadowState, ritualId: CrossroadsRitualId): {
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
export function getCrossroadsLandmarkReturnSummary(
  state: MeadowState | undefined | null,
  landmarkId: CrossroadsRitualId
): {
  hasMemory: boolean;
  memoryCount: number;
  description: string;
  buttonLabel: string;
  route: string;
};
export function isCrossroadsChapterComplete(state: MeadowState | undefined | null): boolean;
export function getCrossroadsRitualById(ritualId: CrossroadsRitualId): CrossroadsRitual;
export function getCrossroadsRitualSaveCopy(ritualId: CrossroadsRitualId, isSaving: boolean): string;
