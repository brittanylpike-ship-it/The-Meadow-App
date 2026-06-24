import { CompanionOverlay } from "@/components/CompanionOverlay";
import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import type { Companion } from "@/data/companions";
import React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type CottageHeroProps = {
  companion?: Companion | null;
  companionOpacity?: number;
  season: "winter" | "storm" | "bloom";
  sceneId: "home";
};

const cottageHero = require("@/assets/illustrations/home-hero.png");

export function CottageHero({ companion, companionOpacity = 0, season }: CottageHeroProps) {
  const glowLeft = useSharedValue(0);
  const glowRight = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const companionFade = useSharedValue(0);
  const flashTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    glowLeft.value = withDelay(
      0,
      withRepeat(
        withSequence(
          withTiming(0.18, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.06, { duration: 1600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    glowRight.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(0.15, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.04, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [glowLeft, glowRight]);

  React.useEffect(() => {
    companionFade.value = withDelay(900, withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) }));
  }, [companionFade, companion?.id]);

  React.useEffect(() => {
    if (season !== "storm") {
      return;
    }

    const scheduleFlash = () => {
      const delay = 8000 + Math.random() * 6000;
      flashTimer.current = setTimeout(() => {
        flashOpacity.value = withSequence(
          withTiming(0.07, { duration: 60 }),
          withTiming(0, { duration: 80 }),
          withTiming(0.04, { duration: 40 }),
          withTiming(0, { duration: 120 })
        );
        scheduleFlash();
      }, delay);
    };

    scheduleFlash();
    return () => {
      if (flashTimer.current) {
        clearTimeout(flashTimer.current);
      }
    };
  }, [flashOpacity, season]);

  const leftGlowStyle = useAnimatedStyle(() => ({ opacity: glowLeft.value }));
  const rightGlowStyle = useAnimatedStyle(() => ({ opacity: glowRight.value }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const companionFadeStyle = useAnimatedStyle(() => ({ opacity: companionFade.value }));

  return (
    <View style={{ borderRadius: meadowTheme.radius.panel, borderCurve: "continuous", height: 220, overflow: "hidden", width: "100%" }}>
      <Image
        accessibilityLabel="The Meadow cottage and garden path"
        accessibilityRole="image"
        contentFit="cover"
        contentPosition="top center"
        source={cottageHero}
        style={{ backgroundColor: meadowTheme.colors.linenDeep, height: 220, width: "100%" }}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            backgroundColor: meadowTheme.colors.clay,
            borderRadius: 3,
            height: 12,
            left: "22%",
            position: "absolute",
            top: "52%",
            width: 18,
          },
          leftGlowStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            backgroundColor: meadowTheme.colors.clay,
            borderRadius: 3,
            height: 10,
            left: "31%",
            position: "absolute",
            top: "48%",
            width: 14,
          },
          rightGlowStyle,
        ]}
      />
      <SeasonalWash season={season} />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            backgroundColor: meadowTheme.colors.linen,
            bottom: 0,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
          },
          flashStyle,
        ]}
      />
      {companion && companionOpacity > 0 ? (
        <Animated.View pointerEvents="none" style={[{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }, companionFadeStyle]}>
          <CompanionOverlay bottomOffset={12} companion={companion} opacity={companionOpacity} speedMultiplier={0.5} />
        </Animated.View>
      ) : null}
    </View>
  );
}

function SeasonalWash({ season }: { season: CottageHeroProps["season"] }) {
  if (season === "storm") {
    return <View pointerEvents="none" style={{ backgroundColor: meadowTheme.colors.winterBlue, bottom: 0, left: 0, opacity: 0.08, position: "absolute", right: 0, top: 0 }} />;
  }

  if (season === "bloom") {
    return <View pointerEvents="none" style={{ backgroundColor: meadowTheme.colors.clay, bottom: 0, left: 0, opacity: 0.05, position: "absolute", right: 0, top: 0 }} />;
  }

  return <View pointerEvents="none" style={{ backgroundColor: meadowTheme.colors.fog, bottom: 0, left: 0, opacity: 0.06, position: "absolute", right: 0, top: 0 }} />;
}
