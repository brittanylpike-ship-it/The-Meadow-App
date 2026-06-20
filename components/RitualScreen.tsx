import { MeadowImage as Image } from "@/components/meadow-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { MeadowButton } from "@/components/meadow-button";
import { MeadowDivider, MeadowPanel, MeadowScreen } from "@/components/meadow-screen";
import { RitualReflection } from "@/components/RitualReflection";
import { meadowTheme } from "@/constants/meadow-theme";

type NavigationLike = {
  goBack?: () => void;
};

export type RitualScreenProps = {
  ritualId: string;
  chapterId?: string;
  chapterNumber?: number;
  chapterName: string;
  ritualName: string;
  griefStage: string;
  illustration: ImageSourcePropType;
  tagline: string;
  bodyText: string;
  activityLabel: string;
  activityPrompt: string;
  reflectionSeed?: string;
  navigation?: NavigationLike;
};

const chapterIdsByNumber: Record<number, string> = {
  1: "frozen_ground",
  2: "storm_garden",
  3: "crossroads",
  4: "the_moors",
  5: "first_bloom",
};

export function RitualScreen({
  ritualId,
  chapterId,
  chapterNumber,
  chapterName,
  ritualName,
  griefStage,
  illustration,
  tagline,
  bodyText,
  activityLabel,
  activityPrompt,
  reflectionSeed,
  navigation,
}: RitualScreenProps) {
  const [activityText, setActivityText] = React.useState("");
  const [activityDone, setActivityDone] = React.useState(false);
  const resolvedChapterId = chapterId ?? (chapterNumber ? chapterIdsByNumber[chapterNumber] : undefined) ?? "frozen_ground";

  const goBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
      return;
    }

    router.back();
  };

  const handleActivityChange = (value: string) => {
    setActivityText(value);
    if (value.trim().length > 10) {
      setActivityDone(true);
    }
  };

  return (
    <MeadowScreen title={ritualName} subtitle={tagline}>
      <Pressable accessibilityLabel={`Return to ${chapterName}`} accessibilityRole="button" hitSlop={8} onPress={goBack}>
        <Text selectable={false} style={backText}>
          Back to {chapterName}
        </Text>
      </Pressable>

      <View
        style={{
          backgroundColor: meadowTheme.colors.linenDeep,
          borderRadius: meadowTheme.radius.panel,
          borderCurve: "continuous",
          overflow: "hidden",
        }}
      >
        <Image
          accessibilityLabel={`${ritualName} ritual illustration`}
          accessibilityRole="image"
          contentFit="cover"
          source={illustration}
          style={{ height: 220, width: "100%" }}
        />
      </View>

      <MeadowPanel>
        <Text selectable style={stageText}>
          {griefStage}
        </Text>
        <Text selectable style={bodyTextStyle}>
          {bodyText}
        </Text>
      </MeadowPanel>

      <MeadowPanel>
        <Text selectable style={headerText}>
          {activityLabel}
        </Text>
        <Text selectable style={bodyTextStyle}>
          {activityPrompt}
        </Text>
        <TextInput
          accessibilityLabel="Ritual practice writing space"
          accessibilityHint={`Writes a private practice note for ${ritualName}.`}
          multiline
          onChangeText={handleActivityChange}
          placeholder="Take your time..."
          placeholderTextColor={meadowTheme.colors.mutedInk}
          selectionColor={meadowTheme.colors.sage}
          style={{
            backgroundColor: meadowTheme.colors.panelDeep,
            borderColor: meadowTheme.colors.line,
            borderRadius: meadowTheme.radius.panel,
            borderWidth: 1,
            color: meadowTheme.colors.ink,
            fontFamily: meadowTheme.fonts.body,
            fontSize: 15,
            lineHeight: 24,
            minHeight: 120,
            padding: 16,
            textAlignVertical: "top",
          }}
          value={activityText}
        />
      </MeadowPanel>

      <MeadowDivider />

      <RitualReflection ritualId={ritualId} chapterId={resolvedChapterId} chapterNumber={chapterNumber} promptHint={reflectionSeed} onSaved={() => setActivityDone(true)} />

      {activityDone ? (
        <MeadowPanel>
          <Text selectable style={[headerText, { color: meadowTheme.colors.sageDeep, textAlign: "center" }]}>
            The Meadow remembers this.
          </Text>
          <MeadowButton label={`Return to ${chapterName}`} onPress={goBack} />
        </MeadowPanel>
      ) : null}
    </MeadowScreen>
  );
}

const backText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 15,
  lineHeight: 21,
};

const stageText = {
  color: meadowTheme.colors.sageDeep,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 12,
  letterSpacing: 1,
  lineHeight: 18,
  textTransform: "uppercase" as const,
};

const headerText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.header,
  fontSize: 22,
  lineHeight: 28,
};

const bodyTextStyle = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 15,
  lineHeight: 23,
};
