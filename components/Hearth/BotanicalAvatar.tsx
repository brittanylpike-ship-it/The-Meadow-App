import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { View } from "react-native";

const avatarAssets = {
  wildflower: require("@/assets/images/hearth/avatars/wildflower.png"),
  rose: require("@/assets/images/hearth/avatars/rose.png"),
  lavender: require("@/assets/images/hearth/avatars/lavender.png"),
  daisy: require("@/assets/images/hearth/avatars/daisy.png"),
  fern: require("@/assets/images/hearth/avatars/fern.png"),
  foxglove: require("@/assets/images/hearth/avatars/foxglove.png"),
  thistle: require("@/assets/images/hearth/avatars/thistle.png"),
  clover: require("@/assets/images/hearth/avatars/clover.png"),
} as const;

const avatarKeys = Object.keys(avatarAssets) as BotanicalAvatarSeed[];
export type BotanicalAvatarSeed = keyof typeof avatarAssets;

export function botanicalAvatarSeed(seed?: string | null): BotanicalAvatarSeed {
  if (!seed) {
    return "wildflower";
  }

  const index = Math.abs([...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % avatarKeys.length;
  return avatarKeys[index];
}

export function BotanicalAvatar({ seed, size = 40 }: { seed?: string | null; size?: number }) {
  const avatarSeed = botanicalAvatarSeed(seed);

  return (
    <View
      style={{
        backgroundColor: meadowTheme.colors.panelDeep,
        borderColor: meadowTheme.colors.line,
        borderRadius: size / 2,
        borderWidth: 1,
        height: size,
        overflow: "hidden",
        width: size,
      }}
    >
      <Image
        accessibilityLabel={`${avatarSeed} botanical avatar`}
        contentFit="cover"
        source={avatarAssets[avatarSeed]}
        style={{ height: size, width: size }}
      />
    </View>
  );
}
