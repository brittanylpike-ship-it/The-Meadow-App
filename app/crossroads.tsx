import { Redirect } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { ChapterProgressSection } from "@/components/chapter-progress-section";
import { MeadowDivider, MeadowPanel, MeadowScreen } from "@/components/meadow-screen";
import { MeadowSceneImage } from "@/components/meadow-scene-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import {
  crossroadsLandmarks,
  getCrossroadsChapterIntro,
  getCrossroadsLandmarkReturnSummary
} from "@/features/memory/crossroads-memory.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";
import { useChapterProgress } from "@/hooks/useChapterProgress";

export default function CrossroadsScreen() {
  const { user, loading: authLoading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const chapterProgression = useChapterProgress();
  const recordedVisitRef = useRef<string | null>(null);
  const intro = getCrossroadsChapterIntro(meadow.state);
  const crossroadsProgress = chapterProgression.progress.find((chapter) => chapter.chapterNumber === 3) ?? {
    chapterNumber: 3,
    completedRituals: [],
    isComplete: false,
    isUnlocked: false,
    totalRituals: 5,
  };

  useEffect(() => {
    const visitKey = user?.id ? `${user.id}:crossroads` : null;
    if (!visitKey || !meadow.state || intro.locked || recordedVisitRef.current === visitKey) return;

    recordedVisitRef.current = visitKey;
    meadow.markChapterVisited.mutate({ chapterId: "crossroads" });
  }, [intro.locked, meadow, user?.id]);

  if (!authLoading && !user) {
    return <Redirect href="/auth" />;
  }

  return (
    <MeadowScreen title="Crossroads" subtitle={intro.subtitle}>
      <MeadowSceneImage sceneId="chapter_crossroads" accessibilityLabel="A rendered Crossroads chapter page" />

      {authLoading || meadow.loading || chapterProgression.loading ? (
        <MeadowPanel>
          <ActivityIndicator accessibilityLabel="The Meadow is restoring Crossroads" color={meadowTheme.colors.sageDeep} />
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
            landmarks={crossroadsLandmarks}
            progress={crossroadsProgress}
            getSummary={(landmarkId) => getCrossroadsLandmarkReturnSummary(meadow.state, landmarkId)}
            nextChapter={{ name: "The Moors", route: "/the-moors" }}
          />
        </View>
      )}

      <MeadowDivider />
    </MeadowScreen>
  );
}
