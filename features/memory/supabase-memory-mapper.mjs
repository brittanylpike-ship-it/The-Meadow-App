import { toMemoryGardenRows } from "./memory-garden.mjs";

export function toMeadowMemorySupabaseMutation(state) {
  const latestMemory = state.memoryObjects[state.memoryObjects.length - 1];

  if (!latestMemory) {
    throw new Error("Cannot sync The Meadow without a remembered memory.");
  }

  const chapterState = state.chapterState[chapterStateKeyFor(latestMemory.chapterId)];
  const ritualSnapshot = snapshotForLatestRitual(state, latestMemory);

  return {
    worldState: {
      user_id: state.userId,
      total_memories: state.worldState.totalMemories,
      last_visited_chapter_id: state.worldState.lastVisitedChapterId,
      last_visited_ritual_id: state.worldState.lastVisitedRitualId,
      wildlife_familiarity: state.worldState.wildlifeFamiliarity,
      updated_at: state.worldState.updatedAt,
    },
    chapterState: {
      user_id: state.userId,
      chapter_id: chapterState.chapterId,
      visit_count: chapterState.visitCount,
      memory_count: chapterState.memoryCount,
      weather_state: chapterState.weatherState,
      state: {
        unlocked: chapterState.unlocked,
        chapter_complete: Boolean(chapterState.chapterComplete),
      },
      updated_at: chapterState.updatedAt,
    },
    ritualState: {
      user_id: state.userId,
      chapter_id: ritualSnapshot.chapterId,
      ritual_id: ritualSnapshot.ritualId,
      visit_count: ritualSnapshot.visitCount,
      branch_fullness: ritualSnapshot.branchFullness,
      lantern_warmth: ritualSnapshot.lanternWarmth,
      root_visibility: ritualSnapshot.rootVisibility,
      wildlife_witnesses: ritualSnapshot.wildlifeWitnesses,
      state: ritualSnapshot.state,
      updated_at: ritualSnapshot.updatedAt,
    },
    ritualVisit: {
      user_id: state.userId,
      chapter_id: latestMemory.chapterId,
      ritual_id: latestMemory.ritualId,
      visited_at: latestMemory.createdAt,
    },
    thoughtChoice: {
      user_id: state.userId,
      ritual_id: latestMemory.ritualId,
      choice_layer: "thought",
      choice_value: latestMemory.selectedThought,
      created_at: latestMemory.createdAt,
    },
    contextChoice: {
      user_id: state.userId,
      ritual_id: latestMemory.ritualId,
      choice_layer: "context",
      choice_value: latestMemory.context,
      created_at: latestMemory.createdAt,
    },
    memoryObject: {
      id: latestMemory.id,
      user_id: state.userId,
      memory_type: latestMemory.memoryType,
      chapter_id: latestMemory.chapterId,
      ritual_id: latestMemory.ritualId,
      selected_thought: latestMemory.selectedThought,
      context: latestMemory.context,
      custom_text: latestMemory.customText,
      branch: ritualSnapshot.branch,
      visual_state: ritualSnapshot.visualState,
      created_at: latestMemory.createdAt,
    },
    memoryGardenItems: toMemoryGardenRows(state),
  };
}

export function toEvergreenSupabaseMutation(state) {
  return toMeadowMemorySupabaseMutation(state);
}

function snapshotForLatestRitual(state, latestMemory) {
  if (latestMemory.ritualId === "evergreen_tree") {
    const evergreen = state.ritualState.evergreenTree;
    const latestTag = evergreen.tags.find((tag) => tag.memoryId === latestMemory.id) ?? evergreen.tags[evergreen.tags.length - 1];

    if (!latestTag) {
      throw new Error("Cannot sync Evergreen Tree without a memory tag.");
    }

    return {
      ritualId: evergreen.ritualId,
      chapterId: evergreen.chapterId,
      visitCount: evergreen.visitCount,
      branchFullness: evergreen.branchFullness,
      lanternWarmth: evergreen.lanternWarmth,
      rootVisibility: evergreen.rootVisibility,
      wildlifeWitnesses: evergreen.wildlifeWitnesses,
      state: { tags: evergreen.tags },
      updatedAt: evergreen.updatedAt,
      branch: latestTag.branch,
      visualState: {
        tag_id: latestTag.id,
        lantern_warmth: evergreen.lanternWarmth,
        root_visibility: evergreen.rootVisibility,
      },
    };
  }

  const ritualState = Object.values(state.ritualState).find((candidate) => candidate.ritualId === latestMemory.ritualId);
  const latestEntry = ritualState?.entries?.find((entry) => entry.memoryId === latestMemory.id) ?? ritualState?.entries?.[ritualState.entries.length - 1];

  if (!ritualState || !latestEntry) {
    throw new Error(`Cannot sync ${latestMemory.ritualId} without a ritual entry.`);
  }

  return {
    ritualId: ritualState.ritualId,
    chapterId: ritualState.chapterId,
    visitCount: ritualState.visitCount,
    branchFullness: ritualState.visualState,
    lanternWarmth: "kindled",
    rootVisibility: "beneath_snow",
    wildlifeWitnesses: ritualState.wildlifeWitnesses ?? ["crow"],
    state: {
      entries: ritualState.entries,
      visual_state: ritualState.visualState,
    },
    updatedAt: ritualState.updatedAt,
    branch: null,
    visualState: {
      entry_id: latestEntry.id,
      visual_state: ritualState.visualState,
    },
  };
}

function chapterStateKeyFor(chapterId) {
  if (chapterId === "storm_garden") return "stormGarden";
  if (chapterId === "crossroads") return "crossroads";
  if (chapterId === "the_moors") return "theMoors";
  if (chapterId === "first_bloom") return "firstBloom";
  return "frozenGround";
}
