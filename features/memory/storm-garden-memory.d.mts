import type { MeadowState } from "./evergreen-tree-memory.mjs";

export type StormGardenRitualId = "lightning_tree" | "thorn_patch" | "floodwaters" | "scorched_earth" | "shattered_mirror";

export type StormGardenRitual = {
  id: StormGardenRitualId;
  stateKey: "lightningTree" | "thornPatch" | "floodwaters" | "scorchedEarth" | "shatteredMirror";
  title: string;
  memoryType: "emotion";
  prompt: string;
  options: string[];
  returnMessage: string;
};

export const stormGardenRituals: StormGardenRitual[];
export const stormGardenLandmarks: Array<{
  id: StormGardenRitualId;
  title: string;
  emotionalThread: string;
  description: string;
  route: string;
  enabled: boolean;
}>;

export function markStormGardenVisited(state: MeadowState, visitedAt: string): MeadowState;
export function saveStormGardenRitualMemory(
  state: MeadowState,
  ritualId: StormGardenRitualId,
  input: { response: string; detail?: string; createdAt: string }
): MeadowState;
export function getStormGardenChapterIntro(state: MeadowState | undefined | null): {
  locked: boolean;
  subtitle: string;
  title: string;
  body: string;
};
export function getStormGardenRitualReturnState(state: MeadowState, ritualId: StormGardenRitualId): {
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
export function getStormGardenLandmarkReturnSummary(
  state: MeadowState | undefined | null,
  landmarkId: StormGardenRitualId
): {
  hasMemory: boolean;
  memoryCount: number;
  description: string;
  buttonLabel: string;
  route: string;
};
export function isStormGardenChapterComplete(state: MeadowState | undefined | null): boolean;
export function getStormGardenRitualById(ritualId: StormGardenRitualId): StormGardenRitual;
export function getStormGardenRitualSaveCopy(ritualId: StormGardenRitualId, isSaving: boolean): string;
