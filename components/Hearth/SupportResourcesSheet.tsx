import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { crisisResources, griefSupportOrganizations } from "@/data/griefSupport";
import React from "react";
import { Linking, Modal, Pressable, ScrollView, Text, View } from "react-native";

export function SupportResourcesSheet({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={{ backgroundColor: "rgba(59, 42, 26, 0.26)", flex: 1, justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: meadowTheme.colors.panel,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "82%",
            padding: 18,
          }}
        >
          <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 26, lineHeight: 32, textAlign: "center" }}>
              If You Need More
            </Text>
            <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
              These links open outside The Meadow, on your own terms.
            </Text>
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
                    borderRadius: meadowTheme.radius.panel,
                    borderWidth: 1,
                    flex: 1,
                    gap: 6,
                    opacity: pressed ? 0.78 : 1,
                    padding: 12,
                  })}
                >
                  <Image source={resource.icon} contentFit="contain" style={{ height: 28, width: 28 }} />
                  <Text selectable={false} style={{ color: meadowTheme.colors.lavender, fontFamily: meadowTheme.fonts.header, fontSize: 15, lineHeight: 20 }}>
                    {resource.title}
                  </Text>
                  <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 19 }}>
                    {resource.body}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={{ backgroundColor: meadowTheme.colors.linenDeep, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1 }}>
              {griefSupportOrganizations.map((organization) => (
                <Pressable
                  accessibilityLabel={`Open ${organization.name}`}
                  accessibilityRole="link"
                  key={organization.name}
                  onPress={() => Linking.openURL(organization.url)}
                  style={({ pressed }) => ({
                    borderBottomColor: meadowTheme.colors.line,
                    borderBottomWidth: organization === griefSupportOrganizations[griefSupportOrganizations.length - 1] ? 0 : 1,
                    gap: 4,
                    minHeight: 62,
                    opacity: pressed ? 0.72 : 1,
                    padding: 12,
                  })}
                >
                  <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 16, lineHeight: 21 }}>
                    {organization.name}
                  </Text>
                  <Text selectable={false} style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, fontStyle: "italic", lineHeight: 19 }}>
                    {organization.description}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable accessibilityLabel="Close support resources" accessibilityRole="button" onPress={onClose} style={{ alignItems: "center", padding: 10 }}>
              <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
                Close gently
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
