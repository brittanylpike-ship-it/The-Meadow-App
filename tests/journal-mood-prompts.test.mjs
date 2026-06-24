import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const moods = ["heavy", "tender", "okay", "quiet", "hopeful", "numb"];

test("Journal prompt library includes every approved mood with hundreds of prompts", () => {
  const source = readFileSync("data/journal-prompts.ts", "utf8");

  assert.match(source, /export type Mood =/);
  for (const mood of moods) {
    assert.match(source, new RegExp(`${mood}: \\[`));
    assert.match(source, new RegExp(`${mood}: require\\("\\.\\./assets/illustrations/mood-${mood}\\.png"\\)`));
  }

  const promptCount = source.split("\n").filter((line) => /^\s{4}"[^"]+",?$/.test(line)).length;
  assert.ok(promptCount >= 390, `expected a large prompt library, found ${promptCount}`);
  assert.match(source, /function getPrompt/);
  assert.match(source, /usedIndices/);
});

test("Journal screen wires mood tiles, prompt generation, saving, and mood history", () => {
  const journalSource = readFileSync("app/(tabs)/journal.tsx", "utf8");
  const historySource = readFileSync("components/MoodHistoryView.tsx", "utf8");
  const hookSource = readFileSync("hooks/useMoodHistory.ts", "utf8");

  assert.match(journalSource, /MOODS\.map/);
  assert.match(journalSource, /setSelectedMood/);
  assert.match(journalSource, /getPrompt\(selectedMood\)/);
  assert.match(journalSource, /Save Entry/);
  assert.match(journalSource, /mood: selectedMood/);
  assert.match(journalSource, /MoodHistoryView/);
  assert.match(historySource, /useMoodHistory/);
  assert.match(historySource, /MOOD_ICONS/);
  assert.match(hookSource, /journal_entries/);
  assert.match(hookSource, /body/);
  assert.match(hookSource, /mood/);
  assert.match(hookSource, /hasSupabaseConfig/);
});

test("Supabase migration adds mood to journal entries", () => {
  const migrationPath = "supabase/migrations/202606160001_journal_entry_mood.sql";

  assert.equal(existsSync(migrationPath), true);
  assert.match(readFileSync(migrationPath, "utf8"), /alter table public\.journal_entries add column if not exists mood text;/);
});
