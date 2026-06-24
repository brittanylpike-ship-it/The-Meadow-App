import React from "react";
import { Animated, Easing } from "react-native";

type AnimatedQuillProps = {
  targetX: number;
  targetY: number;
  isTyping: boolean;
  onEnterPressed: boolean;
  containerWidth: number;
  containerHeight: number;
};

const quillImage = require("@/assets/illustrations/quill-pen.png");

export function AnimatedQuill({
  targetX,
  targetY,
  isTyping,
  onEnterPressed,
  containerWidth,
  containerHeight,
}: AnimatedQuillProps) {
  const quillX = React.useRef(new Animated.Value(targetX)).current;
  const quillY = React.useRef(new Animated.Value(targetY)).current;
  const rotation = React.useRef(new Animated.Value(0)).current;
  const bobY = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;

  const inkwellX = Math.max(16, containerWidth - 74);
  const inkwellY = Math.max(20, containerHeight - 98);

  React.useEffect(() => {
    if (onEnterPressed) {
      return;
    }

    Animated.parallel([
      Animated.spring(quillX, {
        toValue: targetX,
        tension: 120,
        friction: 14,
        useNativeDriver: true,
      }),
      Animated.spring(quillY, {
        toValue: targetY,
        tension: 120,
        friction: 14,
        useNativeDriver: true,
      }),
    ]).start();
  }, [onEnterPressed, quillX, quillY, targetX, targetY]);

  React.useEffect(() => {
    if (!isTyping) {
      Animated.parallel([
        Animated.spring(bobY, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
        Animated.spring(rotation, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      ]).start();
      return;
    }

    const writingMotion = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bobY, {
            toValue: -3,
            duration: 120,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: 4,
            duration: 120,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bobY, {
            toValue: 0,
            duration: 120,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: -4,
            duration: 120,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    writingMotion.start();

    return () => {
      writingMotion.stop();
      bobY.stopAnimation();
      rotation.stopAnimation();
    };
  }, [bobY, isTyping, rotation]);

  React.useEffect(() => {
    if (!onEnterPressed) {
      return;
    }

    Animated.sequence([
      Animated.parallel([
        Animated.timing(quillX, {
          toValue: inkwellX,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(quillY, {
          toValue: inkwellY,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 15,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scale, { toValue: 0.85, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.delay(80),
      Animated.parallel([
        Animated.spring(quillX, { toValue: targetX, tension: 100, friction: 14, useNativeDriver: true }),
        Animated.spring(quillY, { toValue: targetY, tension: 100, friction: 14, useNativeDriver: true }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [inkwellX, inkwellY, onEnterPressed, quillX, quillY, rotation, scale, targetX, targetY]);

  const rotate = rotation.interpolate({
    inputRange: [-15, 15],
    outputRange: ["-15deg", "15deg"],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        left: 0,
        position: "absolute",
        top: 0,
        transform: [
          { translateX: quillX },
          { translateY: Animated.add(quillY, bobY) },
          { rotate },
          { scale },
        ],
        zIndex: 10,
      }}
    >
      <Animated.Image
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no"
        source={quillImage}
        style={{ height: 96, width: 48 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
