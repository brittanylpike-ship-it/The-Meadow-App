import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import { teaTables } from "@/data/teaTables";
import React from "react";
import { Text, View } from "react-native";

export function TeaTableList({ activeSlug, onSelect }: { activeSlug: string; onSelect: (slug: string) => void }) {
  return (
    <View style={{ gap: 8 }}>
      {teaTables.map((table) => {
        const active = table.slug === activeSlug;
        return (
          <PressCard
            key={table.slug}
            accessibilityLabel={table.name}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            hitSlop={6}
            onPress={() => onSelect(table.slug)}
            style={{
              backgroundColor: active ? meadowTheme.colors.sage : meadowTheme.colors.panel,
              borderColor: meadowTheme.colors.line,
              borderRadius: meadowTheme.radius.panel,
              borderWidth: 1,
              gap: 2,
              padding: 12,
            }}
          >
            <Text selectable={false} style={{ color: active ? meadowTheme.colors.linen : meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 17, lineHeight: 22 }}>
              {table.name}
            </Text>
            <Text selectable={false} style={{ color: active ? meadowTheme.colors.linenDeep : meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
              {table.description}
            </Text>
          </PressCard>
        );
      })}
    </View>
  );
}
