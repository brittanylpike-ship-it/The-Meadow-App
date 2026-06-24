import { MeadowButton } from "@/components/meadow-button";
import { MeadowDivider } from "@/components/meadow-screen";
import { meadowTheme } from "@/constants/meadow-theme";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function GardenNookScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{ gap: 18, padding: 20, paddingBottom: 120 }}
    >
      <View style={{ gap: 8 }}>
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 32, lineHeight: 39, textAlign: "center" }}>
          Garden Nook
        </Text>
        <MeadowDivider />
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 15, fontStyle: "italic", lineHeight: 23, textAlign: "center" }}>
          A shared place to breathe, reflect, and rest.
        </Text>
      </View>
      <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 10, padding: 16 }}>
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 23, textAlign: "center" }}>
          This nook is held gently for Courtyard visitors. More tending tools can live here later.
        </Text>
        <MeadowButton label="Return to The Courtyard" onPress={() => router.push("/hearth/courtyard" as never)} />
      </View>
    </ScrollView>
  );
}
