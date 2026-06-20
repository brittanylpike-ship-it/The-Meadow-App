import { CompanionSummaryRow } from "@/components/Profile/CompanionSummaryRow";
import { GriefSupportSection } from "@/components/Profile/GriefSupportSection";
import { JourneyReflection } from "@/components/Profile/JourneyReflection";
import { MirrorHero } from "@/components/Profile/MirrorHero";
import { SettingsSection } from "@/components/Profile/SettingsSection";
import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { useProfileContext } from "@/hooks/useProfileContext";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

function useEntrance(delay: number, translate = true) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(translate ? 16 : 0);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 360, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 360, easing: Easing.out(Easing.quad) }));
  }, [delay, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

export default function ProfileScreen() {
  const { loading: authLoading, user } = useAuth();
  const context = useProfileContext();
  const [refreshing, setRefreshing] = React.useState(false);
  const heroEntrance = useEntrance(0, false);
  const identityEntrance = useEntrance(180);
  const journeyEntrance = useEntrance(320);
  const companionEntrance = useEntrance(460);
  const supportEntrance = useEntrance(580);
  const settingsEntrance = useEntrance(700);

  if (!authLoading && !user) {
    return <Redirect href="/auth" />;
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await context.refresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl colors={[meadowTheme.colors.sage]} refreshing={refreshing} tintColor={meadowTheme.colors.sage} onRefresh={() => void handleRefresh()} />}
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{ gap: 24, paddingBottom: 120 }}
    >
      <Animated.View style={heroEntrance}>
        <MirrorHero />
      </Animated.View>

      <Animated.View style={identityEntrance}>
        <IdentityBlock
          displayName={context.displayName}
          journalEntryCount={context.journalEntryCount}
          lastChapterName={context.lastChapterName}
          totalRitualsCompleted={context.totalRitualsCompleted}
        />
      </Animated.View>

      {context.loading ? (
        <View style={{ alignItems: "center", minHeight: 80, justifyContent: "center" }}>
          <ActivityIndicator accessibilityLabel="The Meadow is restoring your reflection" color={meadowTheme.colors.sageDeep} />
        </View>
      ) : null}

      <Animated.View style={journeyEntrance}>
        <JourneyReflection
          journalEntryCount={context.journalEntryCount}
          lastChapterName={context.lastChapterName}
          lastRitualName={context.lastRitualName}
          mostPresentCompanion={context.mostPresentCompanion}
          totalRitualsCompleted={context.totalRitualsCompleted}
        />
      </Animated.View>

      <Animated.View style={companionEntrance}>
        <CompanionSummaryRow companionState={context.companionState} />
      </Animated.View>

      <Animated.View style={supportEntrance}>
        <GriefSupportSection />
      </Animated.View>

      <Animated.View style={settingsEntrance}>
        <SettingsSection
          animationsEnabled={context.animationsEnabled}
          audioEnabled={context.audioEnabled}
          displayName={context.displayName}
          journalEntryCount={context.journalEntryCount}
          onSaveDisplayName={context.saveDisplayName}
          onToggleAnimations={context.setAnimationsEnabled}
          onToggleAudio={context.setAudioEnabled}
        />
      </Animated.View>
    </ScrollView>
  );
}

function IdentityBlock({
  displayName,
  journalEntryCount,
  lastChapterName,
  totalRitualsCompleted,
}: {
  displayName: string;
  journalEntryCount: number;
  lastChapterName: string | null;
  totalRitualsCompleted: number;
}) {
  const contextLine =
    totalRitualsCompleted > 0 && lastChapterName
      ? `Traveling through ${lastChapterName}.`
      : journalEntryCount > 0
        ? "A journal keeper in The Meadow."
        : "Just arrived. Welcome.";

  return (
    <View style={{ alignItems: "center", gap: 8, paddingHorizontal: 20 }}>
      {displayName ? (
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, letterSpacing: 2, lineHeight: 18, textAlign: "center", textTransform: "uppercase" }}>
          {displayName}
        </Text>
      ) : null}
      <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 22, fontStyle: "italic", lineHeight: 29, textAlign: "center" }}>
        You are known here.
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.header, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
        {contextLine}
      </Text>
      <Image source={require("@/assets/art/vine-divider.png")} contentFit="contain" style={{ height: 28, marginTop: 6, width: 160 }} />
    </View>
  );
}
