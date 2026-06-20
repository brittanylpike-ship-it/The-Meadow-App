import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const releaseFiles = [
  "app/_layout.tsx",
  "app/auth.tsx",
  "app/evergreen-tree.tsx",
  "app/frozen-ground.tsx",
  "app/storm-garden.tsx",
  "app/crossroads.tsx",
  "app/the-moors.tsx",
  "app/first-bloom.tsx",
  "app/memory-garden.tsx",
  "components/meadow-button.tsx",
  "components/meadow-screen.tsx",
  "components/meadow-scene-image.tsx",
  "components/chapter-map.tsx",
  "features/storage/meadow-storage.ts",
  "features/world/use-meadow-state.ts",
  "services/meadow-sync.ts",
  "services/meadow-remote.ts",
  "services/supabase.ts",
];

test("release-facing code has no debug, preview, or localhost leftovers", () => {
  const combined = releaseFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(combined, /console\.(log|warn|error|debug)|debugger|alert\(/);
  assert.doesNotMatch(combined, /localhost|127\.0\.0\.1|preview-server|temporary|temp/i);
  assert.doesNotMatch(combined, /TODO|FIXME/i);
});

test("Supabase remains environment-driven for launch builds", () => {
  const source = readFileSync("services/supabase.ts", "utf8");

  assert.match(source, /EXPO_PUBLIC_SUPABASE_URL/);
  assert.match(source, /EXPO_PUBLIC_SUPABASE_ANON_KEY/);
  assert.doesNotMatch(source, /https:\/\/[^"']+supabase\.co/);
  assert.doesNotMatch(source, /eyJ[a-zA-Z0-9_-]+/);
});
