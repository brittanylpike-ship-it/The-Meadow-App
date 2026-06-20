import { Redirect, router, useFocusEffect } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useQueryClient } from "@tanstack/react-query";

import { MeadowButton } from "@/components/meadow-button";
import { ChapterMap } from "@/components/chapter-map";
import { CottageHero } from "@/components/Home/CottageHero";
import { MeadowPanel, MeadowScreen } from "@/components/meadow-screen";
import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import { companions } from "@/data/companions";
import { useAuth } from "@/features/auth/auth-context";
import { getMeadowHomeReturnState } from "@/features/chapters/frozen-ground-return-summary.mjs";
import { getHomeLatestMemoryCard } from "@/features/sync/home-latest-memory-card.mjs";
import { getHomeSyncNotice } from "@/features/sync/home-sync-notice.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";
import { getCompanionPresenceOpacity, useCompanionState } from "@/hooks/useCompanionState";

function useEntrance(delay: number, translate = true) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(translate ? 20 : 0);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: translate ? 350 : 400, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: translate ? 350 : 400, easing: Easing.out(Easing.quad) }));
  }, [delay, opacity, translate, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

function useDoorPulse() {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1.012, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withDelay(4000, withTiming(1, { duration: 0 }))
        ),
        -1,
        false
      )
    );
  }, [scale]);

  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const queryClient = useQueryClient();
  const companionState = useCompanionState();
  const heroEntrance = useEntrance(0, false);
  const greetingEntrance = useEntrance(200);
  const doorEntrance = useEntrance(380);
  const companionEntrance = useEntrance(520);
  const quickPathsEntrance = useEntrance(640);
  const remembersEntrance = useEntrance(760);
  const footerEntrance = useEntrance(860);
  const doorPulse = useDoorPulse();

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: ["meadow-state", user.id] });
        void queryClient.invalidateQueries({ queryKey: ["meadow-sync-queue", user.id] });
      }
    }, [queryClient, user?.id])
  );

  if (!authLoading && !user) {
    return <Redirect href="/auth" />;
  }

  const returnState = getMeadowHomeReturnState(meadow.state);
  const latestMemoryCard = getHomeLatestMemoryCard(meadow.state);
  const syncNotice = getHomeSyncNotice(meadow.syncSummary);
  const frozenGroundMemoryCount = meadow.state?.chapterState.frozenGround.memoryCount ?? 0;
  const frozenGroundComplete = Boolean(meadow.state?.chapterState.frozenGround.chapterComplete);
  const stormGardenUnlocked = Boolean(meadow.state?.chapterState.stormGarden.unlocked);
  const crossroadsUnlocked = Boolean(meadow.state?.chapterState.crossroads.unlocked);
  const moorsUnlocked = Boolean(meadow.state?.chapterState.theMoors.unlocked);
  const firstBloomUnlocked = Boolean(meadow.state?.chapterState.firstBloom.unlocked);
  const firstVisit = !meadow.loading && frozenGroundMemoryCount === 0 && !latestMemoryCard;
  const season = firstBloomUnlocked ? "bloom" : stormGardenUnlocked ? "storm" : "winter";
  const companionCandidates = companions
    .map((companion) => ({
      companion,
      opacity: getCompanionPresenceOpacity(companion, companionState.state, companionState.totalRitualsWitnessed),
    }))
    .filter((candidate) => candidate.opacity > 0)
    .sort((left, right) => right.opacity - left.opacity);
  const homeCompanion = companionCandidates[0] ?? null;

  return (
    <MeadowScreen title="The Meadow" subtitle={returnState.subtitle}>
      <Animated.View style={heroEntrance}>
        <CottageHero sceneId="home" season={season} companion={firstVisit ? null : homeCompanion?.companion} companionOpacity={homeCompanion?.opacity ?? 0} />
      </Animated.View>

      <Animated.View style={greetingEntrance}>
        <MeadowPanel>
          {authLoading || meadow.loading ? (
            <ActivityIndicator accessibilityLabel="The Meadow is restoring your home" color={meadowTheme.colors.sageDeep} />
          ) : (
            <View style={{ gap: 12 }}>
              <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 23, lineHeight: 29 }}>
                Return to the Meadow
              </Text>
              <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 23 }}>
                {returnState.body}
              </Text>
              <MeadowButton label={returnState.buttonLabel} onPress={() => router.push(returnState.route as never)} />
            </View>
          )}
        </MeadowPanel>
      </Animated.View>

      {firstVisit ? (
        <FirstVisitPoem />
      ) : homeCompanion ? (
        <Animated.View style={companionEntrance}>
          <MeadowPanel>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 28 }}>
              {homeCompanion.companion.name} is nearby.
            </Text>
            <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 24 }}>
              A quiet witness has wandered close to the cottage.
            </Text>
          </MeadowPanel>
        </Animated.View>
      ) : null}

      {latestMemoryCard ? (
        <Animated.View style={[doorEntrance, doorPulse]}>
          <PressCard accessibilityLabel={latestMemoryCard.title} accessibilityRole="button" onPress={() => router.push(latestMemoryCard.route as never)}>
            <MeadowPanel>
              <Text selectable style={{ color: meadowTheme.colors.sageDeep, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 20 }}>
                {latestMemoryCard.place}
              </Text>
              <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 28 }}>
                {latestMemoryCard.title}
              </Text>
              <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 23 }}>
                {latestMemoryCard.body}
              </Text>
              <MeadowButton label={latestMemoryCard.buttonLabel} quiet onPress={() => router.push(latestMemoryCard.route as never)} />
            </MeadowPanel>
          </PressCard>
        </Animated.View>
      ) : null}

      {syncNotice ? (
        <Animated.View style={remembersEntrance}>
          <MeadowPanel>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 28 }}>
              {syncNotice.title}
            </Text>
            <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 23 }}>
              {syncNotice.body}
            </Text>
          </MeadowPanel>
        </Animated.View>
      ) : null}

      <Animated.View style={quickPathsEntrance}>
        <QuickPaths />
      </Animated.View>

      <Animated.View style={remembersEntrance}>
        <ChapterMap frozenGroundMemoryCount={frozenGroundMemoryCount} frozenGroundComplete={frozenGroundComplete} stormGardenUnlocked={stormGardenUnlocked} crossroadsUnlocked={crossroadsUnlocked} moorsUnlocked={moorsUnlocked} firstBloomUnlocked={firstBloomUnlocked} />
      </Animated.View>

      <Animated.View style={footerEntrance}>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 15, fontStyle: "italic", lineHeight: 22, textAlign: "center" }}>
          The Meadow will meet you here.
        </Text>
      </Animated.View>
    </MeadowScreen>
  );
}

