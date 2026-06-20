import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import type { Companion } from "@/data/companions";
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { useWindowDimensions } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

type CompanionOverlayProps = {
  companion: Companion;
  opacity: number;
  bottomOffset: number;
  raised?: boolean;
  speedMultiplier?: number;
};

export function CompanionOverlay({ bottomOffset, companion, opacity, raised, speedMultiplier = 1 }: CompanionOverlayProps) {
  const { width } = useWindowDimensions();
  const drift = useSharedValue(0);
  const size = companion.id === "crow" || companion.id === "owl" ? 72 : 66;

  React.useEffect(() => {
    const duration = (companion.id === "snail" ? 6200 : 2200) / speedMultiplier;
    drift.value = withRepeat(
      withSequence(
        withDelay(220, withTiming(1, { duration, easing: Easing.inOut(Easing.ease) })),
        withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [companion.id, drift, speedMultiplier]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = companion.id === "bumblebee" ? drift.value * -12 : companion.id === "chickadee" ? drift.value * 5 : drift.value * -4;
    const translateX = companion.id === "snail" ? drift.value * 24 : companion.id === "field-mouse" ? drift.value * 8 : companion.id === "moth" ? drift.value * 10 - 5 : 0;
    const rotate = companion.id === "chickadee" ? `${drift.value * 8 - 4}deg` : companion.id === "moth" ? `${drift.value * 10 - 5}deg` : "0deg";

    return {
      opacity: raised ? Math.min(opacity + 0.18, 0.95) : opacity,
      transform: [{ translateX }, { translateY }, { rotate }],
    };
  });

  if (opacity <= 0) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          zIndex: raised ? 7 : 3,
        },
        getPositionStyle(companion, width, bottomOffset),
        animatedStyle,
      ]}
    >
      <Image
        source={companion.imageAsset}
        contentFit="contain"
        style={{
          height: size,
          shadowColor: meadowTheme.colors.ink,
          shadowOffset: { height: 2, width: 0 },
          shadowOpacity: 0.18,
          shadowRadius: 6,
          width: size,
        }}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </Animated.View>
  );
}

function getPositionStyle(companion: Companion, width: number, bottomOffset: number): StyleProp<ViewStyle> {
  if (companion.id === "chickadee") {
    return { right: 32, top: 90 };
  }

  if (companion.id === "crow" || companion.id === "owl") {
    return { right: 26, top: 132 };
  }

  if (companion.id === "moth") {
    return { left: Math.max(32, width * 0.18), bottom: bottomOffset + 74 };
  }

  if (companion.id === "snail") {
    return { left: Math.max(92, width * 0.34), bottom: bottomOffset + 24 };
  }

  if (companion.id === "bumblebee") {
    return { right: 38, bottom: bottomOffset + 88 };
  }

  if (companion.id === "hedgehog" || companion.id === "field-mouse") {
    return { right: 28, bottom: bottomOffset + 20 };
  }

  return { left: 24, bottom: bottomOffset + 20 };
}
