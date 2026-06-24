import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("Journal writing space uses an animated quill and inkwell assets", () => {
  const journalSource = readFileSync("app/(tabs)/journal.tsx", "utf8");
  const quillSource = readFileSync("components/AnimatedQuill.tsx", "utf8");

  assert.equal(existsSync("assets/illustrations/quill-pen.png"), true);
  assert.equal(existsSync("assets/illustrations/inkwell.png"), true);
  assert.match(quillSource, /Animated\.Image/);
  assert.match(quillSource, /quill-pen\.png/);
  assert.match(quillSource, /onEnterPressed/);
  assert.match(quillSource, /Animated\.spring/);
  assert.match(journalSource, /AnimatedQuill/);
  assert.match(journalSource, /inkwell\.png/);
  assert.match(journalSource, /TextInput/);
  assert.match(journalSource, /onSelectionChange/);
  assert.match(journalSource, /onKeyPress/);
  assert.match(journalSource, /What's on your heart right now\?/);
});
