import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hearthFiles = {
  hub: "app/(tabs)/hearth.tsx",
  teaRooms: "app/tea-rooms.tsx",
  postOffice: "app/post-office.tsx",
  greenhouse: "app/greenhouse.tsx",
  courtyard: "app/courtyard.tsx",
};

function source(path) {
  return readFileSync(path, "utf8");
}

test("Hearth mobile audit keeps all five screens readable on narrow phones", () => {
  for (const [name, path] of Object.entries(hearthFiles)) {
    const file = source(path);

    assert.match(file, /paddingBottom:\s*(?:100|120)/, `${name} should leave room above the tab bar`);
    assert.doesNotMatch(file, /height:\s*2[1-9]\d/, `${name} hero images should not exceed 200px`);
    assert.doesNotMatch(file, /fontSize:\s*(?:[0-9]|10)\b/, `${name} must not render text below 11pt`);
    assert.doesNotMatch(file, /fontSize:\s*11\b/, `${name} should avoid 11pt text after the mobile readability pass`);
  }
});

test("Hearth hub stays navigation-only with four stacked room entries", () => {
  const file = source(hearthFiles.hub);

  assert.doesNotMatch(file, /Every kindness you leave here is remembered/);
  assert.match(file, /height:\s*200/);
  assert.match(file, /Tea Rooms/);
  assert.match(file, /The Greenhouse/);
  assert.match(file, /The Post Office/);
  assert.match(file, /The Courtyard/);
  assert.match(file, /The Hearth is for subscribers/);
  assert.match(file, /locked=\{!subscription\.isSubscriber\}/);
});

test("Hearth room pages expose mobile-first stacked support sections", () => {
  assert.match(source(hearthFiles.teaRooms), /Room Info/);
  assert.match(source(hearthFiles.teaRooms), /quickActions/);
  assert.match(source(hearthFiles.teaRooms), /Rest on the Bench/);

  assert.match(source(hearthFiles.postOffice), /Most Sealed/);
  assert.match(source(hearthFiles.postOffice), /Your Tools/);
  assert.match(source(hearthFiles.postOffice), /Safety & Care/);

  assert.match(source(hearthFiles.greenhouse), /stats/);
  assert.doesNotMatch(source(hearthFiles.greenhouse), /Subscriber Sanctuary/);
  assert.match(source(hearthFiles.greenhouse), /Water Reminder/);

  assert.match(source(hearthFiles.courtyard), /Daily Prompt/);
  assert.match(source(hearthFiles.courtyard), /Who's Here Now/);
  assert.match(source(hearthFiles.courtyard), /Courtyard Guidelines/);
});
