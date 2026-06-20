import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { DeviceEventEmitter } from "react-native";

import { companions } from "@/data/companions";
import type { CompanionStateMap } from "@/hooks/useCompanionState";
import { useCompanionState } from "@/hooks/useCompanionState";
import { type ChapterProgress, useChapterProgress } from "@/hooks/useChapterProgress";
import { useJournalStats } from "@/hooks/useJournalStats";
import { useProfile } from "@/hooks/useProfile";

const DISPLAY_NAME_KEY = "meadow_display_name";
const AUDIO_KEY = "meadow_audio_enabled";
const ANIMATIONS_KEY = "meadow_animations_enabled";

export type ProfileContext = {
  animationsEnabled: boolean;
  audioEnabled: boolean;
  companionState: CompanionStateMap;
  displayName: string;
  journalEntryCount: number;
  journalStats: ReturnType<typeof useJournalStats>;
  lastChapterName: string | null;
  lastRitualName: string | null;
  loading: boolean;
  mostPresentCompanion: string;
  profile: ReturnType<typeof useProfile>;
  progress: ChapterProgress[];
  refresh: () => Promise<void>;
  saveDisplayName: (value: string) => Promise<void>;
  setAnimationsEnabled: (value: boolean) => Promise<void>;
  setAudioEnabled: (value: boolean) => Promise<void>;
  totalRitualsCompleted: number;
};

export function useProfileContext(): ProfileContext {
  const profile = useProfile();
  const journalStats = useJournalStats();
  const chapterProgress = useChapterProgress();
  const companionsState = useCompanionState();
  const [displayName, setDisplayName] = React.useState("");
  const [audioEnabled, setAudioEnabledState] = React.useState(true);
  const [animationsEnabled, setAnimationsEnabledState] = React.useState(true);

  const restoreLocalSettings = React.useCallback(async () => {
    const [storedName, storedAudio, storedAnimations] = await Promise.all([
      AsyncStorage.getItem(DISPLAY_NAME_KEY),
      AsyncStorage.getItem(AUDIO_KEY),
      AsyncStorage.getItem(ANIMATIONS_KEY),
    ]);
    setDisplayName(storedName ?? "");
    setAudioEnabledState(storedAudio === null ? true : storedAudio === "true");
    setAnimationsEnabledState(storedAnimations === null ? true : storedAnimations === "true");
  }, []);

  React.useEffect(() => {
    void restoreLocalSettings();
  }, [restoreLocalSettings]);

  const totalRitualsCompleted = chapterProgress.progress.reduce((total, chapter) => total + chapter.completedRituals.length, 0);
  const currentChapter = [...chapterProgress.progress].reverse().find((chapter) => chapter.completedRituals.length > 0 || chapter.isUnlocked);
  const lastChapterName = currentChapter ? chapterName(currentChapter.chapterNumber) : null;
  const lastRitualName = currentChapter?.completedRituals.at(-1) ? ritualName(currentChapter.completedRituals.at(-1)!) : null;
  const mostPresentCompanion =
    companions
      .map((companion) => ({ companion, rituals: companionsState.state[companion.id]?.ritualsWitnessed ?? 0 }))
      .sort((left, right) => right.rituals - left.rituals)[0]?.companion.name ?? "Chickadee";

  async function saveDisplayName(value: string) {
    const next = value.trim();
    setDisplayName(next);
    if (next) {
      await AsyncStorage.setItem(DISPLAY_NAME_KEY, next);
    } else {
      await AsyncStorage.removeItem(DISPLAY_NAME_KEY);
    }
  }

  async function setAudioEnabled(value: boolean) {
    setAudioEnabledState(value);
    await AsyncStorage.setItem(AUDIO_KEY, String(value));
    DeviceEventEmitter.emit("meadow_audio_enabled", value);
  }

  async function setAnimationsEnabled(value: boolean) {
    setAnimationsEnabledState(value);
    await AsyncStorage.setItem(ANIMATIONS_KEY, String(value));
    DeviceEventEmitter.emit("meadow_animations_enabled", value);
  }

  async function refresh() {
    await Promise.all([profile.refresh(), journalStats.refresh(), restoreLocalSettings()]);
    chapterProgress.refresh();
  }

  return {
    animationsEnabled,
    audioEnabled,
    companionState: companionsState.state,
    displayName,
    journalEntryCount: journalStats.stats.journalCount,
    journalStats,
    lastChapterName,
    lastRitualName,
    loading: profile.loading || journalStats.loading || chapterProgress.loading || !companionsState.ready,
    mostPresentCompanion,
    profile,
    progress: chapterProgress.progress,
    refresh,
    saveDisplayName,
    setAnimationsEnabled,
    setAudioEnabled,
    totalRitualsCompleted,
  };
}

export async function clearMeadowData() {
  const keys = await AsyncStorage.getAllKeys();
  const meadowKeys = keys.filter((key) => key.startsWith("meadow_") || key.startsWith("profile_setting_"));
  if (meadowKeys.length) {
    await AsyncStorage.multiRemove(meadowKeys);
  }
}

function chapterName(chapterNumber: number) {
  return ["Frozen Ground", "Storm Garden", "Crossroads", "The Moors", "First Bloom"][Math.max(0, Math.min(4, chapterNumber - 1))];
}

function ritualName(value: string) {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
