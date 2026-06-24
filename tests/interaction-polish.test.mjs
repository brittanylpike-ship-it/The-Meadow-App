import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const screens = [
  "app/(tabs)/journal.tsx",
  "app/tea-rooms.tsx",
  "app/post-office.tsx",
  "app/greenhouse.tsx",
  "app/courtyard.tsx",
  "app/reflection-pool.tsx",
  "app/keepsake-box.tsx",
  "app/(tabs)/profile.tsx",
];

function source(path) {
  return readFileSync(path, "utf8");
}

test("polish pass adds shared animated interaction components", () => {
  for (const path of ["components/SkeletonLoader.tsx", "components/PressCard.tsx", "components/SuccessFlash.tsx"]) {
    assert.equal(existsSync(path), true, `${path} should exist`);
  }

  assert.match(source("components/SkeletonLoader.tsx"), /Animated\.loop/);
  assert.match(source("components/PressCard.tsx"), /Animated\.spring/);
  assert.match(source("components/SuccessFlash.tsx"), /translateY/);
});

test("data-driven screens use refresh controls and shaped skeletons", () => {
  for (const path of screens) {
    const file = source(path);
    assert.match(file, /RefreshControl/, `${path} should support pull-to-refresh`);
    assert.match(file, /refreshing/, `${path} should expose refreshing state`);
  }

  for (const path of ["app/tea-rooms.tsx", "app/post-office.tsx", "app/greenhouse.tsx", "app/courtyard.tsx", "app/keepsake-box.tsx"]) {
    assert.match(source(path), /SkeletonBox/, `${path} should show shaped loading placeholders`);
  }
});

test("polish pass replaces blank states with warm Meadow empty states", () => {
  assert.match(source("app/post-office.tsx"), /The postbox is quiet/);
  assert.match(source("app/courtyard.tsx"), /The courtyard is still/);
  assert.match(source("app/tea-rooms.tsx"), /It's quiet in here/);
  assert.match(source("app/keepsake-box.tsx"), /Your box is waiting/);
  assert.match(source("app/(tabs)/journal.tsx"), /Your pages are blank and ready/);
  assert.match(source("app/(tabs)/profile.tsx"), /Your first milestone is waiting/);
});

test("primary tappable cards use press feedback and success flash confirmations", () => {
  for (const path of ["app/(tabs)/hearth.tsx", "app/post-office.tsx", "app/courtyard.tsx", "app/greenhouse.tsx", "screens/MemoryGarden/ChapterSelectionScreen.tsx", "app/(tabs)/index.tsx"]) {
    assert.match(source(path), /PressCard/, `${path} should use animated press feedback on cards`);
  }

  assert.match(source("app/(tabs)/journal.tsx"), /Saved to your journal/);
  assert.match(source("app/keepsake-box.tsx"), /Added to your keepsake box/);
  assert.match(source("app/post-office.tsx"), /Seal left/);
  assert.match(source("app/tea-rooms.tsx"), /Sent\./);
  assert.match(source("app/greenhouse.tsx"), /Seat reserved/);
});
