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
      chapterComplete?: boolean;
      weatherState: string;
      updatedAt: string;
    };
    stormGarden: {
      chapterId: string;
      unlocked: boolean;
      visitCount: number;
      memoryCount: number;
      chapterComplete?: boolean;
      weatherState: string;
      updatedAt: string;
    };
    crossroads: {
      chapterId: string;
      unlocked: boolean;
      visitCount: number;
      memoryCount: number;
      chapterComplete?: boolean;
      weatherState: string;
      updatedAt: string;
    };
    theMoors: {
      chapterId: string;
      unlocked: boolean;
      visitCount: number;
      memoryCount: number;
      chapterComplete?: boolean;
      weatherState: string;
      updatedAt: string;
    };
    firstBloom: {
      chapterId: string;
      unlocked: boolean;
      visitCount: number;
      memoryCount: number;
      chapterComplete?: boolean;
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
    [key: string]: any;
  };
  memoryObjects: MeadowMemoryObject[];
};

export type MeadowMemoryObject = {
  id: string;
  userId: string;
  memoryType: "thought" | "comfort" | "emotion" | "survival" | "hope" | "sign" | "offering" | "whisper" | "growth" | "integration";
  chapterId: "frozen_ground";
  ritualId: string;
  selectedThought: string;
  context: string;
  customText: string;
  createdAt: string;
};

export type EvergreenMemoryObject = MeadowMemoryObject & {
  memoryType: "thought";
  ritualId: "evergreen_tree";
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
export function markMeadowChapterVisited(state: MeadowState, chapterId: "frozen_ground" | "storm_garden" | "crossroads" | "the_moors" | "first_bloom", visitedAt: string): MeadowState;
export function markMeadowRitualVisited(
  state: MeadowState,
  ritualId: "evergreen_tree" | "frosted_window" | "frozen_pond" | "quiet_hour" | "footprints",
  visitedAt: string
): MeadowState;
export function isFrozenGroundChapterComplete(state?: MeadowState | null): boolean;
export function getLatestMeadowMemory(state?: MeadowState | null): {
  id: string;
  text: string;
  supportingText: string;
  place: string;
  ritualId: string;
  route: string;
  createdAt: string;
} | null;
export function getEvergreenSaveCopy(isSaving: boolean): string;
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
