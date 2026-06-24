import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { ChapterMap } from "@/components/chapter-map";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { useMeadowState } from "@/features/world/use-meadow-state";
import { useChapterProgress } from "@/hooks/useChapterProgress";

export default function ChaptersScreen() {
  const { user, loading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const chapterProgress = useChapterProgress();

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  const frozenGroundMemoryCount = meadow.state?.chapterState.frozenGround.memoryCount ?? 0;
  const frozenGroundComplete = Boolean(meadow.state?.chapterState.frozenGround.chapterComplete);
  const stormGardenUnlocked = Boolean(meadow.state?.chapterState.stormGarden.unlocked);
  const crossroadsUnlocked = Boolean(meadow.state?.chapterState.crossroads.unlocked);
  const moorsUnlocked = Boolean(meadow.state?.chapterState.theMoors.unlocked);
  const firstBloomUnlocked = Boolean(meadow.state?.chapterState.firstBloom.unlocked);

  return (
    <View style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}>
      {loading || meadow.loading || chapterProgress.loading ? (
        <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
          <ActivityIndicator accessibilityLabel="The Meadow is restoring the Chapters" color={meadowTheme.colors.sageDeep} />
        </View>
      ) : (
        <ChapterMap mode="world" chapterProgress={chapterProgress.progress} frozenGroundMemoryCount={frozenGroundMemoryCount} frozenGroundComplete={frozenGroundComplete} stormGardenUnlocked={stormGardenUnlocked} crossroadsUnlocked={crossroadsUnlocked} moorsUnlocked={moorsUnlocked} firstBloomUnlocked={firstBloomUnlocked} />
      )}
    </View>
  );
}
