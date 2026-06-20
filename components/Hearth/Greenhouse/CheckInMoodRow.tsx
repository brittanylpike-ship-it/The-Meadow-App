import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

const moods = ["Peaceful", "Hopeful", "Tired", "Heavy"] as const;

export function CheckInMoodRow({ onCheckIn }: { onCheckIn?: (mood: string) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {moods.map((mood) => (
        <PressCard
          key={mood}
          accessibilityLabel={mood}
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => onCheckIn?.(mood)}
          style={{
            alignItems: "center",
            backgroundColor: meadowTheme.colors.panel,
            borderColor: meadowTheme.colors.line,
            borderRadius: meadowTheme.radius.panel,
            borderWidth: 1,
            flex: 1,
            minWidth: 74,
            padding: 10,
          }}
        >
          <Text selectable={false} style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
            {mood}
          </Text>
        </PressCard>
      ))}
    </View>
  );
}
