import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const tabFiles = [
  "app/(tabs)/index.tsx",
  "app/(tabs)/journal.tsx",
  "app/(tabs)/chapters.tsx",
  "app/memory-garden.tsx",
  "app/(tabs)/hearth.tsx",
  "app/(tabs)/profile.tsx",
];

test("primary tabs keep the approved six-part shell", () => {
  const tabLayout = readFileSync("app/(tabs)/_layout.tsx", "utf8");
  const themeSource = readFileSync("constants/meadow-theme.ts", "utf8");
  const tabTitles = [...tabLayout.matchAll(/title: "([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(tabTitles, ["Home", "Journal", "Chapters", "Memory Garden", "Hearth", "Profile"]);
  assert.match(themeSource, /"Memory Garden"/);
});

test("six-part shell is mounted outside ritual routes", () => {
  const rootLayout = readFileSync("app/_layout.tsx", "utf8");
  const tabBar = readFileSync("components/meadow-tab-bar.tsx", "utf8");

  assert.match(rootLayout, /<MeadowTabBar \/>/);
  assert.match(tabBar, /tabLabels\[0\]/);
  assert.match(tabBar, /tabLabels\[5\]/);
  assert.match(tabBar, /memory-garden-icon\.png/);
  assert.match(tabBar, /\/shattered-mirror/);
  assert.match(tabBar, /\/integration/);
});

test("primary tabs use rendered or approved illustrated assets", () => {
  const sourceByFile = new Map(tabFiles.map((file) => [file, readFileSync(file, "utf8")]));

  assert.match(sourceByFile.get("app/(tabs)/index.tsx"), /sceneId="home"/);
  assert.match(sourceByFile.get("app/(tabs)/journal.tsx"), /sceneId="journal_home"/);
  assert.match(sourceByFile.get("app/(tabs)/chapters.tsx"), /<ChapterMap/);
  assert.match(readFileSync("screens/MemoryGarden/ChapterSelectionScreen.tsx", "utf8"), /memory-garden-landscape\.png/);
  assert.match(sourceByFile.get("app/(tabs)/hearth.tsx"), /hearth-panels\.png/);
  assert.match(sourceByFile.get("app/(tabs)/profile.tsx"), /profile-oval-frame\.png/);
});

test("shared tab surfaces read as illustrated plaques and chapter landmarks", () => {
  const screenSource = readFileSync("components/meadow-screen.tsx", "utf8");
  const chapterMapSource = readFileSync("components/chapter-map.tsx", "utf8");

  assert.match(screenSource, /vine-divider\.png/);
  assert.match(screenSource, /boxShadow/);
  assert.match(chapterMapSource, /chapter-frozen-ground\.png/);
  assert.match(chapterMapSource, /chapter-storm-garden\.png/);
  assert.match(chapterMapSource, /chapter-crossroads\.png/);
  assert.match(chapterMapSource, /chapter-the-moors\.png/);
  assert.match(chapterMapSource, /chapter-first-bloom\.png/);
  assert.match(chapterMapSource, /contentFit="contain"/);
});

test("Chapters tab stays world navigation, not a reading layout", () => {
  const chaptersSource = readFileSync("app/(tabs)/chapters.tsx", "utf8");
  const chapterMapSource = readFileSync("components/chapter-map.tsx", "utf8");

  assert.match(chaptersSource, /<ChapterMap mode="world"/);
  assert.doesNotMatch(chaptersSource, /MeadowScreen|MeadowPanel|getChapterReturnIntro/);
  assert.doesNotMatch(chaptersSource, /intro\.title|intro\.body|intro\.subtitle/);
  assert.match(chapterMapSource, /chapters-approved-home\.png/);
  assert.match(chapterMapSource, /approvedChaptersAspectRatio/);
  assert.equal(existsSync("assets/illustrations/chapters-approved-home.png"), true);
});

test("primary tab copy avoids generic app status language", () => {
  const combined = tabFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(
    combined,
    /"Memory sync"|"Continue journey"|"dashboard"|"progress"|"streak"|"achievement"|"XP"|"level"|"badge"|"leaderboard"/i
  );
});

test("shared Meadow surfaces use the approved mushroom ivory and forest invitation palette", () => {
  const themeSource = readFileSync("constants/meadow-theme.ts", "utf8");
  const buttonSource = readFileSync("components/meadow-button.tsx", "utf8");

  assert.match(themeSource, /linen: "#E2DDD6"/);
  assert.match(themeSource, /ink: "#3B2A1A"/);
  assert.match(themeSource, /sage: "#3D5A3E"/);
  assert.match(themeSource, /header: "Cormorant Garamond"/);
  assert.match(themeSource, /body: "Lora"/);
  assert.match(buttonSource, /borderRadius: meadowTheme\.radius\.control/);
  assert.match(buttonSource, /meadowTheme\.colors\.sage/);
});

test("bottom navigation stays six-tab and uses illustrated Meadow icons", () => {
  const tabBarSource = readFileSync("components/meadow-tab-bar.tsx", "utf8");

  assert.match(tabBarSource, /Image/);
  assert.match(tabBarSource, /assets\/icons\/home-icon\.png/);
  assert.match(tabBarSource, /assets\/icons\/journal-icon\.png/);
  assert.match(tabBarSource, /assets\/icons\/chapters-icon\.png/);
  assert.match(tabBarSource, /assets\/icons\/memory-garden-icon\.png/);
  assert.match(tabBarSource, /assets\/icons\/hearth-icon\.png/);
  assert.match(tabBarSource, /assets\/icons\/profile-icon\.png/);
  assert.equal(existsSync("assets/icons/home-icon.png"), true);
  assert.equal(existsSync("assets/icons/journal-icon.png"), true);
  assert.equal(existsSync("assets/icons/chapters-icon.png"), true);
  assert.equal(existsSync("assets/icons/memory-garden-icon.png"), true);
  assert.equal(existsSync("assets/icons/hearth-icon.png"), true);
  assert.equal(existsSync("assets/icons/profile-icon.png"), true);
});

test("auth screen keeps locked copy and no visible tooltip copy", () => {
  const authSource = readFileSync("app/auth.tsx", "utf8");
  const authCopySource = readFileSync("features/auth/auth-gate-copy.mjs", "utf8");
  const rootLayout = readFileSync("app/_layout.tsx", "utf8");
  const combined = `${authSource}\n${authCopySource}`;

  assert.match(authSource, /title: "The Meadow"/);
  assert.match(authSource, /subtitle: "A private place that remembers what you leave with care\."/);
  assert.match(authSource, /formTitle: "Begin here"/);
  assert.match(authSource, /emailPlaceholder: "Email"/);
  assert.match(authSource, /passwordPlaceholder: "Password"/);
  assert.match(authSource, /primaryButton: "Enter The Meadow"/);
  assert.match(authSource, /secondaryButton: "I already have a place here"/);
  assert.doesNotMatch(combined, /A living storybook journey\./);
  assert.doesNotMatch(combined, /The Meadow auth title page/);
  assert.doesNotMatch(authSource, /\btitle=/);
  assert.match(rootLayout, /<Stack\.Screen name="auth" options=\{\{ headerShown: false \}\}/);
  assert.match(authSource, /auth-entry\.png/);
  assert.doesNotMatch(authSource, /rendered\/home\.png/);
  assert.equal(existsSync("assets/art/auth-entry.png"), true);
});
