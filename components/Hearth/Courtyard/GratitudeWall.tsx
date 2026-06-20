import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

export function GratitudeWall({ notes = ["Grateful for this safe space."] }: { notes?: string[] }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 8, padding: 12 }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 25, textAlign: "center" }}>
        Gratitude Wall
      </Text>
      {notes.slice(0, 3).map((note) => (
        <Text key={note} selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18, textAlign: "center" }}>
          {note}
        </Text>
      ))}
    </View>
  );
}
