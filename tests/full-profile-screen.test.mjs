import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("Profile screen is rebuilt as the full Meadow profile place", () => {
  const source = readFileSync("app/(tabs)/profile.tsx", "utf8");

  assert.match(source, /useProfile/);
  assert.match(source, /useJournalStats/);
  assert.match(source, /useChapterProgress/);
  assert.match(source, /profile-hero\.png/);
  assert.match(source, /My Profile/);
  assert.match(source, /MY CURRENT CHAPTER/);
  assert.match(source, /RECENT ACTIVITY/);
  assert.match(source, /MY MILESTONES/);
  assert.match(source, /Support & Resources/);
  assert.match(source, /988 Suicide & Crisis Lifeline/);
  assert.match(source, /Find Local Support/);
  assert.match(source, /APP SETTINGS/);
  assert.match(source, /Manage Subscription/);
  assert.match(source, /OUR PROMISE/);
  assert.match(source, /Daily Ritual Reminder/);
  assert.match(source, /Private Journal/);
  assert.doesNotMatch(source, /backgroundColor: "white"|color: "white"/);
});

test("Profile data hooks use Supabase with gentle local fallbacks", () => {
  assert.equal(existsSync("hooks/useProfile.ts"), true);
  assert.equal(existsSync("hooks/useJournalStats.ts"), true);

  const profileHook = readFileSync("hooks/useProfile.ts", "utf8");
  const statsHook = readFileSync("hooks/useJournalStats.ts", "utf8");

  assert.match(profileHook, /from\("profiles"\)/);
  assert.match(profileHook, /current_chapter/);
  assert.match(profileHook, /hasSupabaseConfig/);
  assert.match(statsHook, /from\("journal_entries"\)/);
  assert.match(statsHook, /from\("milestones"\)/);
  assert.match(statsHook, /devJournalStats/);
  assert.match(statsHook, /journalCount: 12/);
  assert.match(statsHook, /daysActive: 8/);
  assert.match(statsHook, /milestoneCount: 3/);
});
