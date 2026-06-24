import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

export function KindnessJar({ today = 0 }: { today?: number }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 6, padding: 12 }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 25, textAlign: "center" }}>
        Kindness Jar
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
        Acts of kindness fill this jar. Today: {today}
      </Text>
    </View>
  );
}
