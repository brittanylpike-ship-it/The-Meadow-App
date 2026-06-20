import React from "react";
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

type PressCardProps = Omit<PressableProps, "style"> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PressCard({ children, disabled, onPress, style, ...props }: PressCardProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const onPressIn = React.useCallback(() => {
    if (!disabled) {
      Animated.spring(scale, { speed: 50, toValue: 0.97, useNativeDriver: true }).start();
    }
  }, [disabled, scale]);

  const onPressOut = React.useCallback(() => {
    Animated.spring(scale, { speed: 50, toValue: 1, useNativeDriver: true }).start();
  }, [scale]);

  return (
    <Pressable disabled={disabled} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} {...props}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
