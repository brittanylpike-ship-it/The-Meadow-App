import { MeadowImage as Image } from "@/components/meadow-image";
import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AnimatedQuill } from "@/components/AnimatedQuill";
import { MeadowButton } from "@/components/meadow-button";
import { MeadowPanel } from "@/components/meadow-screen";
import { SuccessFlash } from "@/components/SuccessFlash";
import { meadowTheme } from "@/constants/meadow-theme";
import { getPrompt, MOOD_ICONS, MOOD_LABELS, MOOD_ORDER, type Mood } from "@/data/journal-prompts";
import { useAuth } from "@/features/auth/auth-context";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type RitualReflectionProps = {
  ritualId: string;
  chapterId?: string;
  chapterNumber?: number;
  promptHint?: string;
  onSaved?: () => void;
};

const inkwellImage = require("@/assets/illustrations/inkwell.png");
const lineHeight = 24;
const writingStartX = 16;
const quillOffsetX = 28;
const quillRestY = 12;

const chapterIdsByNumber: Record<number, string> = {
  1: "frozen_ground",
  2: "storm_garden",
  3: "crossroads",
  4: "the_moors",
  5: "first_bloom",
};

export function RitualReflection({ ritualId, chapterId, chapterNumber, promptHint, onSaved }: RitualReflectionProps) {
  const { user } = useAuth();
  const resolvedChapterId = chapterId ?? (chapterNumber ? chapterIdsByNumber[chapterNumber] : undefined) ?? "frozen_ground";
  const [selectedMood, setSelectedMood] = React.useState<Mood | null>(null);
  const [text, setText] = React.useState(promptHint ? `${promptHint}\n\n` : "");
  const [currentPrompt, setCurrentPrompt] = React.useState<string | null>(null);
  const [promptVisible, setPromptVisible] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [flash, setFlash] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [enterPressed, setEnterPressed] = React.useState(false);
  const [quillTarget, setQuillTarget] = React.useState({ x: writingStartX + quillOffsetX, y: quillRestY });
  const [inputLayout, setInputLayout] = React.useState({ width: 0, height: 180 });
  const typingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, []);

  const updateQuillTarget = React.useCallback(
    (value: string, cursorIndex: number) => {
      const safeIndex = Math.max(0, Math.min(cursorIndex, value.length));
      const lines = value.slice(0, safeIndex).split("\n");
      const lineNumber = lines.length - 1;
      const currentLine = lines[lineNumber] ?? "";
      const usableWidth = Math.max(100, inputLayout.width - writingStartX - 84);
      const approximateTextWidth = Math.min(currentLine.length * 8.5, usableWidth);
      const maxY = Math.max(quillRestY, inputLayout.height - 104);

      setQuillTarget({
        x: writingStartX + approximateTextWidth + quillOffsetX,
        y: Math.max(quillRestY, Math.min(lineNumber * lineHeight + lineHeight / 2 - 44, maxY)),
      });
    },
    [inputLayout.height, inputLayout.width]
  );

  const handleTextChange = (value: string) => {
    setText(value);
    setSaved(false);
    setIsTyping(true);
    updateQuillTarget(value, value.length);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    typingTimer.current = setTimeout(() => setIsTyping(false), 900);
  };

  const handleSelectionChange = (event: { nativeEvent: { selection: { start: number } } }) => {
    updateQuillTarget(text, event.nativeEvent.selection.start);
  };

  const handleKeyPress = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key !== "Enter") {
      return;
    }

    setEnterPressed(true);
    setTimeout(() => setEnterPressed(false), 50);
  };

  const handleMoodPress = (mood: Mood) => {
    setSelectedMood(mood);
    setCurrentPrompt(null);
    setPromptVisible(false);
    setNotice(null);
    setSaved(false);
  };

  const handlePromptPress = () => {
    if (!selectedMood) {
      setNotice("Choose a mood first. The prompt will meet you there.");
      return;
    }

    setCurrentPrompt(getPrompt(selectedMood));
    setPromptVisible(true);
    setNotice(null);
  };

  const handleUsePrompt = () => {
    if (!currentPrompt) {
      return;
    }

    handleTextChange(`${text}${text.trim() ? "\n\n" : ""}${currentPrompt}\n`);
    setPromptVisible(false);
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!text.trim()) {
      setNotice("Begin with a word, a sentence, or the smallest true thing.");
      return;
    }

    setSaving(true);

    try {
      if (hasSupabaseConfig && supabase && user) {
        const { error } = await supabase.from("journal_entries").insert({
          body: text.trim(),
          chapter_id: resolvedChapterId,
          draft: false,
          mood: selectedMood,
          ritual_id: ritualId,
          user_id: user.id,
        });

        if (error) {
          throw error;
        }
      }

      setSaved(true);
      setNotice("Saved to your journal.");
      setFlash("The Meadow remembers.");
      onSaved?.();
    } catch {
      setNotice("The reflection could not travel yet. Try once more in a moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MeadowPanel>
      <Text selectable style={headerText}>
        Your Reflection
      </Text>
      <Text selectable style={bodyText}>
        Write whatever this brings up. There are no rules here.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2 }}>
        {MOOD_ORDER.map((mood) => {
          const selected = selectedMood === mood;
          return (
            <Pressable
              accessibilityLabel={`Feeling ${MOOD_LABELS[mood].toLowerCase()}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              hitSlop={6}
              key={mood}
              onPress={() => handleMoodPress(mood)}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: selected ? meadowTheme.colors.panelDeep : meadowTheme.colors.panel,
                borderColor: selected ? meadowTheme.colors.sageDeep : meadowTheme.colors.line,
                borderRadius: meadowTheme.radius.panel,
                borderWidth: selected ? 1.5 : 1,
                gap: 6,
                minHeight: 88,
                minWidth: 78,
                opacity: pressed ? 0.78 : 1,
                paddingHorizontal: 10,
                paddingVertical: 10,
              })}
            >
              <Image
                accessible={false}
                accessibilityElementsHidden
                contentFit="contain"
                importantForAccessibility="no"
                source={MOOD_ICONS[mood]}
                style={{ height: 34, width: 34 }}
              />
              <Text selectable={false} style={[smallText, { color: selected ? meadowTheme.colors.sageDeep : meadowTheme.colors.ink, textAlign: "center" }]}>
                {MOOD_LABELS[mood]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <MeadowButton label="Writing Prompt" quiet onPress={handlePromptPress} />

      {promptVisible && currentPrompt ? (
        <View
          style={{
            backgroundColor: meadowTheme.colors.panelDeep,
            borderColor: meadowTheme.colors.line,
            borderRadius: meadowTheme.radius.panel,
            borderWidth: 1,
            gap: 12,
            padding: 14,
          }}
        >
          <Text selectable style={promptText}>
            {currentPrompt}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}>
            <MeadowButton label="Different Prompt" quiet onPress={() => selectedMood && setCurrentPrompt(getPrompt(selectedMood))} />
            <MeadowButton label="Use This" quiet onPress={handleUsePrompt} />
          </View>
        </View>
      ) : null}

      <View
        onLayout={(event) =>
          setInputLayout({
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width,
          })
        }
        style={{
          backgroundColor: meadowTheme.colors.panelDeep,
          borderColor: meadowTheme.colors.line,
          borderRadius: meadowTheme.radius.panel,
          borderWidth: 1,
          minHeight: 180,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <TextInput
          accessibilityLabel="Ritual reflection writing space"
          accessibilityHint="Writes a private journal reflection connected to this ritual."
          multiline
          onChangeText={handleTextChange}
          onKeyPress={handleKeyPress}
          onSelectionChange={handleSelectionChange}
          placeholder="Begin wherever feels right..."
          placeholderTextColor={meadowTheme.colors.mutedInk}
          selectionColor={meadowTheme.colors.sage}
          style={{
            color: meadowTheme.colors.ink,
            fontFamily: meadowTheme.fonts.body,
            fontSize: 15,
            lineHeight,
            minHeight: 180,
            padding: writingStartX,
            paddingBottom: 64,
            paddingRight: 76,
            textAlignVertical: "top",
          }}
          value={text}
        />
        <Image
          accessible={false}
          accessibilityElementsHidden
          contentFit="contain"
          importantForAccessibility="no"
          source={inkwellImage}
          style={{ bottom: 10, height: 36, position: "absolute", right: 14, width: 36 }}
        />
        <AnimatedQuill
          containerHeight={inputLayout.height}
          containerWidth={inputLayout.width}
          isTyping={isTyping}
          onEnterPressed={enterPressed}
          targetX={quillTarget.x}
          targetY={quillTarget.y}
        />
      </View>

      {notice ? (
        <Text selectable style={[bodyText, { color: saved ? meadowTheme.colors.sageDeep : meadowTheme.colors.mutedInk, textAlign: "center" }]}>
          {notice}
        </Text>
      ) : null}

      <MeadowButton label={saving ? "Saving..." : "Save to My Journal"} disabled={saving} onPress={handleSave} />
      <SuccessFlash message={flash} onDone={() => setFlash(null)} />
    </MeadowPanel>
  );
}

const headerText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.header,
  fontSize: 23,
  lineHeight: 29,
};

const bodyText = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 15,
  fontStyle: "italic" as const,
  lineHeight: 22,
};

const smallText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 12,
  lineHeight: 18,
};

const promptText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 15,
  fontStyle: "italic" as const,
  lineHeight: 22,
  textAlign: "center" as const,
};
