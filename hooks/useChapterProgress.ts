import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useAuth } from "@/features/auth/auth-context";
import { useMeadowState } from "@/features/world/use-meadow-state";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export interface ChapterProgress {
  chapterNumber: number;
  isUnlocked: boolean;
  completedRituals: string[];
  totalRituals: number;
  isComplete: boolean;
}

type ChapterDefinition = {
  chapterNumber: number;
  chapterId: string;
  stateKey: "frozenGround" | "stormGarden" | "crossroads" | "theMoors" | "firstBloom";
  rituals: string[];
};

export const CHAPTER_RITUALS: ChapterDefinition[] = [
  {
    chapterNumber: 1,
    chapterId: "frozen_ground",
    stateKey: "frozenGround",
    rituals: ["evergreen-tree", "frosted-window", "frozen-pond", "quiet-hour", "footprints"],
  },
  {
    chapterNumber: 2,
    chapterId: "storm_garden",
    stateKey: "stormGarden",
    rituals: ["lightning-tree", "thorn-patch", "floodwaters", "scorched-earth", "shattered-mirror"],
  },
  {
    chapterNumber: 3,
    chapterId: "crossroads",
    stateKey: "crossroads",
    rituals: ["worn-path", "offering", "candle", "searching-for-signs", "waiting-gate"],
  },
  {
    chapterNumber: 4,
    chapterId: "the_moors",
    stateKey: "theMoors",
    rituals: ["canopy-cloak", "mire", "fog", "bramble", "vanishing-path"],
  },
  {
    chapterNumber: 5,
    chapterId: "first_bloom",
    stateKey: "firstBloom",
    rituals: ["grounding", "opening", "anchoring", "emergence", "integration"],
  },
];

export const devChapterProgress: ChapterProgress[] = CHAPTER_RITUALS.map((chapter) => {
  if (chapter.chapterNumber === 1) {
    return {
      chapterNumber: chapter.chapterNumber,
      completedRituals: chapter.rituals,
      isComplete: true,
      isUnlocked: true,
      totalRituals: 5,
    };
  }

  if (chapter.chapterNumber === 2) {
    return {
      chapterNumber: chapter.chapterNumber,
      completedRituals: chapter.rituals.slice(0, 2),
      isComplete: false,
      isUnlocked: true,
      totalRituals: 5,
    };
  }

  return {
    chapterNumber: chapter.chapterNumber,
    completedRituals: [],
    isComplete: false,
    isUnlocked: false,
    totalRituals: 5,
  };
});

export function useChapterProgress() {
  const { user, loading: authLoading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const queryClient = useQueryClient();
  const unlockedRef = React.useRef<Set<number>>(new Set());

  const progress = React.useMemo(() => {
    if (!hasSupabaseConfig) {
      return devChapterProgress;
    }

    return buildChapterProgress(meadow.state);
  }, [meadow.state]);

  const refresh = React.useCallback(() => {
    if (user?.id) {
      void queryClient.invalidateQueries({ queryKey: ["meadow-state", user.id] });
    }
  }, [queryClient, user?.id]);

  const unlockNextChapter = React.useCallback(
    async (completedChapterNumber: number) => {
      if (!hasSupabaseConfig || !supabase || !user) {
        return;
      }

      if (completedChapterNumber >= 5) {
        await supabase
          .from("profiles")
          .update({
            current_chapter: 5,
            journey_complete: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        await supabase.from("milestones").upsert(
          {
            earned_at: new Date().toISOString(),
            key: "journey-complete",
            title: "The Meadow Remembers",
            user_id: user.id,
          },
          { onConflict: "user_id,key" }
        );
        return;
      }

      await supabase
        .from("profiles")
        .update({
          current_chapter: Math.min(5, completedChapterNumber + 1),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    },
    [user]
  );

  React.useEffect(() => {
    if (!hasSupabaseConfig || !user) {
      return;
    }

    for (const chapter of progress) {
      if (!chapter.isComplete || unlockedRef.current.has(chapter.chapterNumber)) {
        continue;
      }

      unlockedRef.current.add(chapter.chapterNumber);
      void unlockNextChapter(chapter.chapterNumber);
    }
  }, [progress, unlockNextChapter, user]);

  return {
    progress,
    loading: hasSupabaseConfig ? authLoading || meadow.loading : false,
    refresh,
    unlockNextChapter,
  };
}

export function buildChapterProgress(state: any): ChapterProgress[] {
  const completed = new Set((state?.memoryObjects ?? []).map((memory: { ritualId?: string }) => toRouteRitualId(memory.ritualId ?? "")));

  const baseProgress = CHAPTER_RITUALS.map((chapter) => {
    const completedRituals = chapter.rituals.filter((ritualId) => completed.has(ritualId));
    const chapterState = state?.chapterState?.[chapter.stateKey];
    const isComplete = completedRituals.length >= 5 || Boolean(chapterState?.chapterComplete);

    return {
      chapterNumber: chapter.chapterNumber,
      completedRituals,
      isComplete,
      isUnlocked: chapter.chapterNumber === 1,
      totalRituals: 5,
    };
  });

  return baseProgress.map((chapter, index) => {
    if (chapter.chapterNumber === 1) {
      return chapter;
    }

    const previous = baseProgress[index - 1];
    return {
      ...chapter,
      isUnlocked: Boolean(previous?.isComplete),
    };
  });
}

export function toRouteRitualId(ritualId: string) {
  return ritualId.replace(/_/g, "-");
}
