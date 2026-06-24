import { MeadowImage as Image } from "@/components/meadow-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";

import { MeadowSceneImage } from "@/components/meadow-scene-image";
import { chapterMap } from "@/constants/meadow-content";
import { meadowTheme } from "@/constants/meadow-theme";
import { getChapterMapDescription } from "@/features/chapters/chapter-map-copy.mjs";
import type { ChapterProgress } from "@/hooks/useChapterProgress";

type ChapterMapProps = {
  frozenGroundMemoryCount?: number;
  frozenGroundComplete?: boolean;
  stormGardenUnlocked?: boolean;
  crossroadsUnlocked?: boolean;
  moorsUnlocked?: boolean;
  firstBloomUnlocked?: boolean;
  chapterProgress?: ChapterProgress[];
  mode?: "list" | "world";
};

const chapterPlateSources = {
  frozen_ground: require("@/assets/art/rendered/chapter-frozen-ground.png"),
  storm_garden: require("@/assets/art/rendered/chapter-storm-garden.png"),
  crossroads: require("@/assets/art/rendered/chapter-crossroads.png"),
  the_moors: require("@/assets/art/rendered/chapter-the-moors.png"),
  first_bloom: require("@/assets/art/rendered/chapter-first-bloom.png"),
} satisfies Record<(typeof chapterMap)[number]["id"], unknown>;

const approvedChaptersMapSource = require("@/assets/illustrations/chapters-approved-home.png");
const approvedChaptersAspectRatio = 853 / 1844;

const mapTouchZones = {
  frozen_ground: { left: 0, top: 0.16, width: 0.21, height: 0.45 },
  storm_garden: { left: 0.2, top: 0.16, width: 0.21, height: 0.45 },
  crossroads: { left: 0.4, top: 0.16, width: 0.2, height: 0.45 },
  the_moors: { left: 0.59, top: 0.16, width: 0.22, height: 0.45 },
  first_bloom: { left: 0.8, top: 0.16, width: 0.2, height: 0.45 },
} satisfies Record<(typeof chapterMap)[number]["id"], { left: number; top: number; width: number; height: number }>;

function progressForChapter(chapterId: (typeof chapterMap)[number]["id"], chapterProgress?: ChapterProgress[]) {
  const chapterNumber = chapterMap.findIndex((chapter) => chapter.id === chapterId) + 1;
  return chapterProgress?.find((chapter) => chapter.chapterNumber === chapterNumber);
}

