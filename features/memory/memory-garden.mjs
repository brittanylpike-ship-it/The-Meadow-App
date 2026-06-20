const MEMORY_GARDEN_ROUTE = "/memory-garden";

const placeNamesByRitualId = {
  evergreen_tree: "Evergreen Tree",
  frosted_window: "Frosted Window",
  frozen_pond: "Frozen Pond",
  quiet_hour: "Quiet Hour",
  footprints: "Footprints",
  lightning_tree: "Lightning Tree",
  thorn_patch: "Thorn Patch",
  floodwaters: "Floodwaters",
  scorched_earth: "Scorched Earth",
  shattered_mirror: "Shattered Mirror",
  worn_path: "Worn Path",
  offering: "Offering",
  candle: "Candle",
  searching_for_signs: "Searching For Signs",
  waiting_gate: "Waiting Gate",
  canopy_cloak: "Canopy Cloak",
  mire: "Mire",
  bramble: "Bramble",
  fog: "Fog",
  vanishing_path: "Vanishing Path",
  grounding: "Grounding",
  opening: "Opening",
  anchoring: "Anchoring",
  emergence: "Emergence",
  integration: "Integration",
};

const witnessesByRitualId = {
  evergreen_tree: ["rabbit", "chickadee"],
  frosted_window: ["robin", "moth"],
  frozen_pond: ["hare", "heron"],
  quiet_hour: ["owl", "fox"],
  footprints: ["deer", "sparrow"],
  lightning_tree: ["crow"],
  thorn_patch: ["crow"],
  floodwaters: ["crow"],
  scorched_earth: ["crow"],
  shattered_mirror: ["crow"],
  worn_path: ["snail"],
  offering: ["snail"],
  candle: ["moth"],
  searching_for_signs: ["moth"],
  waiting_gate: ["snail", "moth"],
  canopy_cloak: ["owl"],
  mire: ["owl"],
  bramble: ["owl"],
  fog: ["owl"],
  vanishing_path: ["owl"],
  grounding: ["robin", "bee"],
  opening: ["robin", "bee"],
  anchoring: ["robin", "bee"],
  emergence: ["robin", "bee"],
  integration: ["robin", "bee"],
};

export function isMemoryGardenUnlocked(state) {
  return Boolean(state?.chapterState?.firstBloom?.chapterComplete);
}

export function getMemoryGardenEntry(state) {
  if (!isMemoryGardenUnlocked(state)) {
    return {
      available: false,
      title: "Memory Garden",
      body: "The garden waits until First Bloom is held.",
      buttonLabel: "Return to First Bloom",
      route: "/first-bloom",
    };
  }

  return {
    available: true,
    title: "Memory Garden",
    body: "What the Meadow remembers has begun to grow into a living place.",
    buttonLabel: "Enter Memory Garden",
    route: MEMORY_GARDEN_ROUTE,
  };
}

export function getMemoryGardenReturnState(state) {
  const unlocked = isMemoryGardenUnlocked(state);
  const items = unlocked ? buildMemoryGardenItems(state) : [];

  return {
    unlocked,
    title: "The Memory Garden",
    subtitle: unlocked ? "A living archive grown from what remains." : "The garden waits beyond First Bloom.",
    intro: unlocked
      ? introForEvolution(evolutionStateFor(state?.memoryObjects?.length ?? 0))
      : "The garden will open when the field can hold growth.",
    evolutionState: evolutionStateFor(state?.memoryObjects?.length ?? 0),
    items,
    sections: [
      sectionFor("seeds", "Memory Seeds", items),
      sectionFor("flowers", "Memory Flowers", items),
      sectionFor("roots", "Memory Roots", items),
      sectionFor("trees", "Memory Trees", items),
      sectionFor("lanterns", "Memory Lanterns", items),
      sectionFor("stones", "Memory Stones", items),
    ],
  };
}

