import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnimatedQuill } from "@/components/AnimatedQuill";
import { MeadowImage as Image } from "@/components/meadow-image";
import { MeadowSceneImage } from "@/components/meadow-scene-image";
import { InkwellAnimation } from "@/components/Journal/InkwellAnimation";
import { QuillWritingAnimation } from "@/components/Journal/QuillWritingAnimation";
import { MoodHistoryView } from "@/components/MoodHistoryView";
import { SuccessFlash } from "@/components/SuccessFlash";
import { meadowTheme } from "@/constants/meadow-theme";
import { getPrompt, MOOD_LABELS, MOOD_ORDER, type Mood } from "@/data/journal-prompts";
import { useAuth } from "@/features/auth/auth-context";
import { getJournalEmptyState } from "@/features/memory/journal-empty-state.mjs";
import { getJournalMemoryArchive, getJournalSubtitle } from "@/features/memory/journal-memory-archive.mjs";
import { getMemoryGardenEntry } from "@/features/memory/memory-garden.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";
import { fetchJournalPrompt } from "@/services/journalPromptService";
import { hasSupabaseConfig, supabase } from "@/services/supabase";
import { Redirect, router } from "expo-router";
import React from "react";
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const journalHeader = require("@/assets/images/journal/journal-header.png");
const vineDivider = require("@/assets/images/journal/vine-divider.png");
const hydrangeaCorner = require("@/assets/images/journal/hydrangea-corner.png");
const journalBookPreview = require("@/assets/images/journal/journal-book-preview.png");
const hedgehogFooter = require("@/assets/images/journal/hedgehog-footer.png");
const inkwellAsset = require("@/assets/images/journal/inkwell.png");

const moodIcons: Record<Mood, unknown> = {
  heavy: require("@/assets/images/journal/moods/heavy.png"),
  tender: require("@/assets/images/journal/moods/tender.png"),
  okay: require("@/assets/images/journal/moods/okay.png"),
  quiet: require("@/assets/images/journal/moods/quiet.png"),
  hopeful: require("@/assets/images/journal/moods/hopeful.png"),
  numb: require("@/assets/images/journal/moods/numb.png"),
};

const MOODS = MOOD_ORDER;

const moodAccent: Record<Mood, string> = {
  heavy: meadowTheme.colors.winterBlue,
  tender: meadowTheme.colors.clay,
  okay: meadowTheme.colors.sage,
  quiet: meadowTheme.colors.lavender,
  hopeful: meadowTheme.colors.sageDeep,
  numb: meadowTheme.colors.mutedInk,
};

const journalColors = {
  border: meadowTheme.colors.line,
  ink: meadowTheme.colors.ink,
  muted: meadowTheme.colors.mutedInk,
  parchment: meadowTheme.colors.linen,
  panel: meadowTheme.colors.panel,
  panelSoft: meadowTheme.colors.linenDeep,
  sage: meadowTheme.colors.sage,
  sageDeep: meadowTheme.colors.sageDeep,
};

type StoredJournalEntry = {
  id: string;
  body: string;
  mood: Mood | null;
  prompt: string | null;
  created_at: string;
};

type MoodTileProps = {
  mood: Mood;
  selected: boolean;
  onPress: () => void;
};

