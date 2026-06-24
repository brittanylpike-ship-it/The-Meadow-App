import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { meadowSceneAssetManifest } from "../features/art/meadow-scene-assets.mjs";

test("rendered Meadow scene assets are present for the app screens", () => {
  for (const [sceneId, asset] of Object.entries(meadowSceneAssetManifest)) {
    assert.equal(existsSync(asset.file), true, `${sceneId} should point to a bundled rendered asset`);
    assert.match(asset.file, /^assets\/art\/rendered\/.+\.png$/);
  }
});

test("scene screens no longer announce temporary artwork stand-ins", () => {
  const files = [
    "app/frozen-ground.tsx",
    "app/storm-garden.tsx",
    "app/crossroads.tsx",
    "app/the-moors.tsx",
    "app/first-bloom.tsx",
    "app/evergreen-tree.tsx",
    "components/frozen-ground-ritual-screen.tsx",
    "components/storm-garden-ritual-screen.tsx",
    "components/crossroads-ritual-screen.tsx",
    "components/moors-ritual-screen.tsx",
    "components/first-bloom-ritual-screen.tsx",
  ];

  const combined = files.map((file) => readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(combined, /pending artwork|standing in|until approved|artwork is pending/i);
});
