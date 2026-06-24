import { MeadowImage as Image } from "@/components/meadow-image";
import React from "react";
import { RefreshControlProps, ScrollView, Text, View } from "react-native";

import { meadowTheme } from "@/constants/meadow-theme";

type MeadowScreenProps = {
  title?: string;
  subtitle?: string;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  children: React.ReactNode;
};

export function MeadowScreen({ title, subtitle, refreshControl, children }: MeadowScreenProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={refreshControl}
      style={{ flex: 1, backgroundColor: meadowTheme.colors.linen }}
      contentContainerStyle={{ padding: 18, gap: 18, paddingBottom: 120 }}
    >
      {title ? (
        <View style={{ gap: 8 }}>
          <Text
            selectable
            style={{
              color: meadowTheme.colors.ink,
              fontFamily: meadowTheme.fonts.header,
              fontSize: 32,
              lineHeight: 39
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              selectable
              style={{
                color: meadowTheme.colors.mutedInk,
                fontFamily: meadowTheme.fonts.body,
                fontSize: 17,
                lineHeight: 24
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

export function MeadowPanel({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: meadowTheme.colors.panel,
        borderColor: meadowTheme.colors.line,
        borderRadius: meadowTheme.radius.panel,
        borderCurve: "continuous",
        borderWidth: 1,
        boxShadow: "inset 0 1px 4px rgba(37, 51, 31, 0.05), 0 3px 10px rgba(37, 51, 31, 0.06)",
        gap: 14,
        padding: 16
      }}
    >
      <Image
        source={require("@/assets/art/vine-divider.png")}
        style={{ alignSelf: "center", height: 18, opacity: 0.5, width: 160 }}
        contentFit="contain"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      {children}
    </View>
  );
}

export function MeadowDivider() {
  return (
    <Image
      source={require("@/assets/art/vine-divider.png")}
      style={{ alignSelf: "center", height: 34, width: 260 }}
      contentFit="contain"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
