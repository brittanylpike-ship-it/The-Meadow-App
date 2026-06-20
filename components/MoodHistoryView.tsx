import { MeadowImage as Image } from "@/components/meadow-image";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { MOOD_ICONS, MOOD_LABELS, Mood } from "@/data/journal-prompts";
import { useMoodHistory } from "@/hooks/useMoodHistory";
import { meadowTheme } from "@/constants/meadow-theme";

type MoodHistoryViewProps = {
  refreshKey?: number;
};

const moodColors: Record<Mood, string> = {
  heavy: meadowTheme.colors.lavender,
  tender: meadowTheme.colors.clay,
  okay: meadowTheme.colors.fog,
  quiet: meadowTheme.colors.winterBlue,
  hopeful: meadowTheme.colors.sage,
  numb: meadowTheme.colors.mutedInk,
};

export function MoodHistoryView({ refreshKey }: MoodHistoryViewProps) {
  const { moodHistory, loading, refresh } = useMoodHistory();

  React.useEffect(() => {
    if (refreshKey) {
      void refresh();
    }
  }, [refresh, refreshKey]);

  if (loading) {
    return <ActivityIndicator accessibilityLabel="The Meadow is restoring your mood map" color={meadowTheme.colors.sageDeep} />;
  }

  return (
    <View style={{ gap: 16 }}>
      <View
        accessibilityLabel="Mood map timeline"
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {moodHistory.map((entry) => {
          const mood = normalizeMood(entry.mood);
          return (
            <View
              key={entry.id}
              style={{
                alignItems: "center",
                backgroundColor: moodColors[mood],
                borderColor: meadowTheme.colors.line,
                borderRadius: meadowTheme.radius.control,
                borderWidth: 1,
                height: 34,
                justifyContent: "center",
                width: 34,
              }}
            >
              <Image
                source={MOOD_ICONS[mood]}
                style={{ height: 22, width: 22 }}
                contentFit="contain"
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </View>
          );
        })}
      </View>

      {moodHistory.slice(0, 5).map((entry) => {
        const mood = normalizeMood(entry.mood);
        return (
          <View key={entry.id} style={{ borderBottomColor: meadowTheme.colors.line, borderBottomWidth: 0.5, flexDirection: "row", gap: 12, paddingBottom: 10 }}>
            <View
              style={{
                backgroundColor: moodColors[mood],
                borderRadius: meadowTheme.radius.control,
                height: 10,
                marginTop: 5,
                width: 10,
              }}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
                {formatDate(entry.created_at)} - {MOOD_LABELS[mood]}
              </Text>
              {entry.content_preview ? (
                <Text selectable numberOfLines={2} style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 20 }}>
                  {entry.content_preview}
                  {entry.content_preview.length >= 80 ? "..." : ""}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}

      {moodHistory.length === 0 ? (
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
          Your mood map grows each time you write.
        </Text>
      ) : null}
    </View>
  );
}

function normalizeMood(mood: string): Mood {
  if (mood === "heavy" || mood === "tender" || mood === "okay" || mood === "quiet" || mood === "hopeful" || mood === "numb") {
    return mood;
  }

  return "quiet";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}
