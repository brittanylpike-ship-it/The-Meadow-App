import { MeadowImage as Image } from "@/components/meadow-image";
import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

const greenhouseDoor = require("@/assets/images/hearth/greenhouse-thumb.png");

export function SubscriberGate({ onLearnMore }: { onLearnMore?: () => void }) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: meadowTheme.colors.panel,
        borderColor: meadowTheme.colors.line,
        borderRadius: 20,
        borderWidth: 1,
        boxShadow: "0 4px 14px rgba(37, 51, 31, 0.08)",
        gap: 10,
        padding: 18,
      }}
    >
      <Image
        accessibilityLabel="Greenhouse doorway"
        contentFit="cover"
        source={greenhouseDoor}
        style={{ borderRadius: 20, height: 54, overflow: "hidden", width: 54 }}
      />
      <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 27, textAlign: "center" }}>
        The Greenhouse is a subscriber sanctuary.
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
        Healing circles, guided workshops, and a deeper community await inside. Thank you for considering.
      </Text>
      <PressCard
        accessibilityLabel="Learn more about the Greenhouse"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onLearnMore}
        style={{
          alignItems: "center",
          backgroundColor: meadowTheme.colors.sage,
          borderRadius: meadowTheme.radius.control,
          minHeight: 48,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Text selectable={false} style={{ color: meadowTheme.colors.linen, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 22 }}>
          {"Learn More ->"}
        </Text>
      </PressCard>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18, textAlign: "center" }}>
        The rest of The Hearth is always free.
      </Text>
    </View>
  );
}
