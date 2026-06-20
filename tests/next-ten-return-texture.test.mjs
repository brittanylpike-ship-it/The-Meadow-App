import assert from "node:assert/strict";
import test from "node:test";

import { getAuthProfileCopy } from "../features/auth/auth-profile-copy.mjs";
import { createEmptyMeadowState } from "../features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory } from "../features/memory/frozen-ground-ritual-memory.mjs";
import { getJournalEmptyState } from "../features/memory/journal-empty-state.mjs";
import { getProfileSoundscapeCopy } from "../features/memory/profile-soundscape-copy.mjs";
import { toMeadowMemorySupabaseMutation } from "../features/memory/supabase-memory-mapper.mjs";
import { getHomeLatestMemoryCard } from "../features/sync/home-latest-memory-card.mjs";
import { getRetryMemoryCopy } from "../features/sync/retry-memory-copy.mjs";
import { queueMeadowMemorySync, createEmptySyncQueue } from "../features/sync/sync-queue.mjs";

test("Journal empty state offers a gentle path into Frozen Ground", () => {
  assert.deepEqual(getJournalEmptyState(), {
    title: "Remembered in the world",
    body: "No written entries yet. Frozen Ground can receive the first one.",
    buttonLabel: "Enter Frozen Ground",
    route: "/frozen-ground",
  });
});

test("Home latest memory card stays absent before memories exist", () => {
  assert.equal(getHomeLatestMemoryCard(createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z")), null);
});

test("Home latest memory card shows the latest held memory", () => {
  const state = saveFrozenGroundRitualMemory(
    createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z"),
    "frozen_pond",
    {
      response: "A quiet ache.",
      detail: "A word under the ice.",
      createdAt: "2026-06-12T09:04:00.000Z",
    }
  );

  assert.deepEqual(getHomeLatestMemoryCard(state), {
    title: "Latest held memory",
    body: "A word under the ice.",
    place: "Frozen Pond",
    route: "/frozen-pond",
    buttonLabel: "Return to Frozen Pond",
  });
});

test("Profile soundscape copy is quiet when audio is off", () => {
  assert.deepEqual(getProfileSoundscapeCopy(false), {
    label: "Soundscape",
    body: "Quiet by default.",
  });
});

test("Profile soundscape copy acknowledges when audio is on", () => {
  assert.deepEqual(getProfileSoundscapeCopy(true), {
    label: "Soundscape",
    body: "Soft sound is allowed here.",
  });
});

test("Retry copy avoids technical sync language", () => {
  assert.equal(getRetryMemoryCopy(false), "Let it travel again");
});

test("Retry pending copy stays gentle", () => {
  assert.equal(getRetryMemoryCopy(true), "Still carrying it");
});

test("Sync queue error avoids memory object terminology", () => {
  assert.throws(
    () => queueMeadowMemorySync(createEmptySyncQueue("user-1"), { userId: "user-1", memoryObjects: [] }, "2026-06-12T09:00:00.000Z", "offline"),
    /remembered memory/
  );
});

test("Supabase mapper error avoids memory object terminology", () => {
  assert.throws(
    () => toMeadowMemorySupabaseMutation(createEmptyMeadowState("user-1", "2026-06-12T09:00:00.000Z")),
    /remembered memory/
  );
});

test("Profile account copy handles absent email gently", () => {
  assert.equal(getAuthProfileCopy(null), "Your place is open on this device.");
});
