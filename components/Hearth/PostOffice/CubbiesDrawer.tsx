import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export const cubbies = [
  "All Letters",
  "Introductions",
  "Recovery & Healing",
  "Anxiety & Overwhelm",
  "Loneliness",
  "Self Growth",
  "Milestones",
  "Relationships",
  "Setbacks & Support",
  "Creativity & Joy",
  "Resources",
  "Off Topic",
] as const;

export function CubbiesDrawer({ active, onSelect }: { active: string; onSelect: (cubby: string) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 20, textAlign: "center" }}>
        Browse Cubbies
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {cubbies.map((cubby) => {
          const selected = active === cubby;
          return (
            <PressCard
              key={cubby}
              accessibilityLabel={cubby}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              hitSlop={6}
              onPress={() => onSelect(cubby)}
              style={{
                backgroundColor: selected ? meadowTheme.colors.sage : meadowTheme.colors.panel,
                borderColor: meadowTheme.colors.sage,
                borderRadius: meadowTheme.radius.control,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text selectable={false} style={{ color: selected ? meadowTheme.colors.linen : meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
                {cubby}
              </Text>
            </PressCard>
          );
        })}
      </ScrollView>
    </View>
  );
}
