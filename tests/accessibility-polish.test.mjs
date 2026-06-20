import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const inputFiles = [
  "app/auth.tsx",
  "app/evergreen-tree.tsx",
  "components/frozen-ground-ritual-screen.tsx",
  "components/storm-garden-ritual-screen.tsx",
  "components/crossroads-ritual-screen.tsx",
  "components/moors-ritual-screen.tsx",
  "components/first-bloom-ritual-screen.tsx",
];

const loadingFiles = [
  "app/(tabs)/index.tsx",
  "app/(tabs)/journal.tsx",
  "app/(tabs)/chapters.tsx",
  "app/(tabs)/hearth.tsx",
  "app/evergreen-tree.tsx",
  "app/frozen-ground.tsx",
  "app/storm-garden.tsx",
  "app/crossroads.tsx",
  "app/the-moors.tsx",
  "app/first-bloom.tsx",
  "app/memory-garden.tsx",
  "components/frozen-ground-ritual-screen.tsx",
  "components/storm-garden-ritual-screen.tsx",
  "components/crossroads-ritual-screen.tsx",
  "components/moors-ritual-screen.tsx",
  "components/first-bloom-ritual-screen.tsx",
];

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

test("all Meadow text fields have explicit accessible labels", () => {
  for (const file of inputFiles) {
    const source = readFileSync(file, "utf8");

    assert.equal(
      count(source, /<TextInput/g),
      count(source, /<TextInput[\s\S]*?accessibilityLabel=/g),
      `${file} should label every text field`
    );
  }
});

test("all Meadow loading indicators tell the listener what is being restored", () => {
  for (const file of loadingFiles) {
    const source = readFileSync(file, "utf8");

    assert.equal(
      count(source, /<ActivityIndicator/g),
      count(source, /<ActivityIndicator[\s\S]*?accessibilityLabel=/g),
      `${file} should label every loading state`
    );
  }
});

test("shared touch controls expose labels, hints, and forgiving touch targets", () => {
  const buttonSource = readFileSync("components/meadow-button.tsx", "utf8");
  const chapterMapSource = readFileSync("components/chapter-map.tsx", "utf8");
  const dividerSource = readFileSync("components/meadow-screen.tsx", "utf8");
  const imageSource = readFileSync("components/meadow-scene-image.tsx", "utf8");
  const profileSource = readFileSync("app/(tabs)/profile.tsx", "utf8");

  assert.match(buttonSource, /accessibilityLabel=\{accessibilityLabel \?\? label\}/);
  assert.match(buttonSource, /accessibilityHint=\{accessibilityHint\}/);
  assert.match(buttonSource, /hitSlop=\{8\}/);
  assert.match(chapterMapSource, /accessibilityLabel=\{`\$\{chapter\.title\}\. \$\{description\}`\}/);
  assert.match(chapterMapSource, /accessibilityHint=\{enabled \? "Opens this chapter\." : "This chapter is not open yet\."\}/);
  assert.match(chapterMapSource, /hitSlop=\{6\}/);
  assert.match(profileSource, /<Switch[\s\S]*?accessibilityLabel=\{setting\.label\}/);
  assert.match(profileSource, /<Switch[\s\S]*?accessibilityHint="Keeps this profile setting available across visits\."/);
  assert.match(dividerSource, /accessible=\{false\}/);
  assert.match(dividerSource, /importantForAccessibility="no"/);
  assert.match(imageSource, /accessibilityRole="image"/);
});
