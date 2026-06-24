import type { MeadowState } from "./evergreen-tree-memory.mjs";

export type MoorsRitualId = "canopy_cloak" | "mire" | "bramble" | "fog" | "vanishing_path";

export type MoorsRitual = {
  id: MoorsRitualId;
  stateKey: "canopyCloak" | "mire" | "bramble" | "fog" | "vanishingPath";
  title: string;
  memoryType: "survival";
  prompt: string;
  options: string[];
  returnMessage: string;
};

export const moorsRituals: MoorsRitual[];
export const moorsLandmarks: Array<{
  id: MoorsRitualId;
  title: string;
  emotionalThread: string;
  description: string;
  route: string;
  enabled: boolean;
}>;

export function markMoorsVisited(state: MeadowState, visitedAt: string): MeadowState;
export function saveMoorsRitualMemory(
  state: MeadowState,
  ritualId: MoorsRitualId,
  input: { response: string; detail?: string; createdAt: string }
): MeadowState;
export function getMoorsChapterIntro(state: MeadowState | undefined | null): {
  locked: boolean;
  subtitle: string;
  title: string;
  body: string;
};
export function getMoorsRitualReturnState(state: MeadowState, ritualId: MoorsRitualId): {
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
export function getMoorsLandmarkReturnSummary(
  state: MeadowState | undefined | null,
  landmarkId: MoorsRitualId
): {
  hasMemory: boolean;
  memoryCount: number;
  description: string;
  buttonLabel: string;
  route: string;
};
export function isMoorsChapterComplete(state: MeadowState | undefined | null): boolean;
export function getMoorsRitualById(ritualId: MoorsRitualId): MoorsRitual;
export function getMoorsRitualSaveCopy(ritualId: MoorsRitualId, isSaving: boolean): string;
