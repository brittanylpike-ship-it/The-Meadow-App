import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import type { WitnessedNote } from "@/hooks/useCompanionState";
import React from "react";
import { Pressable, Text, View } from "react-native";

type WitnessedNoteCardProps = {
  chapterName: string;
  note: WitnessedNote;
  onReturn: () => void;
};

export function WitnessedNoteCard({ chapterName, note, onReturn }: WitnessedNoteCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Return to ${chapterName}`}
      accessibilityRole="button"
      onPress={onReturn}
      style={{
        alignItems: "center",
        bottom: 0,
        justifyContent: "center",
        left: 0,
        paddingHorizontal: 20,
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 9,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#F5F1EB",
          borderColor: meadowTheme.colors.line,
          borderRadius: 16,
          borderWidth: 1,
          boxShadow: "0 12px 28px rgba(30, 25, 20, 0.24)",
          paddingHorizontal: 22,
          paddingVertical: 20,
          width: 300,
        }}
      >
        <View style={{ alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 14 }}>
          <Image source={note.companion.imageAsset} contentFit="contain" style={{ height: 40, width: 40 }} />
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
            {note.companion.name}
          </Text>
        </View>
        <Text
          selectable
          style={{
            color: "#3D4A2E",
            fontFamily: meadowTheme.fonts.header,
            fontSize: 20,
            fontStyle: "italic",
            lineHeight: 30,
            textAlign: "center",
          }}
        >
          {note.phrase}
        </Text>
        <Text
          selectable={false}
          style={{
            color: "#7A7060",
            fontFamily: meadowTheme.fonts.body,
            fontSize: 13,
            lineHeight: 20,
            marginTop: 18,
            textAlign: "center",
          }}
        >
          {`<- Return to ${chapterName}`}
        </Text>
      </View>
    </Pressable>
  );
}
