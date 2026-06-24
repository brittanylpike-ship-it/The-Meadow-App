export type MeadowState = {
  userId: string;
  worldState: {
    userId: string;
    totalMemories: number;
    lastVisitedChapterId: string | null;
    lastVisitedRitualId: string | null;
    wildlifeFamiliarity: Record<string, number>;
    createdAt: string;
    updatedAt: string;
  };
  chapterState: {
    frozenGround: {
      chapterId: string;
      unlocked: boolean;
      visitCount: number;
      memoryCount: number;
      weatherState: string;
      updatedAt: string;
    };
  };
  ritualState: {
    evergreenTree: {
      ritualId: string;
      chapterId: string;
      visitCount: number;
      tags: EvergreenTag[];
      branchFullness: string;
      lanternWarmth: string;
      rootVisibility: string;
      wildlifeWitnesses: string[];
      updatedAt: string;
    };
  };
  memoryObjects: EvergreenMemoryObject[];
};

export type EvergreenMemoryObject = {
  id: string;
  userId: string;
  memoryType: "thought";
  chapterId: "frozen_ground";
  ritualId: "evergreen_tree";
  selectedThought: string;
  context: string;
  customText: string;
  createdAt: string;
};

export type EvergreenTag = {
  id: string;
  memoryId: string;
  text: string;
  thought: string;
  context: string;
  branch: string;
  createdAt: string;
};

export type EvergreenMemoryInput = {
  thought: string;
  context: string;
  offering?: string;
  createdAt: string;
};

export const EVERGREEN_THOUGHTS: string[];
export function createEmptyMeadowState(userId: string, createdAt: string): MeadowState;
export function saveEvergreenMemory(state: MeadowState, input: EvergreenMemoryInput): MeadowState;
export function getEvergreenReturnState(state: MeadowState): {
  hasReturned: boolean;
  tags: Array<EvergreenTag & { dateLabel: string }>;
  visibleEvolution: string;
  branchFullness: string;
  lanternWarmth: string;
  rootVisibility: string;
  wildlifeWitnesses: string[];
  message: string;
};
