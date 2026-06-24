import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const hearth = readFileSync("app/(tabs)/hearth.tsx", "utf8");
const layout = readFileSync("app/_layout.tsx", "utf8");

test("Hearth hub opens four community rooms from the tab", () => {
  assert.match(hearth, /The Hearth/);
  assert.match(hearth, /Tea Rooms/);
  assert.match(hearth, /The Greenhouse/);
  assert.match(hearth, /The Post Office/);
  assert.match(hearth, /The Courtyard/);
  assert.match(hearth, /\/tea-rooms/);
  assert.match(hearth, /\/greenhouse/);
  assert.match(hearth, /\/post-office/);
  assert.match(hearth, /\/courtyard/);
});

test("Hearth room routes are registered in the stack", () => {
  for (const route of ["tea-rooms", "greenhouse", "post-office", "post-detail", "courtyard"]) {
    assert.match(layout, new RegExp(`name="${route}"`));
  }
});

test("Hearth rooms and persistence hooks exist", () => {
  for (const path of [
    "app/tea-rooms.tsx",
    "app/greenhouse.tsx",
    "app/post-office.tsx",
    "app/post-detail.tsx",
    "app/courtyard.tsx",
    "hooks/useTeaRoom.ts",
    "hooks/useHealingCircles.ts",
    "hooks/useHearthPosts.ts",
  ]) {
    assert.equal(existsSync(path), true, `${path} should exist`);
  }
});

test("Tea Rooms use Supabase realtime with a local fallback", () => {
  const hook = readFileSync("hooks/useTeaRoom.ts", "utf8");

  assert.match(hook, /tea_room_messages/);
  assert.match(hook, /postgres_changes/);
  assert.match(hook, /mockTeaRoomMessages/);
  assert.match(hook, /sendMessage/);
});

test("Greenhouse circles and Hearth posts use Supabase-backed hooks", () => {
  const circles = readFileSync("hooks/useHealingCircles.ts", "utf8");
  const posts = readFileSync("hooks/useHearthPosts.ts", "utf8");

  assert.match(circles, /healing_circles/);
  assert.match(circles, /circle_registrations/);
  assert.match(circles, /registerForCircle/);
  assert.match(posts, /hearth_posts/);
  assert.match(posts, /post_seals/);
  assert.match(posts, /addPost/);
  assert.match(posts, /addSeal/);
});
