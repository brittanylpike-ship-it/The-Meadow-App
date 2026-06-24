import React from "react";
import { Animated, Text } from "react-native";

import { meadowTheme } from "@/constants/meadow-theme";

export function SuccessFlash({ message, onDone }: { message: string | null; onDone?: () => void }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    if (!message) {
      return;
    }

    opacity.setValue(0);
    translateY.setValue(20);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { duration: 300, toValue: 1, useNativeDriver: true }),
        Animated.timing(translateY, { duration: 300, toValue: 0, useNativeDriver: true }),
      ]),
      Animated.delay(1500),
      Animated.timing(opacity, { duration: 300, toValue: 0, useNativeDriver: true }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        onDone?.();
      }
    });

    return () => animation.stop();
  }, [message, onDone, opacity, translateY]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={{
        alignSelf: "center",
        backgroundColor: meadowTheme.colors.sage,
        borderRadius: meadowTheme.radius.control,
        bottom: 90,
        opacity,
        paddingHorizontal: 24,
        paddingVertical: 10,
        position: "absolute",
        transform: [{ translateY }],
        zIndex: 20,
      }}
    >
      <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
        {message}
      </Text>
    </Animated.View>
  );
}
