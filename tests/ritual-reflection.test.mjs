import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("Ritual reflection uses Meadow systems instead of pasted placeholder wiring", () => {
  const componentPath = "components/ritual-reflection.tsx";

  assert.equal(existsSync(componentPath), true);

  const source = readFileSync(componentPath, "utf8");

  assert.match(source, /export function RitualReflection/);
  assert.match(source, /AnimatedQuill/);
  assert.match(source, /MOOD_ORDER/);
  assert.match(source, /getPrompt\(selectedMood\)/);
  assert.match(source, /hasSupabaseConfig/);
  assert.match(source, /@\/services\/supabase/);
  assert.match(source, /from\("journal_entries"\)/);
  assert.match(source, /body: text\.trim\(\)/);
  assert.match(source, /mood: selectedMood/);
  assert.match(source, /chapterNumber/);
  assert.match(source, /resolvedChapterId/);
  assert.match(source, /chapter_id: resolvedChapterId/);
  assert.match(source, /ritual_id: ritualId/);
  assert.match(source, /meadowTheme\.colors/);
  assert.doesNotMatch(source, /from\("ritual_completions"\)|from\('ritual_completions'\)/);
  assert.doesNotMatch(source, /content: text|is_private|chapter: chapterNumber|@\/lib\/supabase|\.\.\/lib\/supabase/);
  assert.doesNotMatch(source, /backgroundColor: "white"|color: "white"|#[0-9A-Fa-f]{6}/);
});

test("Shared ritual screen is place-first and keeps existing route system intact", () => {
  const componentPath = "components/RitualScreen.tsx";

  assert.equal(existsSync(componentPath), true);

  const source = readFileSync(componentPath, "utf8");
  const layoutSource = readFileSync("app/_layout.tsx", "utf8");

  assert.match(source, /export function RitualScreen/);
  assert.match(source, /MeadowScreen/);
  assert.match(source, /MeadowPanel/);
  assert.match(source, /RitualReflection/);
  assert.match(source, /chapterId/);
  assert.match(source, /chapterNumber/);
  assert.match(source, /router\.back/);
  assert.match(source, /activityText/);
  assert.match(source, /accessibilityLabel="Ritual practice writing space"/);
  assert.match(source, /meadowTheme\.colors/);
  assert.doesNotMatch(source, /#[0-9A-Fa-f]{6}|backgroundColor: "white"|color: "white"|ritual_completions/);

  const registeredRitualRoutes = [
    "evergreen-tree",
    "frosted-window",
    "frozen-pond",
    "quiet-hour",
    "footprints",
    "lightning-tree",
    "thorn-patch",
    "floodwaters",
    "scorched-earth",
    "shattered-mirror",
    "worn-path",
    "offering",
    "candle",
    "searching-for-signs",
    "waiting-gate",
    "canopy-cloak",
    "mire",
    "bramble",
    "fog",
    "vanishing-path",
    "grounding",
    "opening",
    "anchoring",
    "emergence",
    "integration",
  ];

  for (const route of registeredRitualRoutes) {
    assert.match(layoutSource, new RegExp(`Stack\\.Screen name="${route}"`));
  }
});
