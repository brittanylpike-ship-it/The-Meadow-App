import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

export function SoundscapeBar({ name = "Rain on the Garden" }: { name?: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: meadowTheme.colors.panel,
        borderColor: meadowTheme.colors.line,
        borderRadius: meadowTheme.radius.panel,
        borderWidth: 1,
        flexDirection: "row",
        gap: 10,
        padding: 12,
      }}
    >
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
        Soundscape
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.ink, flex: 1, fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 23 }}>
        {name}
      </Text>
    </View>
  );
}
