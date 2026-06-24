import { MeadowImage as Image } from "@/components/meadow-image";
import React from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";

const inkwellImage = require("@/assets/images/journal/inkwell.png");
const quillImage = require("@/assets/images/journal/quill-pen.png");
const sprigImage = require("@/assets/images/journal/vine-divider.png");

type InkwellAnimationProps = {
  writingSignal: number;
  saveSignal: number;
};

export function InkwellAnimation({ saveSignal, writingSignal }: InkwellAnimationProps) {
  const dip = useSharedValue(0);
  const save = useSharedValue(0);
  const breath = useSharedValue(1);

  React.useEffect(() => {
    breath.value = withSequence(withTiming(1.01, { duration: 2000, easing: Easing.inOut(Easing.ease) }), withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }));
  }, [breath, writingSignal]);

  React.useEffect(() => {
    if (writingSignal <= 0) {
      return;
    }

    dip.value = withSequence(withTiming(1, { duration: 300 }), withDelay(150, withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) })));
  }, [dip, writingSignal]);

  React.useEffect(() => {
    if (saveSignal <= 0) {
      return;
    }

    save.value = withSequence(withTiming(1, { duration: 220 }), withTiming(0, { duration: 500 }));
  }, [save, saveSignal]);

  const quillStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dip.value * 14 }, { rotate: `${-30 - save.value * 20}deg` }, { scaleY: breath.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: save.value,
    transform: [{ scale: 1 + save.value * 0.16 }],
  }));

  const sprigStyle = useAnimatedStyle(() => ({
    opacity: save.value,
  }));

  return (
    <View style={{ height: 70, width: 84 }}>
      <Animated.View style={[{ backgroundColor: "rgba(45,107,107,0.16)", borderRadius: 28, height: 56, left: 18, position: "absolute", top: 12, width: 56 }, glowStyle]} />
      <Image source={inkwellImage} contentFit="contain" style={{ bottom: 0, height: 52, position: "absolute", right: 0, width: 52 }} />
      <Animated.View style={[{ height: 72, left: 12, position: "absolute", top: -10, width: 34 }, quillStyle]}>
        <Image source={quillImage} contentFit="contain" style={{ height: 72, width: 34 }} />
      </Animated.View>
      <Animated.View style={[{ bottom: 0, left: 0, position: "absolute" }, sprigStyle]}>
        <Image source={sprigImage} contentFit="contain" style={{ height: 18, width: 56 }} />
      </Animated.View>
    </View>
  );
}
