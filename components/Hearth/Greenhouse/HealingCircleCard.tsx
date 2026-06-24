import { MeadowImage as Image } from "@/components/meadow-image";
import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import type { HealingCircle } from "@/hooks/useHealingCircles";
import React from "react";
import { Text, View } from "react-native";

export function HealingCircleCard({ circle, onReserve, reserved }: { circle: HealingCircle; onReserve?: () => void; reserved?: boolean }) {
  const seatsLeft = Math.max(circle.max_seats - circle.current_seats, 0);
  return (
    <PressCard
      accessibilityLabel={circle.title}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onReserve}
      style={{
        backgroundColor: meadowTheme.colors.panel,
        borderColor: meadowTheme.colors.line,
        borderRadius: meadowTheme.radius.panel,
        borderWidth: 1,
        flexDirection: "row",
        gap: 12,
        padding: 12,
      }}
    >
      <Image
        accessibilityLabel={`${circle.title} circle illustration`}
        contentFit="cover"
        source={require("@/assets/images/hearth/circles/anxiety-overwhelm.png")}
        style={{ borderRadius: meadowTheme.radius.panel, height: 72, width: 72 }}
      />
      <View style={{ flex: 1, gap: 4 }}>
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 19, lineHeight: 24 }}>
          {circle.title}
        </Text>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, fontStyle: "italic", lineHeight: 20 }}>
          {circle.description}
        </Text>
        <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
          {reserved ? "Reserved" : `${seatsLeft} seats open`}
        </Text>
      </View>
    </PressCard>
  );
}
