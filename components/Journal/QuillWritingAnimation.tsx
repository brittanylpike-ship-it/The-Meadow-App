import { MeadowImage as Image } from "@/components/meadow-image";
import React from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const quillImage = require("@/assets/images/journal/quill-pen.png");

type QuillWritingAnimationProps = {
  loading?: boolean;
};

export function QuillWritingAnimation({ loading = false }: QuillWritingAnimationProps) {
  const progress = useSharedValue(loading ? 0 : 1);
  const pressure = useSharedValue(0);

  React.useEffect(() => {
    if (!loading) {
      progress.value = withTiming(1, { duration: 200 });
      pressure.value = withTiming(0, { duration: 200 });
      return;
    }

    progress.value = withRepeat(withSequence(withTiming(1, { duration: 1800, easing: Easing.linear }), withTiming(0, { duration: 220 })), -1, false);
    pressure.value = withRepeat(withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 200 })), -1, true);
  }, [loading, pressure, progress]);

  const lineStyle = useAnimatedStyle(() => ({
    width: 12 + progress.value * 92,
  }));

  const quillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 92 }, { translateY: pressure.value * 2 }, { rotate: "-25deg" }],
  }));

  const dropStyle = useAnimatedStyle(() => ({
    opacity: loading && progress.value > 0.94 ? 1 - (progress.value - 0.94) / 0.06 : 0,
    transform: [{ scaleY: loading && progress.value > 0.94 ? 1 - (progress.value - 0.94) / 0.06 : 1 }],
  }));

  return (
    <View style={{ height: 40, justifyContent: "center", width: 120 }}>
      <Animated.View style={[{ backgroundColor: "#2D6B6B", borderRadius: 2, height: 2, left: 10, position: "absolute", top: 30 }, lineStyle]} />
      <Animated.View style={[{ height: 50, left: 0, position: "absolute", top: -2, width: 32 }, quillStyle]}>
        <Image source={quillImage} contentFit="contain" style={{ height: 50, width: 32 }} />
      </Animated.View>
      <Animated.View style={[{ backgroundColor: "#2D6B6B", borderRadius: 3, height: 6, left: 108, position: "absolute", top: 27, width: 4 }, dropStyle]} />
    </View>
  );
}
