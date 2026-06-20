import { Redirect } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { ChapterProgressSection } from "@/components/chapter-progress-section";
import { MeadowDivider, MeadowPanel, MeadowScreen } from "@/components/meadow-screen";
import { MeadowSceneImage } from "@/components/meadow-scene-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import {
  getStormGardenChapterIntro,
  getStormGardenLandmarkReturnSummary,
  stormGardenLandmarks
} from "@/features/memory/storm-garden-memory.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";
import { useChapterProgress } from "@/hooks/useChapterProgress";

export default function StormGardenScreen() {
  const { user, loading: authLoading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const chapterProgression = useChapterProgress();
  const recordedVisitRef = useRef<string | null>(null);
  const intro = getStormGardenChapterIntro(meadow.state);
  const stormGardenProgress = chapterProgression.progress.find((chapter) => chapter.chapterNumber === 2) ?? {
    chapterNumber: 2,
    completedRituals: [],
    isComplete: false,
    isUnlocked: false,
    totalRituals: 5,
  };

  useEffect(() => {
    const visitKey = user?.id ? `${user.id}:storm_garden` : null;
    if (!visitKey || !meadow.state || intro.locked || recordedVisitRef.current === visitKey) return;

    recordedVisitRef.current = visitKey;
    meadow.markChapterVisited.mutate({ chapterId: "storm_garden" });
  }, [intro.locked, meadow, user?.id]);

  if (!authLoading && !user) {
    return <Redirect href="/auth" />;
  }

  return (
    <MeadowScreen title="Storm Garden" subtitle={intro.subtitle}>
      <MeadowSceneImage sceneId="chapter_storm_garden" accessibilityLabel="A rendered Storm Garden chapter page" />

      {authLoading || meadow.loading || chapterProgression.loading ? (
        <MeadowPanel>
          <ActivityIndicator accessibilityLabel="The Meadow is restoring Storm Garden" color={meadowTheme.colors.sageDeep} />
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
            landmarks={stormGardenLandmarks}
            progress={stormGardenProgress}
            getSummary={(landmarkId) => getStormGardenLandmarkReturnSummary(meadow.state, landmarkId)}
            nextChapter={{ name: "Crossroads", route: "/crossroads" }}
          />
        </View>
      )}

      <MeadowDivider />
    </MeadowScreen>
  );
}
