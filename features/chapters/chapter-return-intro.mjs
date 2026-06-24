export function getChapterReturnIntro(state) {
  const memoryCount = state?.chapterState?.frozenGround?.memoryCount ?? state?.memoryObjects?.length ?? 0;

  if (memoryCount > 0) {
    return {
      subtitle: "Frozen Ground has begun to remember.",
      title: "Chapter One is holding what you left",
      body: "The path back is no longer empty.",
    };
  }

  return {
    subtitle: "The world is the navigation. Frozen Ground is open now.",
    title: "Frozen Ground is open",
    body: "The first path is waiting in the snow.",
  };
}
