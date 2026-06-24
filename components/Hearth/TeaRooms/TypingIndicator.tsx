import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text } from "react-native";

export function TypingIndicator({ name }: { name?: string }) {
  if (!name) {
    return null;
  }

  return (
    <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, fontStyle: "italic", lineHeight: 18 }}>
      {name} is writing...
    </Text>
  );
}
