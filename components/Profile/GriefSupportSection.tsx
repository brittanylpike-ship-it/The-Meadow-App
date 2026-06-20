import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { crisisResources, griefSupportOrganizations } from "@/data/griefSupport";
import React from "react";
import { Linking, Pressable, Text, View } from "react-native";

export function GriefSupportSection() {
  return (
    <View style={{ gap: 14, paddingHorizontal: 20 }}>
      <View style={{ gap: 4 }}>
        <Text selectable style={sectionHeading}>
          If You Need More
        </Text>
        <Text selectable style={sectionSubheading}>
          The Meadow is a companion, not a crisis service. These people are trained to help.
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {crisisResources.map((resource) => (
          <Pressable
            accessibilityLabel={resource.title}
            accessibilityRole="link"
            key={resource.title}
            onPress={() => Linking.openURL(resource.url)}
            style={({ pressed }) => ({
              backgroundColor: meadowTheme.colors.panelDeep,
              borderColor: meadowTheme.colors.lavender,
              borderRadius: 14,
              borderCurve: "continuous",
              borderWidth: 1.5,
              flex: 1,
              gap: 6,
              opacity: pressed ? 0.78 : 1,
              padding: 14,
            })}
          >
            <Image source={resource.icon} contentFit="contain" style={{ height: 28, width: 28 }} />
            <Text selectable={false} style={{ color: meadowTheme.colors.lavender, fontFamily: meadowTheme.fonts.header, fontSize: 15, lineHeight: 20 }}>
              {resource.title}
            </Text>
            <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
              {resource.body}
            </Text>
            <Text selectable={false} style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 11, lineHeight: 16 }}>
              {resource.subtext}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: 14, borderCurve: "continuous", borderWidth: 1, paddingHorizontal: 12 }}>
        {griefSupportOrganizations.map((organization) => (
          <Pressable
            accessibilityLabel={`Open ${organization.name}`}
            accessibilityRole="link"
            key={organization.name}
            onPress={() => Linking.openURL(organization.url)}
            style={({ pressed }) => ({
              alignItems: "center",
              borderBottomColor: meadowTheme.colors.line,
              borderBottomWidth: organization === griefSupportOrganizations[griefSupportOrganizations.length - 1] ? 0 : 1,
              flexDirection: "row",
              gap: 12,
              minHeight: 64,
              opacity: pressed ? 0.72 : 1,
              paddingVertical: 10,
            })}
          >
            <View style={{ alignItems: "center", backgroundColor: organization.accent, borderRadius: 999, height: 24, justifyContent: "center", opacity: 0.72, width: 24 }}>
              <Text selectable={false} style={{ color: meadowTheme.colors.panel, fontFamily: meadowTheme.fonts.header, fontSize: 13, lineHeight: 17 }}>
                {organization.initial}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 14, lineHeight: 19 }}>
                {organization.name}
              </Text>
              <Text numberOfLines={1} selectable={false} style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, fontStyle: "italic", lineHeight: 18 }}>
                {organization.description}
              </Text>
            </View>
            <Text selectable={false} style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.header, fontSize: 16, lineHeight: 20 }}>
              {">"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text selectable style={footerText}>
        You do not have to carry this alone. Reaching out is not weakness. It is how grief moves.
      </Text>
      <Image source={require("@/assets/art/vine-divider.png")} contentFit="contain" style={{ alignSelf: "center", height: 28, opacity: 0.42, width: 140 }} />
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
  fontFamily: meadowTheme.fonts.header,
  fontSize: 13,
  fontStyle: "italic",
  lineHeight: 20,
} as const;

const footerText = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.header,
  fontSize: 13,
  fontStyle: "italic",
  lineHeight: 20,
  textAlign: "center",
} as const;
