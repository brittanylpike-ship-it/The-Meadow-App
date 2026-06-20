import assert from "node:assert/strict";
import test from "node:test";

import { getHomeSyncNotice } from "../features/sync/home-sync-notice.mjs";

test("Home has no sync notice when the Meadow is settled", () => {
  assert.equal(getHomeSyncNotice(null), null);
  assert.equal(getHomeSyncNotice({ pendingCount: 0, status: "settled" }), null);
});

test("Home softly acknowledges memory waiting to travel", () => {
  assert.deepEqual(getHomeSyncNotice({ pendingCount: 1, status: "waiting" }), {
    title: "Held here",
    body: "One memory is safe on this device and waiting for the wider Meadow.",
  });
});

test("Home pluralizes multiple waiting memories without sounding like a task list", () => {
  assert.deepEqual(getHomeSyncNotice({ pendingCount: 3, status: "waiting" }), {
    title: "Held here",
    body: "3 memories are safe on this device and waiting for the wider Meadow.",
  });
});