function MoodTile({ mood, onPress, selected }: MoodTileProps) {
  return (
    <Pressable
      accessibilityLabel={`Feeling ${MOOD_LABELS[mood].toLowerCase()}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: selected ? journalColors.panelSoft : journalColors.panel,
        borderColor: selected ? journalColors.sage : journalColors.border,
        borderRadius: 14,
        borderWidth: selected ? 2 : 1,
        height: 88,
        justifyContent: "center",
        opacity: pressed ? 0.8 : 1,
        paddingHorizontal: 8,
        width: 72,
      })}
    >
      <Image source={moodIcons[mood]} contentFit="cover" style={{ borderRadius: 9, height: 46, overflow: "hidden", width: 46 }} />
      <Text selectable={false} style={{ color: selected ? moodAccent[mood] : journalColors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 16, marginTop: 4, textAlign: "center" }}>
        {MOOD_LABELS[mood]}
      </Text>
    </Pressable>
  );
}

export default function JournalScreen() {
  const { user, loading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = React.useState("");
  const [selectedMood, setSelectedMood] = React.useState<Mood | null>(null);
  const [currentPrompt, setCurrentPrompt] = React.useState<string | null>(null);
  const [promptLoading, setPromptLoading] = React.useState(false);
  const [journalNotice, setJournalNotice] = React.useState<string | null>(null);
  const [savingEntry, setSavingEntry] = React.useState(false);
  const [savedEntries, setSavedEntries] = React.useState<StoredJournalEntry[]>([]);
  const [moodHistoryVisible, setMoodHistoryVisible] = React.useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [writingSignal, setWritingSignal] = React.useState(0);
  const [saveSignal, setSaveSignal] = React.useState(0);
  const [flash, setFlash] = React.useState<string | null>(null);
  const [inputLayout, setInputLayout] = React.useState({ height: 220, width: 0 });
  const [quillTarget, setQuillTarget] = React.useState({ x: 14, y: 16 });
  const [isTyping, setIsTyping] = React.useState(false);
  const [enterPressed, setEnterPressed] = React.useState(false);
  const writingReset = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingReset = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const archive = getJournalMemoryArchive(meadow.state);
  const subtitle = getJournalSubtitle(meadow.state);
  const emptyState = getJournalEmptyState();
  const gardenEntry = getMemoryGardenEntry(meadow.state);

  React.useEffect(() => {
    void loadStoredEntries();
    return () => {
      if (writingReset.current) {
        clearTimeout(writingReset.current);
      }
      if (typingReset.current) {
        clearTimeout(typingReset.current);
      }
    };
  }, []);

  async function loadStoredEntries() {
    try {
      const raw = await AsyncStorage.getItem("meadow_journal_entries");
      const parsed = raw ? (JSON.parse(raw) as StoredJournalEntry[]) : [];
      setSavedEntries(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSavedEntries([]);
    }
  }

  async function persistLocalEntry(entry: StoredJournalEntry) {
    const nextEntries = [entry, ...savedEntries].slice(0, 100);
    setSavedEntries(nextEntries);
    await AsyncStorage.setItem("meadow_journal_entries", JSON.stringify(nextEntries));
  }

  const handleMoodPress = (mood: Mood) => {
    setSelectedMood(mood);
    setCurrentPrompt(null);
    setJournalNotice(null);
  };

  const handleTextChange = (text: string) => {
    setDraft(text);
    setIsTyping(Boolean(text.length));
    if (!writingReset.current) {
      setWritingSignal((value) => value + 1);
    }
    if (writingReset.current) {
      clearTimeout(writingReset.current);
    }
    writingReset.current = setTimeout(() => {
      writingReset.current = null;
    }, 60000);
    if (typingReset.current) {
      clearTimeout(typingReset.current);
    }
    typingReset.current = setTimeout(() => {
      setIsTyping(false);
    }, 900);
  };

  const handleSelectionChange = (event: { nativeEvent: { selection: { start: number } } }) => {
    const index = event.nativeEvent.selection.start;
    const charsPerLine = Math.max(12, Math.floor(Math.max(inputLayout.width - 48, 180) / 8));
    const line = Math.floor(index / charsPerLine);
    const column = index % charsPerLine;
    setQuillTarget({
      x: Math.min(Math.max(12, column * 8 + 8), Math.max(16, inputLayout.width - 64)),
      y: Math.min(line * 24 + 10, Math.max(12, inputLayout.height - 96)),
    });
  };

  const handleKeyPress = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key !== "Enter") {
      return;
    }
    setEnterPressed(true);
    setTimeout(() => setEnterPressed(false), 950);
  };

  const handlePromptPress = async () => {
    if (!selectedMood) {
      setJournalNotice("Choose a mood first. It helps the Meadow find the right prompt for you.");
      return;
    }

    setPromptLoading(true);
    setJournalNotice(null);
    try {
      const prompt = await fetchJournalPrompt(selectedMood);
      setCurrentPrompt(prompt || getPrompt(selectedMood));
    } catch {
      setCurrentPrompt(getPrompt(selectedMood));
    } finally {
      setPromptLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (savingEntry) {
      return;
    }

    if (!draft.trim()) {
      setJournalNotice("Write a little first. The page is here when you are ready.");
      return;
    }

    if (!selectedMood) {
      setJournalNotice("Choose a mood before you save. It helps the Journal remember the shape of this entry.");
      return;
    }

    setSavingEntry(true);
    const localEntry: StoredJournalEntry = {
      body: draft.trim(),
      created_at: new Date().toISOString(),
      id: `journal-${Date.now()}`,
      mood: selectedMood,
      prompt: currentPrompt,
    };

    try {
      await persistLocalEntry(localEntry);
      if (hasSupabaseConfig && supabase && user) {
        const { error } = await supabase.from("journal_entries").insert({
          body: draft.trim(),
          draft: false,
          mood: selectedMood,
          user_id: user.id,
        });

        if (error) {
          throw error;
        }
      }

      handleTextChange("");
      setCurrentPrompt(null);
      setJournalNotice("Your entry has been placed gently in the Journal.");
      setFlash("Saved to your journal.");
      setMoodHistoryVisible(true);
      setHistoryRefreshKey((value) => value + 1);
      setSaveSignal((value) => value + 1);
    } catch {
      setJournalNotice("The Journal is keeping this locally for now. Please try saving again in a moment.");
    } finally {
      setSavingEntry(false);
    }
  };

  async function handleRefresh() {
    setRefreshing(true);
    await loadStoredEntries();
    setHistoryRefreshKey((value) => value + 1);
    setRefreshing(false);
  }

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  const previewEntries = savedEntries.slice(0, 3);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl colors={[journalColors.sage]} refreshing={refreshing} tintColor={journalColors.sage} onRefresh={() => void handleRefresh()} />}
      style={{ backgroundColor: journalColors.parchment, flex: 1 }}
      contentContainerStyle={{ paddingBottom: 104 + Math.max(insets.bottom, 0) }}
      showsVerticalScrollIndicator={false}
    >
      <Image source={journalHeader} contentFit="cover" style={{ backgroundColor: meadowTheme.colors.linenDeep, height: 160, width: "100%" }} accessibilityLabel="Watercolor hedgehog, books, peony, and flowers for the Journal" />

      <View style={{ alignItems: "center", paddingHorizontal: 20, paddingTop: 10 }}>
        <Text selectable style={{ color: journalColors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 34, fontStyle: "italic", lineHeight: 42, textAlign: "center" }}>
          My Journal
        </Text>
        <Image source={vineDivider} contentFit="contain" style={{ height: 34, marginTop: 2, width: 200 }} />
        <Text selectable style={{ color: journalColors.muted, fontFamily: meadowTheme.fonts.header, fontSize: 16, fontStyle: "italic", lineHeight: 24, marginTop: 4, textAlign: "center" }}>
          A quiet space to meet yourself just as you are.
        </Text>
      </View>

      <ScrollView horizontal contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingVertical: 18 }} showsHorizontalScrollIndicator={false}>
        {MOODS.map((mood) => (
          <MoodTile key={mood} mood={mood} selected={selectedMood === mood} onPress={() => handleMoodPress(mood)} />
        ))}
      </ScrollView>
      <Text selectable style={{ color: journalColors.muted, fontFamily: meadowTheme.fonts.header, fontSize: 14, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
        {selectedMood ? `${MOOD_LABELS[selectedMood]} helps shape your prompt.` : "Your mood helps shape your prompt."}
      </Text>

      <View
        style={{
          backgroundColor: journalColors.panel,
          borderColor: journalColors.border,
          borderRadius: 18,
          borderWidth: 1,
          boxShadow: "0 3px 8px rgba(61,46,30,0.12)",
          marginHorizontal: 20,
          marginTop: 16,
          minHeight: 220,
          overflow: "hidden",
          padding: 20,
        }}
      >
        {currentPrompt ? (
          <View style={{ borderLeftColor: journalColors.sage, borderLeftWidth: 4, marginBottom: 12, paddingLeft: 12 }}>
            <Text selectable style={{ color: journalColors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 17, fontStyle: "italic", lineHeight: 25 }}>
              {currentPrompt}
            </Text>
            <Text selectable style={{ color: journalColors.muted, fontFamily: meadowTheme.fonts.header, fontSize: 12, fontStyle: "italic", lineHeight: 18, marginTop: 4 }}>
              Write your response below
            </Text>
          </View>
        ) : null}
        <View
          onLayout={(event) =>
            setInputLayout({
              height: Math.max(180, event.nativeEvent.layout.height),
              width: Math.max(220, event.nativeEvent.layout.width),
            })
          }
          style={{ minHeight: 164 }}
        >
          <TextInput
            accessibilityLabel="Journal writing space"
            multiline
            onChangeText={handleTextChange}
            onFocus={() => setWritingSignal((value) => value + 1)}
            onKeyPress={handleKeyPress}
            onSelectionChange={handleSelectionChange}
            placeholder={"What's on your heart right now?\nWrite freely. No pressure. No rules."}
            placeholderTextColor={journalColors.muted}
            selectionColor={journalColors.sageDeep}
            style={{
              backgroundColor: "transparent",
              color: journalColors.ink,
              fontFamily: meadowTheme.fonts.body,
              fontSize: 15,
              lineHeight: 24,
              minHeight: 150,
              paddingBottom: 58,
              textAlignVertical: "top",
            }}
            value={draft}
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
        <Image source={hydrangeaCorner} contentFit="contain" style={{ bottom: 0, height: 72, left: 0, opacity: 0.58, position: "absolute", width: 72 }} />
        <View style={{ bottom: 10, position: "absolute", right: 12 }}>
          <InkwellAnimation saveSignal={saveSignal} writingSignal={writingSignal} />
        </View>
        <Text selectable={false} style={{ bottom: 14, color: journalColors.muted, fontFamily: meadowTheme.fonts.header, fontSize: 12, fontStyle: "italic", lineHeight: 16, position: "absolute", right: 82 }}>
          Be honest. Be kind.
        </Text>
      </View>

      {journalNotice ? (
        <Text selectable style={{ color: journalColors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, marginHorizontal: 24, marginTop: 12, textAlign: "center" }}>
          {journalNotice}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between", marginHorizontal: 20, marginTop: 16 }}>
        <JournalButton label="Get a Prompt" loading={promptLoading} onPress={handlePromptPress} primary />
        <JournalButton label={savingEntry ? "Saving..." : "Save Entry"} disabled={!draft.trim() || savingEntry} onPress={handleSaveEntry} />
      </View>

      {meadow.loading ? null : (
        <View style={{ gap: 12, marginHorizontal: 20, marginTop: 20 }}>
          <SmallMemoryPanel title={gardenEntry.title} body={gardenEntry.body} button={gardenEntry.buttonLabel} onPress={() => router.push(gardenEntry.route as never)} />
          {archive.slice(0, 1).map((entry) => (
            <SmallMemoryPanel key={entry.id} title={entry.place} body={entry.text} button={entry.buttonLabel} onPress={() => router.push(entry.route as never)} />
          ))}
          {!archive.length ? <SmallMemoryPanel title="Your pages are blank and ready." body="What's on your heart today?" button={emptyState.buttonLabel} onPress={() => router.push(emptyState.route as never)} /> : null}
        </View>
      )}

      <View style={{ marginHorizontal: 20, marginTop: 24 }}>
        <Text selectable style={{ color: journalColors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 18, fontStyle: "italic", lineHeight: 26, textAlign: "center" }}>
          Past Entries
        </Text>
        <Image source={vineDivider} contentFit="contain" style={{ alignSelf: "center", height: 24, width: 160 }} />
        {previewEntries.length ? (
          previewEntries.map((entry) => <EntryPreviewRow key={entry.id} entry={entry} />)
        ) : (
          <Text selectable style={{ color: journalColors.muted, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 22, paddingVertical: 16, textAlign: "center" }}>
            Your saved pages will rest here.
          </Text>
        )}
        <Pressable accessibilityLabel="View all journal entries" accessibilityRole="button" onPress={() => router.push("/journal/archive" as never)} style={({ pressed }) => ({ alignSelf: "center", opacity: pressed ? 0.7 : 1, padding: 12 })}>
          <Text selectable={false} style={{ color: journalColors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 15, fontStyle: "italic", lineHeight: 22 }}>
            View all entries &gt;
          </Text>
        </Pressable>
      </View>

      <View style={{ marginHorizontal: 20, marginTop: 8 }}>
        <Pressable accessibilityLabel="My Mood Map" accessibilityRole="button" onPress={() => setMoodHistoryVisible((value) => !value)} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}>
          <Text selectable style={{ color: journalColors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 28, textAlign: "center" }}>
            My Mood Map
          </Text>
          <Text selectable style={{ color: journalColors.muted, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
            A quiet record of how the days have felt.
          </Text>
        </Pressable>
        {moodHistoryVisible ? <MoodHistoryView refreshKey={historyRefreshKey} /> : null}
      </View>

      <View style={{ alignItems: "center", marginTop: 22, paddingHorizontal: 20 }}>
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
          <Image source={hedgehogFooter} contentFit="contain" style={{ height: 46, opacity: 0.6, width: 56 }} />
          <Image source={journalBookPreview} contentFit="contain" style={{ height: 86, opacity: 0.8, width: 154 }} />
          <Image source={inkwellAsset} contentFit="contain" style={{ height: 46, opacity: 0.6, width: 46 }} />
        </View>
        <Text selectable style={{ color: journalColors.muted, fontFamily: meadowTheme.fonts.header, fontSize: 15, fontStyle: "italic", lineHeight: 22, marginTop: 8, textAlign: "center" }}>
          Write as if no one is reading. This is yours alone.
        </Text>
      </View>
      <View style={{ height: 0, overflow: "hidden" }}>
        <MeadowSceneImage sceneId="journal_home" accessibilityLabel="The Meadow journal page" />
      </View>
      <SuccessFlash message={flash} onDone={() => setFlash(null)} />
    </ScrollView>
  );
}

function JournalButton({ disabled, label, loading, onPress, primary }: { disabled?: boolean; label: string; loading?: boolean; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: primary ? journalColors.sage : journalColors.panel,
        borderColor: journalColors.sage,
        borderRadius: 12,
        borderWidth: primary ? 0 : 1.5,
        flex: 1,
        height: 50,
        justifyContent: "center",
        opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
      })}
    >
      {loading ? (
        <QuillWritingAnimation loading />
      ) : (
        <Text selectable={false} style={{ color: primary ? journalColors.parchment : journalColors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 16, lineHeight: 22 }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function EntryPreviewRow({ entry }: { entry: StoredJournalEntry }) {
  return (
    <View style={{ alignItems: "center", borderBottomColor: journalColors.border, borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 68, paddingVertical: 10 }}>
      <Image source={entry.mood ? moodIcons[entry.mood] : vineDivider} contentFit="cover" style={{ borderRadius: 12, height: 28, overflow: "hidden", width: 28 }} />
      <View style={{ flex: 1 }}>
        <Text selectable style={{ color: journalColors.muted, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
          {formatDate(entry.created_at)}
        </Text>
        <Text numberOfLines={1} selectable style={{ color: journalColors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
          {entry.body}
        </Text>
      </View>
      <Text selectable={false} style={{ color: journalColors.muted, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 24 }}>
        &gt;
      </Text>
    </View>
  );
}

function SmallMemoryPanel({ body, button, onPress, title }: { body: string; button: string; onPress: () => void; title: string }) {
  return (
    <View style={{ backgroundColor: journalColors.panel, borderColor: journalColors.border, borderRadius: 14, borderWidth: 1, padding: 14 }}>
      <Text selectable style={{ color: journalColors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 26 }}>
        {title}
      </Text>
      <Text selectable style={{ color: journalColors.muted, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, marginTop: 4 }}>
        {body}
      </Text>
      <Pressable accessibilityLabel={button} accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ alignSelf: "flex-start", opacity: pressed ? 0.72 : 1, paddingVertical: 8 })}>
        <Text selectable={false} style={{ color: journalColors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 15, lineHeight: 21 }}>
          {button}
        </Text>
      </Pressable>
    </View>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
