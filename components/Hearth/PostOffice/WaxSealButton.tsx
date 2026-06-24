import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

export function WaxSealButton({ count, sealed, onPress }: { count: number; sealed?: boolean; onPress?: () => void }) {
  return (
    <PressCard
      accessibilityLabel={sealed ? "Seal already left" : "Leave a seal"}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: sealed ? meadowTheme.colors.clay : meadowTheme.colors.panel,
        borderColor: meadowTheme.colors.clay,
        borderRadius: 22,
        borderStyle: sealed ? "solid" : "dashed",
        borderWidth: 1,
        height: 44,
        justifyContent: "center",
        width: 44,
      }}
    >
      <Text selectable={false} style={{ color: sealed ? meadowTheme.colors.linen : meadowTheme.colors.clay, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 16 }}>
        {count}
      </Text>
    </PressCard>
  );
}

export function WaxSealLegend() {
  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      <WaxSealButton count={0} />
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, fontStyle: "italic", lineHeight: 18, textAlign: "center" }}>
        Seals are a quiet way to say this letter reached you.
      </Text>
    </View>
  );
}
