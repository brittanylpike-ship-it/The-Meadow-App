import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import type { Companion } from "@/data/companions";
import type { CompanionRecord } from "@/hooks/useCompanionState";
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type CompanionDetailSheetProps = {
  companion: Companion | null;
  record: CompanionRecord | null;
  onClose: () => void;
};

export function CompanionDetailSheet({ companion, onClose, record }: CompanionDetailSheetProps) {
  if (!companion || !record) {
    return null;
  }

  return (
    <Modal animationType="slide" transparent visible={Boolean(companion)} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ backgroundColor: "rgba(45,38,30,0.32)", flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            backgroundColor: "#F5F1EB",
            borderColor: meadowTheme.colors.line,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            maxHeight: 460,
            paddingHorizontal: 24,
            paddingTop: 24,
          }}
        >
          <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
            <Image source={companion.imageAsset} contentFit="contain" style={{ height: 100, width: 100 }} />
            <Text selectable style={{ color: "#3D4A2E", fontFamily: meadowTheme.fonts.header, fontSize: 28, lineHeight: 36, marginTop: 8 }}>
              {companion.name}
            </Text>
            <Text selectable style={{ color: "#7A7060", fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
              {foundLine(companion, record)}
            </Text>
            <View style={{ backgroundColor: meadowTheme.colors.line, height: 1, marginVertical: 18, width: "100%" }} />
            <Text
              selectable={false}
              style={{
                color: "#7A7060",
                fontFamily: meadowTheme.fonts.body,
                fontSize: 12,
                letterSpacing: 1.2,
                lineHeight: 18,
                textTransform: "uppercase",
              }}
            >
              What they have witnessed
            </Text>
            <View style={{ alignSelf: "stretch", marginTop: 12, rowGap: 10 }}>
              {companion.witnessedPhrases.map((phrase, index) => {
                const unlocked = index < record.notesUnlocked;
                return (
                  <Text
                    key={phrase}
                    selectable={unlocked}
                    style={{
                      color: unlocked ? meadowTheme.colors.ink : "#A79D8E",
                      fontFamily: meadowTheme.fonts.body,
                      fontSize: 14,
                      fontStyle: unlocked ? "italic" : "normal",
                      lineHeight: 22,
                      opacity: unlocked ? 1 : 0.7,
                    }}
                  >
                    {unlocked ? `* ${phrase}` : "* Held quietly."}
                  </Text>
                );
              })}
            </View>
            <Pressable
              accessibilityLabel="Close companion details"
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: meadowTheme.colors.sage,
                borderRadius: 999,
                height: 46,
                justifyContent: "center",
                marginTop: 22,
                opacity: pressed ? 0.82 : 1,
                paddingHorizontal: 30,
              })}
            >
              <Text selectable={false} style={{ color: "#F5F1EB", fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 22 }}>
                Close gently
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function foundLine(companion: Companion, record: CompanionRecord) {
  if (!record.firstSeenAt) {
    return `${companion.personality} Not yet seen in the Meadow.`;
  }

  return `${companion.personality} Witnessed ${record.ritualsWitnessed} ritual${record.ritualsWitnessed === 1 ? "" : "s"}.`;
}
