import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

import { MeadowButton } from "@/components/meadow-button";
import { MeadowPanel } from "@/components/meadow-screen";
import { meadowTheme } from "@/constants/meadow-theme";
import type { ChapterProgress } from "@/hooks/useChapterProgress";
import { toRouteRitualId } from "@/hooks/useChapterProgress";

type Landmark<LandmarkId extends string = string> = {
  id: LandmarkId;
  title: string;
  emotionalThread: string;
  route?: string;
  enabled?: boolean;
};

type LandmarkSummary = {
  buttonLabel: string;
  description: string;
  route: string;
};

type NextChapter = {
  name: string;
  route: string;
};

type ChapterProgressSectionProps<LandmarkId extends string = string> = {
  landmarks: readonly Landmark<LandmarkId>[];
  progress: ChapterProgress;
  getSummary: (landmarkId: LandmarkId) => LandmarkSummary;
  nextChapter?: NextChapter;
};

export function ChapterProgressSection<LandmarkId extends string>({ landmarks, progress, getSummary, nextChapter }: ChapterProgressSectionProps<LandmarkId>) {
  const completed = new Set(progress.completedRituals);
  const locked = !progress.isUnlocked;

  return (
    <View style={{ gap: 12 }}>
      {landmarks.map((landmark) => {
        const summary = getSummary(landmark.id);
        const ritualId = toRouteRitualId(landmark.id);
        const isComplete = completed.has(ritualId);
        const canBegin = progress.isUnlocked && landmark.enabled !== false;

        return (
          <MeadowPanel key={landmark.id}>
            <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text selectable style={{ color: locked ? meadowTheme.colors.mutedInk : meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 24, lineHeight: 30 }}>
                  {landmark.title}
                </Text>
                <Text selectable style={{ color: locked ? meadowTheme.colors.mutedInk : meadowTheme.colors.sageDeep, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 20 }}>
                  {landmark.emotionalThread}
                </Text>
              </View>
              <Text selectable style={{ color: isComplete ? meadowTheme.colors.sageDeep : meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 19 }}>
                {isComplete ? "Complete" : locked ? "Locked" : "Begin"}
              </Text>
            </View>
            <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 23 }}>
              {locked ? "This path remains closed for now." : summary.description}
            </Text>
            {canBegin ? <MeadowButton label={isComplete ? summary.buttonLabel : "Begin"} onPress={() => router.push(summary.route as never)} /> : null}
          </MeadowPanel>
        );
      })}

      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 19, textAlign: "center" }}>
        {progress.completedRituals.length} of {progress.totalRituals} rituals complete.
      </Text>

      {progress.isComplete && nextChapter ? (
        <MeadowPanel>
          <Text selectable style={{ color: meadowTheme.colors.sageDeep, fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 24, textAlign: "center" }}>
            {nextChapter.name} is now open.
          </Text>
          <MeadowButton label={`Enter ${nextChapter.name}`} onPress={() => router.push(nextChapter.route as never)} />
        </MeadowPanel>
      ) : null}

      {progress.chapterNumber === 5 && progress.isComplete ? (
        <MeadowPanel>
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 28, lineHeight: 34, textAlign: "center" }}>
            You have walked every path.
          </Text>
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 15, fontStyle: "italic", lineHeight: 22, textAlign: "center" }}>
            The Meadow remembers every step. Your journey does not end here, it deepens.
          </Text>
          <MeadowButton label="Return to The Meadow" onPress={() => router.push("/" as never)} />
        </MeadowPanel>
      ) : null}
    </View>
  );
}
