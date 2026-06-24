import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const reflectionPool = readFileSync("app/reflection-pool.tsx", "utf8");
const keepsakeBox = readFileSync("app/keepsake-box.tsx", "utf8");
const hookPath = "hooks/useMemoryGarden.ts";

test("Reflection Pool is a persisted release place, not a coming-soon shell", () => {
  assert.doesNotMatch(reflectionPool, /Coming soon/i);
  assert.match(reflectionPool, /useMemoryGarden/);
  assert.match(reflectionPool, /Skip a Stone/);
  assert.match(reflectionPool, /Float a Leaf Boat/);
  assert.match(reflectionPool, /Still Water/);
  assert.match(reflectionPool, /What You've Released/);
  assert.match(reflectionPool, /reflection-pool-thumb\.png/);
});

test("Keepsake Box is a persisted memory place, not a coming-soon shell", () => {
  assert.doesNotMatch(keepsakeBox, /Coming soon/i);
  assert.match(keepsakeBox, /useMemoryGarden/);
  assert.match(keepsakeBox, /The Keepsake Box/);
  assert.match(keepsakeBox, /Add to Your Keepsake Box/);
  assert.match(keepsakeBox, /ALL/);
  assert.match(keepsakeBox, /PHOTOS/);
  assert.match(keepsakeBox, /FLOWERS/);
  assert.match(keepsakeBox, /keepsake-box-thumb\.png/);
});

test("Memory Garden hook persists entries through Supabase with a local fallback", () => {
  assert.equal(existsSync(hookPath), true);
  const hook = readFileSync(hookPath, "utf8");

  assert.match(hook, /export function useMemoryGarden/);
  assert.match(hook, /from\("memory_garden"\)/);
  assert.match(hook, /useAuth/);
  assert.match(hook, /hasSupabaseConfig/);
  assert.match(hook, /addEntry/);
  assert.match(hook, /deleteEntry/);
  assert.match(hook, /mockMemoryGardenEntries/);
});
