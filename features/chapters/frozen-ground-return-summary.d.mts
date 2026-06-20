import type { MeadowState } from "../memory/evergreen-tree-memory.mjs";
import type { FrozenGroundRitualId } from "../memory/frozen-ground-ritual-memory.mjs";

export type FrozenGroundLandmarkId = FrozenGroundRitualId | "evergreen_tree";

export function getFrozenGroundLandmarkReturnSummary(
  state: MeadowState | undefined | null,
  landmarkId: FrozenGroundLandmarkId | string
): {
  hasMemory: boolean;
  memoryCount: number;
  description: string;
  buttonLabel: string;
  route: string;
};

export function getMeadowHomeReturnState(state: MeadowState | undefined | null): {
  subtitle: string;
  body: string;
  buttonLabel: string;
  route: string;
};
