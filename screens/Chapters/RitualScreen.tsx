import { MeadowImage as Image } from "@/components/meadow-image";
import { CompanionOverlay } from "@/components/CompanionOverlay";
import { WitnessedNoteCard } from "@/components/WitnessedNoteCard";
import { getRitualExperience } from "@/constants/chapter-experience";
import { meadowTheme } from "@/constants/meadow-theme";
import { getAmbientCompanionsForChapter, getCompanionById, getCompanionsForChapter } from "@/data/companions";
import { getCompanionPresenceOpacity, type WitnessedNote, useCompanionState } from "@/hooks/useCompanionState";
import { Audio } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { AppState, Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ambientSources = {
  "wind-snow": require("@/assets/audio/ambient/wind-snow.mp3"),
  "thunder-rain": require("@/assets/audio/ambient/thunder-rain.mp3"),
  "forest-path": require("@/assets/audio/ambient/forest-path.mp3"),
  "moor-wind": require("@/assets/audio/ambient/moor-wind.mp3"),
  "birdsong-spring": require("@/assets/audio/ambient/birdsong-spring.mp3"),
} as const;

const interactionSources = {
  "soft-snow-crunch": require("@/assets/audio/interactions/soft-snow-crunch.mp3"),
  "ice-creak-water": require("@/assets/audio/interactions/ice-creak-water.mp3"),
  "clock-chime": require("@/assets/audio/interactions/clock-chime.mp3"),
  "soft-snow-step": require("@/assets/audio/interactions/soft-snow-step.mp3"),
  "distant-thunder-crack": require("@/assets/audio/interactions/distant-thunder-crack.mp3"),
  "rushing-water-swell": require("@/assets/audio/interactions/rushing-water-swell.mp3"),
  "fire-crackle": require("@/assets/audio/interactions/fire-crackle.mp3"),
  "glass-shimmer": require("@/assets/audio/interactions/glass-shimmer.mp3"),
  "match-flame-settle": require("@/assets/audio/interactions/match-flame-settle.mp3"),
  "deep-exhale": require("@/assets/audio/interactions/deep-exhale.mp3"),
  "petals-rustling": require("@/assets/audio/interactions/petals-rustling.mp3"),
  "soft-chime-chord": require("@/assets/audio/interactions/soft-chime-chord.mp3"),
} as const;

type RitualScreenProps = {
  chapterSlug?: string;
};

export default function RitualScreen({ chapterSlug }: RitualScreenProps) {
  const params = useLocalSearchParams<{ chapterSlug?: string; ritual?: string }>();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { chapter, ritual } = getRitualExperience(chapterSlug ?? params.chapterSlug, params.ritual);
  const [started, setStarted] = React.useState(false);
  const [stageIndex, setStageIndex] = React.useState(0);
  const [companionsRaised, setCompanionsRaised] = React.useState(false);
  const [completionPending, setCompletionPending] = React.useState(false);
  const [witnessedNote, setWitnessedNote] = React.useState<WitnessedNote | null>(null);
  const { recordRitualWitnessed, state: companionState, totalRitualsWitnessed } = useCompanionState();
  const ambientRef = React.useRef<Audio.Sound | null>(null);

  const pulse = useSharedValue(0);
  const sheet = useSharedValue(320);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [pulse]);

  React.useEffect(() => {
    sheet.value = withTiming(started ? 0 : 320, { duration: 360, easing: Easing.out(Easing.cubic) });
  }, [sheet, started]);

  React.useEffect(() => {
    let mounted = true;

    async function loadAmbient() {
      if (!chapter) {
        return;
      }

      try {
        const source = ambientSources[chapter.ambientSound as keyof typeof ambientSources];
        const { sound } = await Audio.Sound.createAsync(source, { isLooping: true, volume: 0.01 } as never);
        if (!mounted) {
          await sound.unloadAsync();
          return;
        }

        ambientRef.current = sound;
        await sound.playAsync();
        setTimeout(() => {
          void sound.setVolumeAsync(0.35).catch(() => undefined);
        }, 1200);
      } catch {
        ambientRef.current = null;
      }
    }

    void loadAmbient();

    const appStateSubscription = AppState.addEventListener("change", (state) => {
      const sound = ambientRef.current;
      if (!sound) {
        return;
      }

      if (state === "active") {
        void sound.playAsync().catch(() => undefined);
      } else {
        void sound.pauseAsync().catch(() => undefined);
      }
    });

    return () => {
      mounted = false;
      appStateSubscription.remove();
      const sound = ambientRef.current;
      ambientRef.current = null;
      void sound?.unloadAsync().catch(() => undefined);
    };
  }, [chapter]);

  React.useEffect(() => {
    setStarted(false);
    setStageIndex(0);
    setCompanionsRaised(false);
    setCompletionPending(false);
    setWitnessedNote(null);
  }, [ritual?.id]);

  const centerpieceStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + pulse.value * 0.28,
    transform: [{ scale: 0.96 + pulse.value * 0.08 }, { rotate: `${pulse.value * 4 - 2}deg` }],
  }));

  const innerWashStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + pulse.value * 0.22,
    transform: [{ scale: 0.82 + pulse.value * 0.34 }],
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheet.value }],
  }));

  if (!chapter || !ritual) {
    return (
      <View style={{ alignItems: "center", backgroundColor: meadowTheme.colors.linen, flex: 1, justifyContent: "center", padding: 24 }}>
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 28, lineHeight: 34, textAlign: "center" }}>
          This ritual path is not open.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={{ marginTop: 18, padding: 12 }}>
          <Text selectable={false} style={{ color: meadowTheme.colors.sageDeep, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 24 }}>
            {"<- Back"}
          </Text>
        </Pressable>
      </View>
    );
  }

  const activeChapter = chapter;
  const activeRitual = ritual;
  const finalStage = stageIndex === activeRitual.stages.length - 1;
  const ambientCompanions = getAmbientCompanionsForChapter(activeChapter.slug, totalRitualsWitnessed);

  async function playInteractionSound() {
    if (!activeRitual.interactionSound) {
      return;
    }

    try {
      const source = interactionSources[activeRitual.interactionSound as keyof typeof interactionSources];
      const { sound } = await Audio.Sound.createAsync(source, { isLooping: false, volume: 0.7 } as never);
      await sound.playAsync();
      setTimeout(() => {
        void sound.unloadAsync().catch(() => undefined);
      }, 1600);
    } catch {
      // Audio placeholders are intentionally silent until final files arrive.
    }
  }

  async function completeWithWitness() {
    if (completionPending) {
      return;
    }

    setCompletionPending(true);
    setStarted(false);
    setCompanionsRaised(true);

    const chapterCompanions = getCompanionsForChapter(activeChapter.slug);
    const totalAfterThisRitual = totalRitualsWitnessed + 1;
    const chickadee = getCompanionById("chickadee");
    const primaryChapterCompanion =
      chapterCompanions.find((companion) => companion.presenceThreshold === 0) ??
      chapterCompanions.find((companion) => (companionState[companion.id]?.ritualsWitnessed ?? 0) + 1 >= companion.presenceThreshold) ??
      chapterCompanions[0];
    const noteCompanion = totalAfterThisRitual % 5 === 0 && chickadee ? chickadee : primaryChapterCompanion;
    const witnessIds = [...chapterCompanions.map((companion) => companion.id), ...(totalAfterThisRitual % 5 === 0 && chickadee ? [chickadee.id] : [])];
    const note = await recordRitualWitnessed(witnessIds, noteCompanion.id);

    setTimeout(() => {
      if (note) {
        setWitnessedNote(note);
      } else {
        router.replace(`/chapters/${activeChapter.slug}` as never);
      }
      setCompletionPending(false);
    }, 800);
  }

  function advance() {
    if (completionPending || witnessedNote) {
      return;
    }

    if (!started) {
      setStarted(true);
      void playInteractionSound();
      return;
    }

    if (finalStage) {
      void completeWithWitness();
      return;
    }

    setStageIndex((current) => Math.min(current + 1, activeRitual.stages.length - 1));
  }

  return (
    <View style={{ backgroundColor: meadowTheme.colors.ink, flex: 1, height, overflow: "hidden", width }}>
      <Image
        accessibilityLabel={`${activeRitual.name} ritual environment`}
        accessibilityRole="image"
        contentFit="cover"
        source={activeRitual.backgroundImage}
        style={{ height, width }}
      />
      <View style={{ backgroundColor: companionsRaised ? "rgba(0,0,0,0.48)" : "rgba(0,0,0,0.28)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }} />

      {ambientCompanions.map((companion) => (
        <CompanionOverlay
          key={companion.id}
          bottomOffset={started ? 330 + insets.bottom : 56 + insets.bottom}
          companion={companion}
          opacity={getCompanionPresenceOpacity(companion, companionState, totalRitualsWitnessed)}
          raised={companionsRaised}
        />
      ))}

      <Pressable
        accessibilityLabel="Back"
        accessibilityRole="button"
        hitSlop={12}
        onPress={() => router.back()}
        style={{ left: 20, position: "absolute", top: insets.top + 20, zIndex: 4 }}
      >
        <Text selectable={false} style={{ color: "#FFFFFF", fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
          {"<- Back"}
        </Text>
      </Pressable>

      <View style={{ alignItems: "center", left: 24, position: "absolute", right: 24, top: Math.max(insets.top + 88, height * 0.27) }}>
        <Text selectable={false} style={{ color: "#FFFFFF", fontFamily: meadowTheme.fonts.header, fontSize: 36, lineHeight: 40, textAlign: "center" }}>
          {activeRitual.symbol}
        </Text>
        <Text selectable style={{ color: "#FFFFFF", fontFamily: meadowTheme.fonts.header, fontSize: 28, lineHeight: 34, textAlign: "center" }}>
          {activeRitual.name}
        </Text>
        <View style={{ backgroundColor: "rgba(255,255,255,0.5)", height: 1, marginTop: 10, width: 80 }} />
      </View>

      <Pressable
        accessibilityHint={started ? "Advances the ritual." : "Begins the ritual."}
        accessibilityLabel={started ? `Continue ${activeRitual.name}` : `Begin ${activeRitual.name}`}
        accessibilityRole="button"
        onPress={advance}
        style={{ alignItems: "center", height: 164, justifyContent: "center", left: 0, marginTop: -82, position: "absolute", right: 0, top: height * 0.5 }}
      >
        <Animated.View
          style={[
            {
              alignItems: "center",
              borderColor: "rgba(255,255,255,0.58)",
              borderRadius: 68,
              borderWidth: 1,
              height: 136,
              justifyContent: "center",
              width: 136,
            },
            centerpieceStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                backgroundColor: "rgba(255,255,255,0.22)",
                borderRadius: 52,
                height: 104,
                position: "absolute",
                width: 104,
              },
              innerWashStyle,
            ]}
          />
          <Text selectable={false} style={{ color: "#FFFFFF", fontFamily: meadowTheme.fonts.header, fontSize: 54, lineHeight: 62 }}>
            {activeRitual.symbol}
          </Text>
        </Animated.View>
      </Pressable>

      <Animated.View
        style={[
          {
            backgroundColor: "#F5F1EB",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            bottom: 0,
            height: 320 + insets.bottom,
            left: 0,
            paddingBottom: Math.max(insets.bottom, 18),
            paddingHorizontal: 24,
            paddingTop: 24,
            position: "absolute",
            right: 0,
          },
          sheetStyle,
        ]}
      >
        <View style={{ alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 28 }}>
          {activeRitual.stages.map((stage, index) => (
            <View
              key={stage}
              style={{
                backgroundColor: index <= stageIndex ? activeChapter.accentColor : "#C8BFA8",
                borderRadius: 4,
                height: 8,
                opacity: index <= stageIndex ? 1 : 0.55,
                width: 8,
              }}
            />
          ))}
        </View>
        <Text selectable style={{ color: "#3D4A2E", fontFamily: meadowTheme.fonts.header, fontSize: 24, lineHeight: 34, minHeight: 116, textAlign: "center" }}>
          {activeRitual.stages[stageIndex]}
        </Text>
        <Pressable
          accessibilityLabel={finalStage ? "Complete ritual" : "Continue ritual"}
          accessibilityRole="button"
          onPress={advance}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: activeChapter.accentColor,
            borderRadius: 12,
            height: 48,
            justifyContent: "center",
            marginTop: 28,
            opacity: pressed ? 0.84 : 1,
            width: "100%",
          })}
        >
          <Text selectable={false} style={{ color: "#FFFFFF", fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 22 }}>
            {finalStage ? "Complete \u2713" : "Continue ->"}
          </Text>
        </Pressable>
      </Animated.View>

      {witnessedNote ? (
        <WitnessedNoteCard
          chapterName={activeChapter.chapterName}
          note={witnessedNote}
          onReturn={() => router.replace(`/chapters/${activeChapter.slug}` as never)}
        />
      ) : null}
    </View>
  );
}
