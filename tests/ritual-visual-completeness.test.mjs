import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { meadowSceneAssetManifest } from "../features/art/meadow-scene-assets.mjs";

const expectedRitualScenes = [
  "ritual_evergreen_tree",
  "ritual_frosted_window",
  "ritual_frozen_pond",
  "ritual_quiet_hour",
  "ritual_footprints",
  "ritual_lightning_tree",
  "ritual_thorn_patch",
  "ritual_floodwaters",
  "ritual_scorched_earth",
  "ritual_shattered_mirror",
  "ritual_worn_path",
  "ritual_offering",
  "ritual_candle",
  "ritual_searching_for_signs",
  "ritual_waiting_gate",
  "ritual_canopy_cloak",
  "ritual_mire",
  "ritual_bramble",
  "ritual_fog",
  "ritual_vanishing_path",
  "ritual_grounding",
  "ritual_opening",
  "ritual_anchoring",
  "ritual_emergence",
  "ritual_integration",
];

const chapterScenes = [
  "chapter_frozen_ground",
  "chapter_storm_garden",
  "chapter_crossroads",
  "chapter_the_moors",
  "chapter_first_bloom",
];

const ritualScreenFiles = [
  "app/evergreen-tree.tsx",
  "components/frozen-ground-ritual-screen.tsx",
  "components/storm-garden-ritual-screen.tsx",
  "components/crossroads-ritual-screen.tsx",
  "components/moors-ritual-screen.tsx",
  "components/first-bloom-ritual-screen.tsx",
];

function hashFile(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function readPngDimensions(file) {
  const buffer = readFileSync(file);
  assert.equal(buffer.toString("ascii", 1, 4), "PNG", `${file} should be a PNG asset`);

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test("all 25 chapter rituals have rendered visual assets", () => {
  assert.equal(expectedRitualScenes.length, 25);

  for (const sceneId of expectedRitualScenes) {
    const asset = meadowSceneAssetManifest[sceneId];

    assert.ok(asset, `${sceneId} should be listed in the rendered asset manifest`);
    assert.equal(asset.status, "rendered", `${sceneId} should not be a placeholder or chapter panel stand-in`);
    assert.match(asset.file, /^assets\/art\/rendered\/ritual-.+\.png$/);
    assert.equal(existsSync(asset.file), true, `${sceneId} should point to a bundled PNG`);

    const dimensions = readPngDimensions(asset.file);
    assert.ok(dimensions.width >= 800, `${sceneId} should be app-resolution artwork`);
    assert.ok(dimensions.height >= 1500, `${sceneId} should be portrait ritual artwork`);
  }
});

test("ritual assets are not duplicated chapter-panel placeholders", () => {
  const chapterHashes = new Map(
    chapterScenes.map((sceneId) => {
      const asset = meadowSceneAssetManifest[sceneId];
      return [hashFile(asset.file), sceneId];
    })
  );

  for (const sceneId of expectedRitualScenes) {
    const asset = meadowSceneAssetManifest[sceneId];
    const duplicateChapter = chapterHashes.get(hashFile(asset.file));

    assert.equal(
      duplicateChapter,
      undefined,
      `${sceneId} should not reuse ${duplicateChapter} chapter artwork`
    );
  }
});

test("ritual screens map every rendered ritual scene into the UI", () => {
  const combinedSource = ritualScreenFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  for (const sceneId of expectedRitualScenes) {
    assert.match(combinedSource, new RegExp(`"${sceneId}"`), `${sceneId} should be mapped by a ritual screen`);
  }
});
