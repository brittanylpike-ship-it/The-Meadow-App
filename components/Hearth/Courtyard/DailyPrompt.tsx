import { MeadowButton } from "@/components/meadow-button";
import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

export function DailyPrompt({ onAnswer, prompt = "What is one small thing that brought you peace today?" }: { onAnswer?: () => void; prompt?: string }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 10, padding: 12 }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 25, textAlign: "center" }}>
        Daily Prompt
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
        {prompt}
      </Text>
      <MeadowButton label="Share Your Answer" onPress={onAnswer} />
    </View>
  );
}
