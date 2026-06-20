import type { MeadowState } from "./evergreen-tree-memory.mjs";

export type FrozenGroundRitualId = "frosted_window" | "frozen_pond" | "quiet_hour" | "footprints";

export type FrozenGroundRitual = {
  id: FrozenGroundRitualId;
  stateKey: "frostedWindow" | "frozenPond" | "quietHour" | "footprints";
  title: string;
  memoryType: "comfort" | "emotion" | "survival" | "growth";
  prompt: string;
  options: string[];
  returnMessage: string;
  wildlifeWitnesses: string[];
};

export const frozenGroundRituals: FrozenGroundRitual[];
export function saveFrozenGroundRitualMemory(
  state: MeadowState,
  ritualId: FrozenGroundRitualId,
  input: { response: string; detail?: string; createdAt: string }
): MeadowState;
export function getFrozenGroundRitualReturnState(state: MeadowState, ritualId: FrozenGroundRitualId): {
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
export function getFrozenGroundRitualById(ritualId: FrozenGroundRitualId): FrozenGroundRitual;
export function getFrozenGroundRitualSaveCopy(ritualId: FrozenGroundRitualId, isSaving: boolean): string;
