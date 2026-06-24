import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ChapterSlug } from "@/constants/chapter-experience";
import { getPrompt, type Mood } from "@/data/journal-prompts";

export type PromptContext = {
  mood: Mood | null;
  lastChapterVisited: ChapterSlug | null;
  lastRitualCompleted: string | null;
  lastCompanionWitnessed: string | null;
  entryCount: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
};

type StoredJournalEntry = {
  id: string;
  body: string;
  mood: Mood | null;
  prompt?: string | null;
  created_at: string;
};

export async function gatherJournalPromptContext(mood: Mood | null): Promise<PromptContext> {
  const [lastChapterVisited, lastRitualCompleted, companionData, storedEntries] = await Promise.all([
    AsyncStorage.getItem("meadow_last_chapter"),
    AsyncStorage.getItem("meadow_last_ritual"),
    AsyncStorage.getItem("meadow_companion_data"),
    AsyncStorage.getItem("meadow_journal_entries"),
  ]);

  return {
    entryCount: readEntryCount(storedEntries),
    lastChapterVisited: normalizeChapter(lastChapterVisited),
    lastCompanionWitnessed: readLastCompanion(companionData),
    lastRitualCompleted,
    mood,
    timeOfDay: getTimeOfDay(new Date().getHours()),
  };
}

export async function fetchJournalPrompt(mood: Mood): Promise<string> {
  await gatherJournalPromptContext(mood);
  return getPrompt(mood);
}

function readEntryCount(raw: string | null) {
  if (!raw) {
    return 0;
  }

  try {
    const entries = JSON.parse(raw) as StoredJournalEntry[];
    return Array.isArray(entries) ? entries.length : 0;
  } catch {
    return 0;
  }
}

function readLastCompanion(raw: string | null) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, { lastSeenAt?: string | null }>;
    return Object.entries(parsed)
      .filter(([, value]) => Boolean(value.lastSeenAt))
      .sort(([, a], [, b]) => String(b.lastSeenAt).localeCompare(String(a.lastSeenAt)))[0]?.[0] ?? null;
  } catch {
    return null;
  }
}

function normalizeChapter(value: string | null): ChapterSlug | null {
  if (
    value === "frozen-ground" ||
    value === "storm-garden" ||
    value === "crossroads" ||
    value === "the-moors" ||
    value === "first-bloom"
  ) {
    return value;
  }

  return null;
}

function getTimeOfDay(hour: number): PromptContext["timeOfDay"] {
  if (hour < 5) {
    return "night";
  }
  if (hour < 12) {
    return "morning";
  }
  if (hour < 18) {
    return "afternoon";
  }
  if (hour < 22) {
    return "evening";
  }
  return "night";
}
