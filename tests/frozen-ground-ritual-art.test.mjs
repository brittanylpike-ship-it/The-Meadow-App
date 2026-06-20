import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const componentSource = readFileSync(
  join(projectRoot, "components", "frozen-ground-ritual-screen.tsx"),
  "utf8"
);

test("Frozen Ground ritual screens use rendered scene assets instead of native placeholders", () => {
  assert.match(componentSource, /frosted_window: "ritual_frosted_window"/);
  assert.match(componentSource, /frozen_pond: "ritual_frozen_pond"/);
  assert.match(componentSource, /quiet_hour: "ritual_quiet_hour"/);
  assert.match(componentSource, /footprints: "ritual_footprints"/);
  assert.match(componentSource, /<MeadowSceneImage sceneId=\{frozenGroundRitualSceneIds\[ritualId\]\}/);
});
