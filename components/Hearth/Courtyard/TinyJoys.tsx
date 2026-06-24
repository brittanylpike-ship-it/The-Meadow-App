import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

export function TinyJoys({ joy = "I took one steady breath." }: { joy?: string }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 6, padding: 12 }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 25, textAlign: "center" }}>
        Tiny Joys
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
        {joy}
      </Text>
    </View>
  );
}