function FirstVisitPoem() {
  const lineOne = useEntrance(600);
  const lineTwo = useEntrance(1100);
  const lineThree = useEntrance(1600);
  const lineFour = useEntrance(2200);
  const lines = [
    { style: lineOne, text: "Five chapters. Twenty-five rituals." },
    { style: lineTwo, text: "A thousand ways to be held." },
    { style: lineThree, text: "Wander gently. You are not alone." },
    { style: lineFour, text: "The Meadow remembers." },
  ];

  return (
    <MeadowPanel>
      <View style={{ gap: 8 }}>
        {lines.map((line) => (
          <Animated.Text
            key={line.text}
            selectable
            style={[
              {
                color: meadowTheme.colors.mutedInk,
                fontFamily: meadowTheme.fonts.body,
                fontSize: 16,
                fontStyle: "italic",
                lineHeight: 24,
                textAlign: "center",
              },
              line.style,
            ]}
          >
            {line.text}
          </Animated.Text>
        ))}
      </View>
    </MeadowPanel>
  );
}

function QuickPaths() {
  const paths = [
    { label: "Journal", route: "/journal" },
    { label: "Chapters", route: "/chapters" },
    { label: "Memory Garden", route: "/memory-garden" },
  ] as const;

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {paths.map((path) => (
        <PressCard
          accessibilityLabel={path.label}
          accessibilityRole="button"
          key={path.route}
          onPress={() => router.push(path.route as never)}
          style={{
            backgroundColor: meadowTheme.colors.panel,
            borderColor: meadowTheme.colors.line,
            borderRadius: meadowTheme.radius.panel,
            borderCurve: "continuous",
            borderWidth: 1,
            flex: 1,
            minHeight: 74,
            padding: 10,
          }}
        >
          <Text selectable={false} style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 23, textAlign: "center" }}>
            {path.label}
          </Text>
        </PressCard>
      ))}
    </View>
  );
}
