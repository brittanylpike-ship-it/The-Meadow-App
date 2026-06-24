import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text } from "react-native";

export function WaterButton({ onPress }: { onPress?: () => void }) {
  return (
    <PressCard
      accessibilityLabel="Water the Garden"
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: meadowTheme.colors.sage,
        borderRadius: meadowTheme.radius.control,
        minHeight: 44,
        justifyContent: "center",
        paddingHorizontal: 18,
      }}
    >
      <Text selectable={false} style={{ color: meadowTheme.colors.linen, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 21 }}>
        Water Now
      </Text>
    </PressCard>
  );
}
