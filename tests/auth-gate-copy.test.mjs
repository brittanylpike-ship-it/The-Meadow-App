import assert from "node:assert/strict";
import test from "node:test";

import { getAuthGateCopy } from "../features/auth/auth-gate-copy.mjs";

test("auth gate copy stays gentle in local mode", () => {
  assert.deepEqual(getAuthGateCopy("local", true), {
    subtitle: "A private place that remembers what you leave with care.",
    title: "Begin here",
    primaryAction: "Enter The Meadow",
    secondaryAction: "I already have a place here",
  });
});

test("auth gate copy stays locked in Supabase mode", () => {
  assert.deepEqual(getAuthGateCopy("supabase", false), {
    subtitle: "A private place that remembers what you leave with care.",
    title: "Begin here",
    primaryAction: "Enter The Meadow",
    secondaryAction: "I already have a place here",
  });
});
