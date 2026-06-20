import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { companions } from "@/data/companions";
import type { CompanionStateMap } from "@/hooks/useCompanionState";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type CompanionSummaryRowProps = {
  companionState: CompanionStateMap;
};

export function CompanionSummaryRow({ companionState }: CompanionSummaryRowProps) {
  return (
    <View style={{ gap: 10, paddingHorizontal: 20 }}>
      <View>
        <Text selectable style={sectionHeading}>
          Your Companions
        </Text>
        <Text selectable style={sectionSubheading}>
          Who has found you so far.
        </Text>
      </View>
      <ScrollView horizontal contentContainerStyle={{ gap: 10, paddingVertical: 2 }} showsHorizontalScrollIndicator={false}>
        {companions.map((companion) => {
          const witnessed = companionState[companion.id]?.ritualsWitnessed ?? 0;
          const unlocked = witnessed > 0 || companion.presenceThreshold === 0;
          return (
            <Pressable
              accessibilityLabel={unlocked ? companion.name : "A companion not yet seen"}
              accessibilityRole={unlocked ? "button" : undefined}
              disabled={!unlocked}
              key={companion.id}
              onPress={() => router.push("/companions" as never)}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: meadowTheme.colors.panel,
                borderColor: meadowTheme.colors.line,
                borderRadius: 12,
                borderCurve: "continuous",
                borderWidth: 1,
                height: 76,
                justifyContent: "center",
                opacity: pressed ? 0.78 : 1,
                width: 60,
              })}
            >
              {unlocked ? (
                <Image source={companion.imageAsset} contentFit="contain" style={{ height: 40, opacity: Math.max(0.4, Math.min(0.9, witnessed / 4 + 0.35)), width: 40 }} />
              ) : (
                <View style={{ backgroundColor: meadowTheme.colors.fog, borderRadius: 999, height: 40, opacity: 0.55, width: 40 }} />
              )}
              <Text numberOfLines={1} selectable={false} style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 10, lineHeight: 14, marginTop: 4, textAlign: "center", width: 52 }}>
                {unlocked ? companion.name : "..."}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const sectionHeading = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.header,
  fontSize: 18,
  lineHeight: 24,
} as const;

const sectionSubheading = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 13,
  fontStyle: "italic",
  lineHeight: 20,
} as const;
