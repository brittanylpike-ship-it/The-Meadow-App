import { MeadowImage as Image } from "@/components/meadow-image";
import { CompanionDetailSheet } from "@/components/CompanionDetailSheet";
import { meadowTheme } from "@/constants/meadow-theme";
import { type Companion, companions } from "@/data/companions";
import { getCompanionPresenceOpacity, useCompanionState } from "@/hooks/useCompanionState";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompanionsScreen() {
  const { state, totalRitualsWitnessed } = useCompanionState();
  const [selectedCompanion, setSelectedCompanion] = React.useState<Companion | null>(null);

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#F5F1EB",
            borderBottomColor: meadowTheme.colors.line,
            borderBottomWidth: 1,
            minHeight: 80,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 18,
          }}
        >
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 26, lineHeight: 32, textAlign: "center" }}>
            The Witnessing Companions
          </Text>
          <Text
            selectable
            style={{
              color: meadowTheme.colors.mutedInk,
              fontFamily: meadowTheme.fonts.body,
              fontSize: 13,
              fontStyle: "italic",
              lineHeight: 20,
              marginTop: 2,
              textAlign: "center",
            }}
          >
            They watch. They wonder. They remember you.
          </Text>
        </View>

        <View style={{ alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", paddingHorizontal: 14, paddingTop: 18 }}>
          {companions.map((companion) => {
            const record = state[companion.id];
            const presenceOpacity = getCompanionPresenceOpacity(companion, state, totalRitualsWitnessed);
            const hasBeenSeen = (record?.ritualsWitnessed ?? 0) > 0 || companion.presenceThreshold === 0;
            const canOpen = (record?.ritualsWitnessed ?? 0) > 0 || companion.presenceThreshold === 0;

            return (
              <Pressable
                key={companion.id}
                accessibilityLabel={hasBeenSeen ? companion.name : "A companion not yet seen"}
                accessibilityRole="button"
                disabled={!canOpen}
                onPress={() => setSelectedCompanion(companion)}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: "#F5F1EB",
                  borderColor: meadowTheme.colors.line,
                  borderRadius: 12,
                  borderWidth: 1,
                  height: 140,
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1,
                  paddingHorizontal: 8,
                  width: 110,
                })}
              >
                <Image
                  source={companion.imageAsset}
                  contentFit="contain"
                  style={{
                    height: 60,
                    opacity: hasBeenSeen ? Math.max(presenceOpacity, 0.42) : 0.18,
                    width: 60,
                  }}
                />
                <Text
                  selectable={false}
                  style={{
                    color: hasBeenSeen ? meadowTheme.colors.ink : "#A79D8E",
                    fontFamily: meadowTheme.fonts.header,
                    fontSize: 18,
                    lineHeight: 22,
                    marginTop: 8,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {hasBeenSeen ? companion.name : "..."}
                </Text>
                <Text
                  selectable={false}
                  style={{
                    color: "#7A7060",
                    fontFamily: meadowTheme.fonts.body,
                    fontSize: 12,
                    lineHeight: 18,
                    marginTop: 2,
                    textAlign: "center",
                  }}
                >
                  {record?.ritualsWitnessed ? `${record.ritualsWitnessed} witnessed` : "watching"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <CompanionDetailSheet
        companion={selectedCompanion}
        record={selectedCompanion ? state[selectedCompanion.id] : null}
        onClose={() => setSelectedCompanion(null)}
      />
    </SafeAreaView>
  );
}
