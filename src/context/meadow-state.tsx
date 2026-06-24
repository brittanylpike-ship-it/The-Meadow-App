'use client';

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type JournalEntry = {
  body: string;
  date: string;
  memorySeedPlanted?: boolean;
  mood: string;
  seedType?: string;
  usedPrompt?: string;
};

export type ReflectionItem = {
  createdAt: string;
  date: string;
  favorite?: boolean;
  id: string;
  inKeepsakeBox?: boolean;
  isPrivate: true;
  mood?: string;
  rippleColor?: string;
  source: 'Reflection Pool';
  text: string;
  title: string;
  type: 'reflection';
  x: number;
  y: number;
};

export type SharedKeepsake = {
  createdAt: string;
  date: string;
  description: string;
  favorite?: boolean;
  id: string;
  isPrivate: true;
  sourceId?: string;
  source?: string;
  sourceType?: 'reflection_pool';
  tags: string[];
  title: string;
  type: 'reflection' | 'text memory';
};

export type MeadowSettings = {
  ambienceEnabled: boolean;
  reduceMotion: boolean;
  textSize: 'standard' | 'large';
};

type MeadowState = {
  entries: JournalEntry[];
  keepsakes: SharedKeepsake[];
  reflections: ReflectionItem[];
  settings: MeadowSettings;
  savedPrompts: number[];
  saveEntry: (entry: JournalEntry) => void;
  savePrompt: (promptId: number) => void;
  addReflection: (reflection: ReflectionItem) => void;
  deleteReflection: (reflectionId: string) => void;
  updateReflection: (reflectionId: string, text: string) => void;
  toggleReflectionFavorite: (reflectionId: string) => void;
  addReflectionToKeepsake: (reflectionId: string) => void;
  removeReflectionFromKeepsake: (reflectionId: string) => void;
  toggleReduceMotion: () => void;
  setTextSize: (size: MeadowSettings['textSize']) => void;
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const starterEntries: JournalEntry[] = [
  { body: 'I missed the sound of their laugh at breakfast, then the sun warmed the table.', date: 'May 18', mood: 'Tender' },
  { body: 'A small moment of peace arrived on the walk home.', date: 'May 12', mood: 'Quiet' },
];

const starterSettings: MeadowSettings = {
  ambienceEnabled: false,
  reduceMotion: false,
  textSize: 'standard',
};

const MeadowStateContext = createContext<MeadowState | null>(null);

export function MeadowStateProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<JournalEntry[]>(starterEntries);
  const [keepsakes, setKeepsakes] = useState<SharedKeepsake[]>([]);
  const [reflections, setReflections] = useState<ReflectionItem[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<number[]>([]);
  const [settings, setSettings] = useState<MeadowSettings>(starterSettings);

  useEffect(() => {
    setEntries(load('the-meadow:journal-entries', starterEntries));
    setKeepsakes(load('the-meadow:shared-keepsakes', []));
    setReflections(load('the-meadow:reflection-pool', []));
    setSavedPrompts(load('the-meadow:saved-prompts', []));
    setSettings(load('the-meadow:settings', starterSettings));
  }, []);

  useEffect(() => { save('the-meadow:journal-entries', entries); }, [entries]);
  useEffect(() => { save('the-meadow:shared-keepsakes', keepsakes); }, [keepsakes]);
  useEffect(() => { save('the-meadow:reflection-pool', reflections); }, [reflections]);
  useEffect(() => { save('the-meadow:saved-prompts', savedPrompts); }, [savedPrompts]);
  useEffect(() => { save('the-meadow:settings', settings); }, [settings]);

  const saveEntry = useCallback((entry: JournalEntry) => setEntries(c => [entry, ...c]), []);
  const savePrompt = useCallback((id: number) => setSavedPrompts(c => c.includes(id) ? c : [...c, id]), []);
  const addReflection = useCallback((r: ReflectionItem) => setReflections(c => [r, ...c]), []);
  const deleteReflection = useCallback((id: string) => {
    setReflections(c => c.filter(r => r.id !== id));
    setKeepsakes(c => c.filter(k => k.id !== `reflection-keepsake-${id}`));
  }, []);
  const updateReflection = useCallback((id: string, text: string) =>
    setReflections(c => c.map(r => r.id === id ? { ...r, text } : r)), []);
  const toggleReflectionFavorite = useCallback((id: string) =>
    setReflections(c => c.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r)), []);
  const addReflectionToKeepsake = useCallback((reflectionId: string) => {
    setReflections(c => c.map(r => r.id === reflectionId ? { ...r, inKeepsakeBox: true } : r));
    setKeepsakes(c => {
      if (c.some(k => k.id === `reflection-keepsake-${reflectionId}`)) return c;
      const reflection = reflections.find(r => r.id === reflectionId);
      if (!reflection) return c;
      return [{
        createdAt: new Date().toISOString(),
        date: reflection.date,
        description: reflection.text,
        id: `reflection-keepsake-${reflectionId}`,
        isPrivate: true,
        sourceId: reflection.id,
        source: 'Reflection Pool',
        sourceType: 'reflection_pool',
        tags: ['reflection', 'private'],
        title: reflection.title,
        type: 'reflection',
      }, ...c];
    });
  }, [reflections]);
  const removeReflectionFromKeepsake = useCallback((id: string) => {
    setReflections(c => c.map(r => r.id === id ? { ...r, inKeepsakeBox: false } : r));
    setKeepsakes(c => c.filter(k => k.id !== `reflection-keepsake-${id}`));
  }, []);

  const value = useMemo(() => ({
    entries, keepsakes, reflections, settings, savedPrompts,
    saveEntry, savePrompt, addReflection, deleteReflection, updateReflection,
    toggleReflectionFavorite, addReflectionToKeepsake, removeReflectionFromKeepsake,
    toggleReduceMotion: () => setSettings(s => ({ ...s, reduceMotion: !s.reduceMotion })),
    setTextSize: (textSize: MeadowSettings['textSize']) => setSettings(s => ({ ...s, textSize })),
  }), [entries, keepsakes, reflections, settings, savedPrompts, saveEntry, savePrompt,
    addReflection, deleteReflection, updateReflection, toggleReflectionFavorite,
    addReflectionToKeepsake, removeReflectionFromKeepsake]);

  return <MeadowStateContext.Provider value={value}>{children}</MeadowStateContext.Provider>;
}

export function useMeadowState() {
  const state = useContext(MeadowStateContext);
  if (!state) throw new Error('useMeadowState must be used inside MeadowStateProvider');
  return state;
}
