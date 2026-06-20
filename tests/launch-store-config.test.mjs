import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";

const appJson = JSON.parse(readFileSync("app.json", "utf8"));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

test("launch assets and store configuration are wired for Expo builds", () => {
  assert.equal(packageJson.dependencies["expo-splash-screen"], "~0.29.24");
  assert.equal(appJson.expo.version, "1.0.0");
  assert.equal(appJson.expo.scheme, "meadow");
  assert.equal(appJson.expo.icon, "./assets/icon.png");
  assert.deepEqual(appJson.expo.splash, {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#E2DDD6",
  });
  assert.equal(appJson.expo.ios.bundleIdentifier, "com.themeadow.app");
  assert.equal(appJson.expo.ios.buildNumber, "1");
  assert.equal(appJson.expo.ios.supportsTablet, false);
  assert.equal(appJson.expo.android.package, "com.themeadow.app");
  assert.equal(appJson.expo.android.versionCode, 1);
  assert.equal(appJson.expo.android.adaptiveIcon.foregroundImage, "./assets/icon-foreground.png");
  assert.equal(appJson.expo.web.favicon, "./assets/icon.png");
  assert.equal(appJson.expo.extra.eas.projectId, "REPLACE_WITH_EAS_PROJECT_ID");
});

test("placeholder launch image slots exist and are non-empty PNG files", () => {
  for (const file of ["assets/icon.png", "assets/icon-foreground.png", "assets/adaptive-icon.png", "assets/splash.png"]) {
    assert.equal(existsSync(file), true, `${file} should exist`);
    const bytes = readFileSync(file).subarray(0, 8);
    assert.deepEqual([...bytes], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.ok(statSync(file).size > 100, `${file} should not be empty`);
  }
});

test("EAS and store metadata prep files are present", () => {
  const easJson = JSON.parse(readFileSync("eas.json", "utf8"));
  const metadata = readFileSync("docs/store-metadata.md", "utf8");
  const generator = readFileSync("scripts/generate-placeholder-assets.js", "utf8");

  assert.equal(easJson.cli.version, ">= 5.0.0");
  assert.equal(easJson.build.production.autoIncrement, true);
  assert.match(metadata, /# The Meadow — App Store Metadata/);
  assert.match(metadata, /Grief & Healing Journal/);
  assert.match(generator, /require\("sharp"\)/);
  assert.match(generator, /Launch asset generation method: sharp SVG rasterization\./);
});
