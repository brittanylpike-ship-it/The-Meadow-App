import assert from "node:assert/strict";
import test from "node:test";

import {
  createEmptySyncQueue,
  getSyncQueueSummary,
  markSyncSucceeded,
  queueEvergreenSync,
  queueMeadowMemorySync,
} from "../features/sync/sync-queue.mjs";

test("queues a failed Evergreen Tree sync without duplicating the same memory", () => {
  const queue = createEmptySyncQueue("user-1");
  const state = { userId: "user-1", memoryObjects: [{ id: "memory-1" }] };

  const first = queueEvergreenSync(queue, state, "2026-06-12T09:00:00.000Z", "network down");
  const second = queueEvergreenSync(first, state, "2026-06-12T09:01:00.000Z", "still down");

  assert.equal(second.pending.length, 1);
  assert.equal(second.pending[0].attemptCount, 2);
  assert.equal(second.pending[0].lastError, "still down");
  assert.deepEqual(second.pending[0].state, state);
});

test("queues any Meadow memory sync with a generic retry kind", () => {
  const queue = createEmptySyncQueue("user-1");
  const state = {
    userId: "user-1",
    memoryObjects: [{ id: "memory-pond-1", ritualId: "frozen_pond" }],
  };

  const next = queueMeadowMemorySync(queue, state, "2026-06-12T09:00:00.000Z", "network down");

  assert.equal(next.pending.length, 1);
  assert.equal(next.pending[0].kind, "meadow_memory");
  assert.equal(next.pending[0].memoryId, "memory-pond-1");
});

test("clears the queued Evergreen Tree sync after remote success", () => {
  const queue = queueEvergreenSync(
    createEmptySyncQueue("user-1"),
    { userId: "user-1", memoryObjects: [{ id: "memory-1" }] },
    "2026-06-12T09:00:00.000Z",
    "network down"
  );

  const next = markSyncSucceeded(queue, "memory-1");

  assert.equal(next.pending.length, 0);
  assert.equal(next.lastSyncedMemoryId, "memory-1");
});

test("summarizes whether The Meadow has pending remote sync work", () => {
  const clear = getSyncQueueSummary(createEmptySyncQueue("user-1"));
  assert.deepEqual(clear, {
    pendingCount: 0,
    status: "settled",
    label: "The Meadow is remembered here.",
  });

  const pending = getSyncQueueSummary(
    queueEvergreenSync(
      createEmptySyncQueue("user-1"),
      { userId: "user-1", memoryObjects: [{ id: "memory-1" }] },
      "2026-06-12T09:00:00.000Z",
      "network down"
    )
  );

  assert.deepEqual(pending, {
    pendingCount: 1,
    status: "waiting",
    label: "One memory is waiting for the wider Meadow.",
  });
});
