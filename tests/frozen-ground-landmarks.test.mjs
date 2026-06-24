import assert from "node:assert/strict";
import test from "node:test";

import { frozenGroundLandmarks } from "../features/chapters/frozen-ground-landmarks.mjs";

test("Frozen Ground exposes the approved Chapter One landmarks without changing order", () => {
  assert.deepEqual(
    frozenGroundLandmarks.map((landmark) => landmark.id),
    ["evergreen_tree", "frosted_window", "frozen_pond", "quiet_hour", "footprints"]
  );
  assert.equal(frozenGroundLandmarks[0].route, "/evergreen-tree");
  assert.equal(frozenGroundLandmarks[0].enabled, true);
  assert.deepEqual(
    frozenGroundLandmarks.slice(1).map((landmark) => landmark.route),
    ["/frosted-window", "/frozen-pond", "/quiet-hour", "/footprints"]
  );
  assert.equal(frozenGroundLandmarks.every((landmark) => landmark.enabled === true), true);
});
