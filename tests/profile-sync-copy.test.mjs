import assert from "node:assert/strict";
import test from "node:test";

import { getProfileSyncCopy } from "../features/sync/profile-sync-copy.mjs";

test("Profile sync copy stays soft while status is unknown", () => {
  assert.equal(getProfileSyncCopy(null), "The Meadow is checking what is still being held.");
});

test("Profile sync copy reuses settled Meadow language", () => {
  assert.equal(
    getProfileSyncCopy({ pendingCount: 0, status: "settled", label: "The Meadow is remembered here." }),
    "The Meadow is remembered here."
  );
});

test("Profile sync copy reuses waiting Meadow language", () => {
  assert.equal(
    getProfileSyncCopy({ pendingCount: 1, status: "waiting", label: "One memory is waiting for the wider Meadow." }),
    "One memory is waiting for the wider Meadow."
  );
});
