export function getFrozenGroundChapterIntro(state) {
  const memoryCount = state?.chapterState?.frozenGround?.memoryCount ?? state?.memoryObjects?.length ?? 0;
  const chapterComplete = Boolean(state?.chapterState?.frozenGround?.chapterComplete);

  if (chapterComplete) {
    return {
      subtitle: "Chapter One is held in the snow.",
      title: "Frozen Ground remembers each place",
      body: "The tree, window, pond, hour, and path all carry something you trusted to them.",
    };
  }

  if (memoryCount > 0) {
    return {
      subtitle: "Frozen Ground has begun to remember what you left.",
      title: "The snow kept a trace",
      body: "Return to any place here and it will meet you with what remains.",
    };
  }

  return {
    subtitle: "A still winter chapter for the first shock of absence.",
    title: "The snow is quiet",
    body: "Each place is waiting without asking anything from you.",
  };
}
