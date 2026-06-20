import assert from "node:assert/strict";
import test from "node:test";

import { getAuthErrorCopy } from "../features/auth/auth-error-copy.mjs";

test("auth error copy softens invalid login language", () => {
  assert.equal(
    getAuthErrorCopy(new Error("Invalid login credentials")),
    "That entrance did not open. Check the email and password, then try again gently."
  );
});

test("auth error copy softens existing-account language", () => {
  assert.equal(
    getAuthErrorCopy(new Error("User already registered")),
    "There may already be a place here for that email. Try returning instead."
  );
});

test("auth error copy has a gentle fallback", () => {
  assert.equal(getAuthErrorCopy("Network request failed"), "The gate did not open. Try again gently.");
});
