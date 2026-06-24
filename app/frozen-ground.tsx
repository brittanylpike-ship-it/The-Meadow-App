import { Redirect } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { ChapterProgressSection } from "@/components/chapter-progress-section";
import { MeadowDivider, MeadowPanel, MeadowScreen } from "@/components/meadow-screen";
import { MeadowSceneImage } from "@/components/meadow-scene-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { getFrozenGroundChapterIntro } from "@/features/chapters/frozen-ground-chapter-intro.mjs";
import { frozenGroundLandmarks } from "@/features/chapters/frozen-ground-landmarks.mjs";
import { getFrozenGroundLandmarkReturnSummary } from "@/features/chapters/frozen-ground-return-summary.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";
import { useChapterProgress } from "@/hooks/useChapterProgress";

export default function FrozenGroundScreen() {
  const { user, loading: authLoading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const chapterProgression = useChapterProgress();
  const recordedVisitRef = useRef<string | null>(null);

  useEffect(() => {
    const visitKey = user?.id ? `${user.id}:frozen_ground` : null;
    if (!visitKey || !meadow.state || recordedVisitRef.current === visitKey) return;

    recordedVisitRef.current = visitKey;
    meadow.markChapterVisited.mutate({ chapterId: "frozen_ground" });
  }, [meadow, user?.id]);

  if (!authLoading && !user) {
    return <Redirect href="/auth" />;
  }

  const intro = getFrozenGroundChapterIntro(meadow.state);
  const frozenGroundProgress = chapterProgression.progress.find((chapter) => chapter.chapterNumber === 1) ?? {
    chapterNumber: 1,
    completedRituals: [],
    isComplete: false,
    isUnlocked: true,
    totalRituals: 5,
  };

  return (
    <MeadowScreen title="Frozen Ground" subtitle={intro.subtitle}>
      <MeadowSceneImage sceneId="chapter_frozen_ground" accessibilityLabel="A rendered Frozen Ground chapter page" />

      {authLoading || meadow.loading || chapterProgression.loading ? (
        <MeadowPanel>
          <ActivityIndicator accessibilityLabel="The Meadow is restoring Frozen Ground" color={meadowTheme.colors.sageDeep} />
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
            landmarks={frozenGroundLandmarks}
            progress={frozenGroundProgress}
            getSummary={(landmarkId) => getFrozenGroundLandmarkReturnSummary(meadow.state, landmarkId)}
            nextChapter={{ name: "Storm Garden", route: "/storm-garden" }}
          />
        </View>
      )}

      <MeadowDivider />
    </MeadowScreen>
  );
}
