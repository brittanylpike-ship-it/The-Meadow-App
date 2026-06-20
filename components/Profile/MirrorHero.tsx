import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const mirrorHero = require("@/assets/images/profile/mirror-hero.png");

export function MirrorHero() {
  const shimmer = useSharedValue(0);
  const driftX = useSharedValue(0);
  const driftScale = useSharedValue(1);
  const frameGlow = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.08, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.02, { duration: 2800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    driftX.value = withDelay(500, withRepeat(withTiming(2, { duration: 4000, easing: Easing.inOut(Easing.sin) }), -1, true));
    driftScale.value = withDelay(500, withRepeat(withTiming(1.004, { duration: 4000, easing: Easing.inOut(Easing.sin) }), -1, true));
    frameGlow.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [driftScale, driftX, frameGlow, shimmer]);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: driftX.value }, { scale: driftScale.value }],
  }));
  const shimmerStyle = useAnimatedStyle(() => ({ opacity: shimmer.value }));
  const frameStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(frameGlow.value, [0, 1], [meadowTheme.colors.clay, meadowTheme.colors.line]),
  }));

  return (
    <View style={{ backgroundColor: meadowTheme.colors.linen, height: 200, overflow: "hidden", width: "100%" }}>
      <Animated.View style={[{ height: 200, width: "100%" }, imageStyle]}>
        <Image
          accessibilityLabel="An illustrated oval mirror surrounded by Meadow vines"
          accessibilityRole="image"
          contentFit="cover"
          source={mirrorHero}
          style={{ backgroundColor: meadowTheme.colors.linenDeep, height: 200, width: "100%" }}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            backgroundColor: meadowTheme.colors.linenDeep,
            borderRadius: 15,
            height: 80,
            left: "46%",
            position: "absolute",
            top: "20%",
            transform: [{ rotateZ: "-30deg" }],
            width: 30,
          },
          shimmerStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            borderRadius: 999,
            borderWidth: 1.5,
            height: 122,
            left: "42%",
            position: "absolute",
            top: 46,
            width: 86,
          },
          frameStyle,
        ]}
      />
      <View pointerEvents="none" style={{ backgroundColor: meadowTheme.colors.linen, bottom: 0, height: 78, left: 0, opacity: 0.66, position: "absolute", right: 0 }} />
    </View>
  );
}
