import { Redirect } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { ChapterProgressSection } from "@/components/chapter-progress-section";
import { MeadowDivider, MeadowPanel, MeadowScreen } from "@/components/meadow-screen";
import { MeadowSceneImage } from "@/components/meadow-scene-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import {
  getMoorsChapterIntro,
  getMoorsLandmarkReturnSummary,
  moorsLandmarks
} from "@/features/memory/moors-memory.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";
import { useChapterProgress } from "@/hooks/useChapterProgress";

export default function TheMoorsScreen() {
  const { user, loading: authLoading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const chapterProgression = useChapterProgress();
  const recordedVisitRef = useRef<string | null>(null);
  const intro = getMoorsChapterIntro(meadow.state);
  const moorsProgress = chapterProgression.progress.find((chapter) => chapter.chapterNumber === 4) ?? {
    chapterNumber: 4,
    completedRituals: [],
    isComplete: false,
    isUnlocked: false,
    totalRituals: 5,
  };

  useEffect(() => {
    const visitKey = user?.id ? `${user.id}:the_moors` : null;
    if (!visitKey || !meadow.state || intro.locked || recordedVisitRef.current === visitKey) return;

    recordedVisitRef.current = visitKey;
    meadow.markChapterVisited.mutate({ chapterId: "the_moors" });
  }, [intro.locked, meadow, user?.id]);

  if (!authLoading && !user) {
    return <Redirect href="/auth" />;
  }

  return (
    <MeadowScreen title="The Moors" subtitle={intro.subtitle}>
      <MeadowSceneImage sceneId="chapter_the_moors" accessibilityLabel="A rendered Moors chapter page" />

      {authLoading || meadow.loading || chapterProgression.loading ? (
        <MeadowPanel>
          <ActivityIndicator accessibilityLabel="The Meadow is restoring The Moors" color={meadowTheme.colors.sageDeep} />
        </MeadowPanel>
      ) : (
        <View style={{ gap: 12 }}>
          <MeadowPanel>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 24, lineHeight: 30 }}>
              {intro.title}
            </Text>
            <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 23 }}>
              {intro.body}
            </Text>
          </MeadowPanel>

          <ChapterProgressSection
            landmarks={moorsLandmarks}
            progress={moorsProgress}
            getSummary={(landmarkId) => getMoorsLandmarkReturnSummary(meadow.state, landmarkId)}
            nextChapter={{ name: "First Bloom", route: "/first-bloom" }}
          />
        </View>
      )}

      <MeadowDivider />
    </MeadowScreen>
  );
}
