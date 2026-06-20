import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

import { type Companion, companions, getCompanionById } from "@/data/companions";

const STORAGE_KEY = "meadow_companion_data";

export type CompanionRecord = {
  ritualsWitnessed: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  notesUnlocked: number;
};

export type CompanionStateMap = Record<string, CompanionRecord>;

export type WitnessedNote = {
  companion: Companion;
  phrase: string;
};

function emptyRecord(): CompanionRecord {
  return {
    firstSeenAt: null,
    lastSeenAt: null,
    notesUnlocked: 0,
    ritualsWitnessed: 0,
  };
}

function createInitialState(): CompanionStateMap {
  return Object.fromEntries(companions.map((companion) => [companion.id, emptyRecord()]));
}

function normalizeState(value: CompanionStateMap | null): CompanionStateMap {
  const initial = createInitialState();
  if (!value) {
    return initial;
  }

  return Object.fromEntries(
    companions.map((companion) => {
      const existing = value[companion.id] ?? emptyRecord();
      return [companion.id, { ...emptyRecord(), ...existing }];
    })
  );
}

export function getTotalRitualsWitnessed(state: CompanionStateMap) {
  return companions
    .filter((companion) => companion.id !== "chickadee")
    .reduce((total, companion) => Math.max(total, state[companion.id]?.ritualsWitnessed ?? 0), 0);
}

export function getCompanionPresenceOpacity(companion: Companion, state: CompanionStateMap, totalRitualsWitnessed = getTotalRitualsWitnessed(state)) {
  if (companion.id === "chickadee") {
    return totalRitualsWitnessed >= companion.presenceThreshold ? 0.45 : 0;
  }

  const witnessed = state[companion.id]?.ritualsWitnessed ?? 0;
  if (companion.presenceThreshold === 0 && witnessed === 0) {
    return 0.35;
  }

  if (witnessed < companion.presenceThreshold) {
    return 0;
  }

  if (witnessed <= 0) {
    return 0;
  }

  if (witnessed === 1) {
    return 0.35;
  }

  if (witnessed === 2) {
    return 0.55;
  }

  if (witnessed === 3) {
    return 0.72;
  }

  return 0.88;
}

export function useCompanionState() {
  const [state, setState] = React.useState<CompanionStateMap>(() => createInitialState());
  const [ready, setReady] = React.useState(false);
  const stateRef = React.useRef(state);

  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as CompanionStateMap) : null;
        if (mounted) {
          const normalized = normalizeState(parsed);
          stateRef.current = normalized;
          setState(normalized);
        }
      } catch {
        if (mounted) {
          const initial = createInitialState();
          stateRef.current = initial;
          setState(initial);
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const recordRitualWitnessed = React.useCallback(async (companionIds: string[], noteCompanionId: string) => {
    const now = new Date().toISOString();
    const uniqueIds = Array.from(new Set(companionIds));
    const noteCompanion = getCompanionById(noteCompanionId);
    let note: WitnessedNote | null = null;
    const next = normalizeState(stateRef.current);

    for (const id of uniqueIds) {
      const record = next[id] ?? emptyRecord();
      next[id] = {
        ...record,
        firstSeenAt: record.firstSeenAt ?? now,
        lastSeenAt: now,
        ritualsWitnessed: record.ritualsWitnessed + 1,
      };
    }

    if (noteCompanion) {
      const record = next[noteCompanion.id] ?? emptyRecord();
      const phrase = noteCompanion.witnessedPhrases[record.notesUnlocked % noteCompanion.witnessedPhrases.length];
      next[noteCompanion.id] = {
        ...record,
        firstSeenAt: record.firstSeenAt ?? now,
        lastSeenAt: now,
        notesUnlocked: record.notesUnlocked + 1,
        ritualsWitnessed: uniqueIds.includes(noteCompanion.id) ? next[noteCompanion.id].ritualsWitnessed : record.ritualsWitnessed + 1,
      };
      note = { companion: noteCompanion, phrase };
    }

    stateRef.current = next;
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);

    return note;
  }, []);

  return {
    ready,
    recordRitualWitnessed,
    state,
    totalRitualsWitnessed: getTotalRitualsWitnessed(state),
  };
}
