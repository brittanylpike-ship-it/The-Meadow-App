import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const keepsakeBox = readFileSync("app/keepsake-box.tsx", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const appJson = JSON.parse(readFileSync("app.json", "utf8"));

test("Keepsake Box uses Expo image picker for photo memories", () => {
  assert.equal(packageJson.dependencies["expo-image-picker"], "~16.0.6");
  assert.match(keepsakeBox, /from "expo-image-picker"/);
  assert.match(keepsakeBox, /requestMediaLibraryPermissionsAsync/);
  assert.match(keepsakeBox, /launchImageLibraryAsync/);
});

test("Keepsake photo picker asks for caption before saving", () => {
  assert.match(keepsakeBox, /pendingPhotoUri/);
  assert.match(keepsakeBox, /photoCaption/);
  assert.match(keepsakeBox, /Add a caption\.\.\. \(optional\)/);
  assert.match(keepsakeBox, /Save to Keepsake Box ->/);
});

test("Keepsake photos upload to the Meadow storage bucket with local fallback", () => {
  assert.match(keepsakeBox, /memory-garden-photos/);
  assert.match(keepsakeBox, /https:\/\/picsum\.photos\/400\/300/);
  assert.match(keepsakeBox, /hasSupabaseConfig/);
  assert.match(keepsakeBox, /caption: photoCaption/);
});

test("Expo image picker permission text is configured", () => {
  const plugins = appJson.expo.plugins ?? [];
  const imagePickerPlugin = plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === "expo-image-picker");
  assert.ok(imagePickerPlugin, "expo-image-picker plugin should be configured");
  assert.equal(
    imagePickerPlugin[1].photosPermission,
    "The Meadow uses your photo library to add images to your Memory Garden keepsakes."
  );
  assert.equal(
    imagePickerPlugin[1].cameraPermission,
    "The Meadow uses your camera to capture memories for your Keepsake Box."
  );
});
