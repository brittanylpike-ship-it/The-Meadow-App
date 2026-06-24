import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

export function GardenProgressBar({ value = 0.78 }: { value?: number }) {
  const fill = Math.max(0, Math.min(1, value));
  return (
    <View style={{ gap: 8 }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 23, textAlign: "center" }}>
        Garden Progress
      </Text>
      <View style={{ backgroundColor: meadowTheme.colors.linenDeep, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.control, borderWidth: 1, flexDirection: "row", height: 12, overflow: "hidden" }}>
        <View style={{ backgroundColor: meadowTheme.colors.sage, flex: fill }} />
        <View style={{ flex: 1 - fill }} />
      </View>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18, textAlign: "center" }}>
        Together we bloom.
      </Text>
    </View>
  );
}
