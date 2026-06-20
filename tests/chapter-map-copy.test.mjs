import assert from "node:assert/strict";
import test from "node:test";

import { getChapterMapDescription } from "../features/chapters/chapter-map-copy.mjs";

test("Chapter map keeps approved description before Frozen Ground remembers", () => {
  assert.equal(
    getChapterMapDescription("frozen_ground", 0),
    "A winter field for the first shock of absence. The Evergreen Tree is open."
  );
});

test("Chapter map acknowledges remembered Frozen Ground without using progress language", () => {
  assert.equal(
    getChapterMapDescription("frozen_ground", 2),
    "Frozen Ground is no longer empty. What you left there is still held."
  );
});

test("Chapter map keeps closed chapter copy unchanged", () => {
  assert.equal(getChapterMapDescription("storm_garden", 2), "This path remains closed for now.");
});
