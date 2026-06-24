import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const uiFiles = [
  "app/_layout.tsx",
  "app/(tabs)/_layout.tsx",
  "app/(tabs)/index.tsx",
  "app/(tabs)/journal.tsx",
  "app/(tabs)/chapters.tsx",
  "app/(tabs)/hearth.tsx",
  "app/(tabs)/profile.tsx",
  "components/meadow-button.tsx",
  "components/meadow-screen.tsx",
  "components/meadow-scene-image.tsx",
  "components/chapter-map.tsx",
];

const themeSource = readFileSync("constants/meadow-theme.ts", "utf8");
const themeColors = Object.fromEntries(
  [...themeSource.matchAll(/(\w+): "(#[0-9A-Fa-f]{6})"/g)].map((match) => [match[1], match[2]])
);

test("app launch surfaces use the approved linen shell", () => {
  const appConfig = JSON.parse(readFileSync("app.json", "utf8")).expo;

  assert.equal(appConfig.userInterfaceStyle, "light");
  assert.equal(appConfig.orientation, "portrait");
  assert.equal(appConfig.splash.backgroundColor, themeColors.linen);
  assert.equal(appConfig.web.backgroundColor, themeColors.linen);
  assert.equal(appConfig.web.themeColor, themeColors.linen);
  assert.equal(appConfig.android.adaptiveIcon.backgroundColor, themeColors.linen);
});

test("core Meadow palette stays cool linen and avoids pure white or gold UI chrome", () => {
  assert.equal(themeColors.linen, "#E2DDD6");
  assert.equal(themeColors.linenDeep, "#E8E2D6");
  assert.equal(themeColors.panel, "#ECE6DA");
  assert.equal(themeColors.panelDeep, "#E8E2D6");

  for (const [name, color] of Object.entries(themeColors)) {
    assert.doesNotMatch(color, /^#fff(?:fff)?$/i, `${name} should not be pure white`);
    assert.doesNotMatch(color, /^#(?:ffd700|daa520|ffbf00|ffc107)$/i, `${name} should not be gold or amber`);
  }
});

test("core UI files use Meadow theme colors and serif fonts instead of hardcoded chrome", () => {
  const combined = uiFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(combined, /#[0-9a-fA-F]{3,8}/);
  assert.doesNotMatch(combined, /fontFamily:\s*["'](?!Cormorant Garamond|Lora)[^"']+["']/);
  assert.doesNotMatch(combined, /Arial|Helvetica|Roboto|System|sans-serif/i);
  assert.doesNotMatch(combined, /white|yellow|amber|gold/i);
});

test("Meadow UI work starts from place-first constitution, not placeholder generation", () => {
  const constitution = readFileSync("AGENTS.md", "utf8");

  assert.match(constitution, /Build Place to Composition to Experience to Components/);
  assert.match(constitution, /The user forgets React Native exists/);
  assert.equal(existsSync("scripts/generate-placeholder-assets.py"), false);
});
