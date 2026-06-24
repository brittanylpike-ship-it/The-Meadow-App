import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const chapterScreens = ["frozen-ground", "storm-garden", "crossroads", "the-moors", "first-bloom"];

test("chapter progression hook builds on Meadow memory state and Supabase profile fields", () => {
  const hookPath = "hooks/useChapterProgress.ts";

  assert.equal(existsSync(hookPath), true);

  const source = readFileSync(hookPath, "utf8");

  assert.match(source, /export interface ChapterProgress/);
  assert.match(source, /export function useChapterProgress/);
  assert.match(source, /buildChapterProgress/);
  assert.match(source, /memoryObjects/);
  assert.match(source, /completedRituals/);
  assert.match(source, /unlockNextChapter/);
  assert.match(source, /current_chapter/);
  assert.match(source, /journey_complete/);
  assert.match(source, /from\("milestones"\)\.upsert/);
  assert.match(source, /hasSupabaseConfig/);
  assert.match(source, /devChapterProgress/);
  assert.doesNotMatch(source, /ritual_completions|completion_table|content:|is_private/);
});

test("chapter progression migration adds profile state and journey milestone storage", () => {
  const migrationPath = "supabase/migrations/202606160002_chapter_progression.sql";

  assert.equal(existsSync(migrationPath), true);

  const source = readFileSync(migrationPath, "utf8");

  assert.match(source, /alter table public\.profiles add column if not exists current_chapter integer/);
  assert.match(source, /alter table public\.profiles add column if not exists journey_complete boolean/);
  assert.match(source, /create table if not exists public\.milestones/);
  assert.match(source, /unique \(user_id, key\)/);
  assert.match(source, /milestones are private/);
});

test("chapter hub screens and overview consume shared chapter progress", () => {
  const overview = readFileSync("app/(tabs)/chapters.tsx", "utf8");
  const mapSource = readFileSync("components/chapter-map.tsx", "utf8");
  const sectionSource = readFileSync("components/chapter-progress-section.tsx", "utf8");

  assert.match(overview, /useChapterProgress/);
  assert.match(overview, /chapterProgress/);
  assert.match(mapSource, /chapterProgress/);
  assert.match(mapSource, /rituals/);
  assert.match(mapSource, /Locked/);
  assert.match(mapSource, /Complete/);
  assert.match(sectionSource, /ChapterProgressSection/);
  assert.match(sectionSource, /completedRituals/);
  assert.match(sectionSource, /Begin/);
  assert.match(sectionSource, /Complete/);
  assert.match(sectionSource, /is now open/);
  assert.doesNotMatch(sectionSource, /#[0-9A-Fa-f]{6}|backgroundColor: "white"|color: "white"/);

  for (const screen of chapterScreens) {
    const source = readFileSync(`app/${screen}.tsx`, "utf8");
    assert.match(source, /useChapterProgress/);
    assert.match(source, /ChapterProgressSection/);
  }
});
