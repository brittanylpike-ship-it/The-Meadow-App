import React from "react";
import { Animated, View, ViewStyle } from "react-native";

import { meadowTheme } from "@/constants/meadow-theme";

export function SkeletonBox({ height, style, width }: { width: number | `${number}%` | "100%" | "auto"; height: number; style?: ViewStyle }) {
  const opacity = React.useRef(new Animated.Value(0.42)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { duration: 800, toValue: 0.86, useNativeDriver: true }),
        Animated.timing(opacity, { duration: 800, toValue: 0.42, useNativeDriver: true }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        {
          backgroundColor: meadowTheme.colors.fog,
          borderRadius: meadowTheme.radius.panel,
          height,
          opacity,
          width,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ height }: { height: number }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: 12, borderWidth: 1, gap: 10, padding: 14, width: "100%" }}>
      <SkeletonBox height={height} width="100%" />
    </View>
  );
}