export function ChapterMap({ frozenGroundMemoryCount = 0, frozenGroundComplete = false, stormGardenUnlocked = false, crossroadsUnlocked = false, moorsUnlocked = false, firstBloomUnlocked = false, chapterProgress, mode = "list" }: ChapterMapProps) {
  const { width } = useWindowDimensions();
  const worldMapWidth = Math.min(width, 560);
  const worldMapHeight = worldMapWidth / approvedChaptersAspectRatio;

  function isChapterEnabled(chapter: (typeof chapterMap)[number]) {
    const chapterStatus = progressForChapter(chapter.id, chapterProgress);
    if (chapterStatus) {
      return chapterStatus.isUnlocked;
    }

    return chapter.id === "storm_garden" ? stormGardenUnlocked : chapter.id === "crossroads" ? crossroadsUnlocked : chapter.id === "the_moors" ? moorsUnlocked : chapter.id === "first_bloom" ? firstBloomUnlocked : chapter.enabled;
  }

  if (mode === "world") {
    return (
      <ScrollView
        style={{ backgroundColor: meadowTheme.colors.linen, flex: 1, width: "100%" }}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 92 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            height: worldMapHeight,
            overflow: "hidden",
            position: "relative",
            width: worldMapWidth,
          }}
        >
          <Image
            source={approvedChaptersMapSource}
            style={{ height: worldMapHeight, width: worldMapWidth }}
            contentFit="cover"
            accessibilityLabel="The approved Meadow Chapters storybook map with Frozen Ground, Storm Garden, Crossroads, The Moors, and First Bloom"
            accessibilityRole="image"
          />
          {chapterMap.map((chapter) => {
            const enabled = isChapterEnabled(chapter);
            const description = enabled ? getChapterMapDescription(chapter.id, frozenGroundMemoryCount, frozenGroundComplete, stormGardenUnlocked, crossroadsUnlocked, moorsUnlocked, firstBloomUnlocked) : "This path remains closed for now.";
            const touchZone = mapTouchZones[chapter.id];
            return (
              <Pressable
                key={chapter.id}
                accessibilityLabel={`${chapter.title}. ${description}`}
                accessibilityHint={enabled ? "Opens this chapter." : "This chapter is not open yet."}
                accessibilityRole="button"
                accessibilityState={{ disabled: !enabled }}
                disabled={!enabled}
                hitSlop={8}
                onPress={() => {
                  if (chapter.route) router.push(chapter.route as never);
                }}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "rgba(242, 237, 228, 0.28)" : "transparent",
                  borderRadius: meadowTheme.radius.control,
                  height: worldMapHeight * touchZone.height,
                  left: worldMapWidth * touchZone.left,
                  position: "absolute",
                  top: worldMapHeight * touchZone.top,
                  width: worldMapWidth * touchZone.width,
                })}
              />
            );
          })}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      <MeadowSceneImage sceneId="chapters_home" accessibilityLabel="A rendered storybook chapters page for The Meadow" />

      <View style={{ gap: 10 }}>
        {chapterMap.map((chapter) => {
          const enabled = isChapterEnabled(chapter);
          const chapterStatus = progressForChapter(chapter.id, chapterProgress);
          const description = enabled ? getChapterMapDescription(chapter.id, frozenGroundMemoryCount, frozenGroundComplete, stormGardenUnlocked, crossroadsUnlocked, moorsUnlocked, firstBloomUnlocked) : "This path remains closed for now.";
          return (
          <Pressable
            key={chapter.id}
            accessibilityLabel={`${chapter.title}. ${description}`}
            accessibilityHint={enabled ? "Opens this chapter." : "This chapter is not open yet."}
            accessibilityRole="button"
            accessibilityState={{ disabled: !enabled }}
            disabled={!enabled}
            hitSlop={6}
            onPress={() => {
              if (chapter.route) router.push(chapter.route as never);
            }}
            style={({ pressed }) => ({
              backgroundColor: enabled ? meadowTheme.colors.panel : meadowTheme.colors.panelDeep,
              borderColor: meadowTheme.colors.line,
              borderRadius: meadowTheme.radius.panel,
              borderCurve: "continuous",
              borderWidth: 1,
              boxShadow: enabled ? "0 2px 8px rgba(37, 51, 31, 0.05)" : "inset 0 1px 4px rgba(37, 51, 31, 0.04)",
              flexDirection: "row",
              gap: 12,
              minHeight: 112,
              opacity: pressed ? 0.82 : 1,
              overflow: "hidden",
              padding: 14
            })}
          >
            <View style={{ backgroundColor: meadowTheme.colors.linenDeep, borderRadius: 6, height: 84, overflow: "hidden", width: 58 }}>
              <Image
                source={chapterPlateSources[chapter.id]}
                style={{ height: 84, opacity: enabled ? 1 : 0.58, width: 58 }}
                contentFit="contain"
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </View>
            <View style={{ flex: 1, gap: 4, justifyContent: "center" }}>
              <Text
                selectable
                style={{
                  color: meadowTheme.colors.ink,
                  fontFamily: meadowTheme.fonts.header,
                  fontSize: 20,
                  lineHeight: 25
                }}
              >
                {chapter.title}
              </Text>
              <Text
                selectable
                style={{
                  color: meadowTheme.colors.mutedInk,
                  fontFamily: meadowTheme.fonts.body,
                  fontSize: 15,
                  lineHeight: 21
                }}
              >
                {description}
              </Text>
              {chapterStatus ? (
                <Text
                  selectable
                  style={{
                    color: chapterStatus.isComplete || chapterStatus.isUnlocked ? meadowTheme.colors.sageDeep : meadowTheme.colors.mutedInk,
                    fontFamily: meadowTheme.fonts.body,
                    fontSize: 12,
                    lineHeight: 17,
                  }}
                >
                  {chapterStatus.isComplete ? "Complete" : chapterStatus.isUnlocked ? `${chapterStatus.completedRituals.length} / ${chapterStatus.totalRituals} rituals` : "Locked"}
                </Text>
              ) : null}
            </View>
          </Pressable>
          );
        })}
      </View>
    </View>
  );
}
