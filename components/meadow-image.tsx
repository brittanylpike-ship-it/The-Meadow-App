import { Image as ExpoImage, type ImageProps } from "expo-image";
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

import { meadowTheme } from "@/constants/meadow-theme";

export type { ImageContentPosition } from "expo-image";

export function MeadowImage({ onError, style, ...props }: ImageProps) {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return <View style={[{ backgroundColor: meadowTheme.colors.linenDeep }, style as StyleProp<ViewStyle>]} />;
  }

  return (
    <ExpoImage
      {...props}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      style={style}
    />
  );
}
