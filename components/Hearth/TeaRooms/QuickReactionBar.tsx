import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

const reactions = ["Pour a Cup", "Take a Breath", "Send Care", "Thank You", "Pass the Honey"] as const;

export function QuickReactionBar({ onReact }: { onReact?: (reaction: string) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {reactions.map((reaction) => (
        <PressCard
          key={reaction}
          accessibilityLabel={reaction}
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => onReact?.(reaction)}
          style={{
            backgroundColor: meadowTheme.colors.panel,
            borderColor: meadowTheme.colors.line,
            borderRadius: meadowTheme.radius.control,
            borderWidth: 1,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text selectable={false} style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
            {reaction}
          </Text>
        </PressCard>
      ))}
    </View>
  );
}
