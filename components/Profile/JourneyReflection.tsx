import { meadowTheme } from "@/constants/meadow-theme";
import React from "react";
import { Text, View } from "react-native";

type JourneyReflectionProps = {
  journalEntryCount: number;
  lastChapterName: string | null;
  lastRitualName: string | null;
  mostPresentCompanion: string;
  totalRitualsCompleted: number;
};

export function JourneyReflection({
  journalEntryCount,
  lastChapterName,
  lastRitualName,
  mostPresentCompanion,
  totalRitualsCompleted,
}: JourneyReflectionProps) {
  return (
    <View style={{ gap: 10, paddingHorizontal: 20 }}>
      <Text selectable style={sectionHeading}>
        Your Journey
      </Text>
      <View style={reflectionCard}>
        <Text selectable style={reflectionText}>
          {buildJourneyText({ journalEntryCount, lastChapterName, lastRitualName, mostPresentCompanion, totalRitualsCompleted })}
        </Text>
      </View>
    </View>
  );
}

function buildJourneyText({
  journalEntryCount,
  lastChapterName,
  lastRitualName,
  mostPresentCompanion,
  totalRitualsCompleted,
}: JourneyReflectionProps) {
  if (totalRitualsCompleted <= 0) {
    return "The Meadow is new to you. Five chapters are open. Twenty-five rituals are waiting. There is no rush. The path finds you as much as you find it.";
  }

  if (totalRitualsCompleted < 5) {
    return `You have begun. ${lastChapterName ?? "Frozen Ground"} was where you first arrived, and ${lastRitualName ?? "your first ritual"} was the first ritual you completed. ${mostPresentCompanion} has been watching since.`;
  }

  if (totalRitualsCompleted < 15) {
    return `You have completed ${totalRitualsCompleted} rituals across The Meadow. ${lastChapterName ?? "The Meadow"} is where you are traveling now. ${mostPresentCompanion} knows you well by this point.`;
  }

  return `You have walked far. ${totalRitualsCompleted} rituals. ${journalEntryCount} journal entries. ${mostPresentCompanion} has witnessed more than most. The Meadow has been growing with you.`;
}

const sectionHeading = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.header,
  fontSize: 18,
  lineHeight: 24,
} as const;

const reflectionCard = {
  backgroundColor: meadowTheme.colors.panel,
  borderColor: meadowTheme.colors.line,
  borderRadius: 16,
  borderCurve: "continuous",
  borderWidth: 1,
  padding: 18,
} as const;

const reflectionText = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 14,
  lineHeight: 22,
} as const;
