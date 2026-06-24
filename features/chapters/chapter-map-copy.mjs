export function getChapterMapDescription(chapterId, frozenGroundMemoryCount, frozenGroundComplete = false, stormGardenUnlocked = false, crossroadsUnlocked = false, moorsUnlocked = false, firstBloomUnlocked = false) {
  if (chapterId === "storm_garden") {
    return stormGardenUnlocked
      ? "Storm Garden is open. The world can hold anger without turning it into harm."
      : "This path remains closed for now.";
  }

  if (chapterId === "crossroads") {
    return crossroadsUnlocked
      ? "Crossroads is open. The world can hold questions without forcing answers."
      : "This path remains closed for now.";
  }

  if (chapterId === "the_moors") {
    return moorsUnlocked
      ? "The Moors is open. The world can hold weight without trying to solve it."
      : "This path remains closed for now.";
  }

  if (chapterId === "first_bloom") {
    return firstBloomUnlocked
      ? "First Bloom is open. The world can hold growth without hurry."
      : "This path remains closed for now.";
  }

  if (chapterId !== "frozen_ground") {
    return "This path remains closed for now.";
  }

  if (frozenGroundComplete) {
    return "Chapter One is held. Frozen Ground remembers every place you entered.";
  }

  if (frozenGroundMemoryCount > 0) {
    return "Frozen Ground is no longer empty. What you left there is still held.";
  }

  return "A winter field for the first shock of absence. The Evergreen Tree is open.";
}
