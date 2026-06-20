import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Linking, Modal, Pressable, Text, View } from "react-native";

export function CrisisSupportCard({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onClose}>
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#F0EBF4",
          flex: 1,
          gap: 18,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 30, lineHeight: 38, textAlign: "center" }}>
          It sounds like you might be going through something really heavy right now.
        </Text>
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 24, textAlign: "center" }}>
          If you need immediate support:
        </Text>
        <View style={{ gap: 10, width: "100%" }}>
          <CrisisButton label="Call 988" onPress={() => Linking.openURL("tel:988")} />
          <CrisisButton label="Text HOME to 741741" onPress={() => Linking.openURL("sms:741741?body=HOME")} />
        </View>
        <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 26, textAlign: "center" }}>
          The Meadow is here. So are they.
        </Text>
        <Pressable accessibilityLabel="Return to The Meadow" accessibilityRole="button" hitSlop={8} onPress={onClose} style={{ padding: 10 }}>
          <Text selectable={false} style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
            Return gently
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function CrisisButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: meadowTheme.colors.sage,
        borderRadius: meadowTheme.radius.control,
        minHeight: 52,
        justifyContent: "center",
        opacity: pressed ? 0.78 : 1,
        paddingHorizontal: 18,
      })}
    >
      <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 24 }}>
        {label}
      </Text>
    </Pressable>
  );
}
