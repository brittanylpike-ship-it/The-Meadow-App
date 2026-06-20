import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationSql = readFileSync(
  new URL("../supabase/migrations/202606120001_mvp_01_memory_backbone.sql", import.meta.url),
  "utf8"
);
const allMigrationSql = readdirSync(new URL("../supabase/migrations", import.meta.url))
  .filter((file) => file.endsWith(".sql"))
  .map((file) => readFileSync(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"))
  .join("\n");

test("Supabase migration seeds every enabled Frozen Ground ritual", () => {
  const requiredRitualIds = [
    "evergreen_tree",
    "frosted_window",
    "frozen_pond",
    "quiet_hour",
    "footprints",
  ];

  for (const ritualId of requiredRitualIds) {
    assert.match(migrationSql, new RegExp(`'${ritualId}'`));
  }
});

test("Supabase migrations create profiles from auth without social or gamified schema drift", () => {
  assert.match(allMigrationSql, /create or replace function public\.handle_new_user/);
  assert.match(allMigrationSql, /create trigger on_auth_user_created/);
  assert.match(allMigrationSql, /insert into public\.profiles \(id, email\)/);
  assert.match(allMigrationSql, /create or replace function public\.set_updated_at/);

  assert.match(allMigrationSql, /create table if not exists public\.milestones/);
  assert.match(allMigrationSql, /milestones are private/);
  assert.doesNotMatch(allMigrationSql, /create table (?:if not exists )?public\.hearth_posts/);
  assert.doesNotMatch(allMigrationSql, /create table (?:if not exists )?public\.hearth_replies/);
  assert.doesNotMatch(allMigrationSql, /create table (?:if not exists )?public\.post_seals/);
  assert.doesNotMatch(allMigrationSql, /create table (?:if not exists )?public\.tea_room_messages/);
  assert.doesNotMatch(allMigrationSql, /create table (?:if not exists )?public\.healing_circles/);
  assert.doesNotMatch(allMigrationSql, /\bseal_count\b|\bheart_count\b/);
});