export function buildMemoryGardenItems(state) {
  const memories = [...(state?.memoryObjects ?? [])].sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  const items = [];
  const previousByType = new Map();
  const firstByChapter = new Map();

  for (const [index, memory] of memories.entries()) {
    const place = placeNamesByRitualId[memory.ritualId] ?? memory.context ?? "The Meadow";
    const base = {
      userId: state.userId,
      memoryId: memory.id,
      memoryType: memory.memoryType,
      chapterId: memory.chapterId,
      ritualId: memory.ritualId,
      place,
      createdAt: memory.createdAt,
    };

    items.push({
      ...base,
      id: `${memory.id}:seed`,
      kind: "seed",
      growthState: index === 0 ? "first_seed" : "planted_seed",
      label: `A seed from ${place}`,
      visualState: { seed_order: index + 1 },
    });

    items.push({
      ...base,
      id: `${memory.id}:flower`,
      kind: "flower",
      growthState: flowerStateFor(memory.memoryType),
      label: `${flowerLabelFor(memory.memoryType)} at ${place}`,
      visualState: { flower_type: flowerStateFor(memory.memoryType) },
    });

    const witnesses = witnessesByRitualId[memory.ritualId] ?? [];
    if (witnesses.length) {
      items.push({
        ...base,
        id: `${memory.id}:lantern`,
        kind: "lantern",
        growthState: "kindled_lantern",
        label: `A lantern remains near ${place}`,
        witnesses,
        visualState: { witnesses },
      });
    }

    if (isStoneMemory(memory)) {
      items.push({
        ...base,
        id: `${memory.id}:stone`,
        kind: "stone",
        growthState: "weathering_marker",
        label: `A stone marker remains at ${place}`,
        visualState: { stone_memory_type: memory.memoryType },
      });
    }

    const previousTypeMemory = previousByType.get(memory.memoryType);
    if (previousTypeMemory) {
      items.push({
        ...base,
        id: `${memory.id}:root:type`,
        kind: "root",
        growthState: "connected_root",
        label: `A root connects ${place} to another remembered place`,
        connectionKey: previousTypeMemory.chapterId === memory.chapterId ? "same-chapter" : "cross-chapter",
        connectedMemoryId: previousTypeMemory.id,
        visualState: {
          connected_memory_id: previousTypeMemory.id,
          connection_key: previousTypeMemory.chapterId === memory.chapterId ? "same-chapter" : "cross-chapter",
        },
      });
    }
    previousByType.set(memory.memoryType, memory);

    if (!firstByChapter.has(memory.chapterId)) {
      firstByChapter.set(memory.chapterId, memory);
      items.push({
        ...base,
        id: `${memory.id}:tree`,
        kind: "tree",
        growthState: "young_anchor_tree",
        label: `A young tree anchors ${chapterNameFor(memory.chapterId)}`,
        visualState: { chapter_anchor: memory.chapterId },
      });
    }
  }

  return items;
}

export function toMemoryGardenRows(state) {
  return buildMemoryGardenItems(state).map((item) => ({
    user_id: state.userId,
    memory_object_id: item.memoryId,
    item_kind: item.kind,
    memory_type: item.memoryType,
    chapter_id: item.chapterId,
    ritual_id: item.ritualId,
    growth_state: item.growthState,
    visual_state: item.visualState,
    created_at: item.createdAt,
    updated_at: state.worldState.updatedAt,
  }));
}

function sectionFor(id, title, items) {
  const kind = id.slice(0, -1);
  const sectionItems = items.filter((item) => item.kind === kind);
  return {
    id,
    title,
    body: bodyForSection(id, sectionItems.length),
    items: sectionItems,
  };
}

function bodyForSection(id, itemCount) {
  if (itemCount === 0) return "This part of the garden is still waiting.";

  const copy = {
    seeds: "Every memory has entered the soil.",
    flowers: "The garden is showing what each memory became.",
    roots: "Remembered places have begun to connect below the surface.",
    trees: "Anchor memories have become quiet landmarks.",
    lanterns: "Witnessed memories still hold a light.",
    stones: "What needed a marker still remains.",
  };

  return copy[id] ?? "The garden is holding its shape.";
}

function evolutionStateFor(memoryCount) {
  if (memoryCount >= 500) return "ancient_garden";
  if (memoryCount >= 250) return "wide_garden";
  if (memoryCount >= 100) return "deep_garden";
  if (memoryCount >= 50) return "rooted_garden";
  if (memoryCount > 0) return "young_garden";
  return "waiting_soil";
}

function introForEvolution(evolutionState) {
  if (evolutionState === "waiting_soil") return "The garden is waiting for what the Meadow will remember.";
  if (evolutionState === "rooted_garden") return "The garden has deepened into roots, trees, and remembered light.";
  if (evolutionState === "deep_garden") return "The garden has become a quiet place of return.";
  if (evolutionState === "wide_garden" || evolutionState === "ancient_garden") return "The garden has grown into a living landscape of memory.";
  return "The garden has begun to grow from what the Meadow remembers.";
}

function flowerStateFor(memoryType) {
  return {
    thought: "pale_seed_flower",
    comfort: "soft_comfort_flower",
    emotion: "storm_flower",
    hope: "lantern_flower",
    sign: "small_sign_flower",
    offering: "offering_flower",
    whisper: "whisper_flower",
    growth: "green_growth_flower",
    integration: "meadow_flower",
    survival: "moor_flower",
  }[memoryType] ?? "wildflower";
}

function flowerLabelFor(memoryType) {
  return {
    thought: "A pale flower",
    comfort: "A soft flower",
    emotion: "A weathered flower",
    hope: "A lantern flower",
    sign: "A small sign flower",
    offering: "An offering flower",
    whisper: "A whisper flower",
    growth: "A green flower",
    integration: "A meadow flower",
    survival: "A moor flower",
  }[memoryType] ?? "A wildflower";
}

function isStoneMemory(memory) {
  return ["survival", "integration", "offering", "comfort"].includes(memory.memoryType);
}

function chapterNameFor(chapterId) {
  return {
    frozen_ground: "Frozen Ground",
    storm_garden: "Storm Garden",
    crossroads: "Crossroads",
    the_moors: "The Moors",
    first_bloom: "First Bloom",
  }[chapterId] ?? "The Meadow";
}
