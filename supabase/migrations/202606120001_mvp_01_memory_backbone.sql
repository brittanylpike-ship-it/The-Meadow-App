create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  remembered_person text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id text primary key,
  title text not null,
  emotional_state text not null,
  sort_order integer not null,
  enabled boolean not null default false
);

create table if not exists public.rituals (
  id text primary key,
  chapter_id text not null references public.chapters(id),
  title text not null,
  sort_order integer not null,
  enabled boolean not null default false
);

create table if not exists public.world_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_memories integer not null default 0,
  last_visited_chapter_id text references public.chapters(id),
  last_visited_ritual_id text references public.rituals(id),
  wildlife_familiarity jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.chapter_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id text not null references public.chapters(id),
  visit_count integer not null default 0,
  memory_count integer not null default 0,
  weather_state text not null default 'still_snow',
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create table if not exists public.ritual_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id text not null references public.chapters(id),
  ritual_id text not null references public.rituals(id),
  visit_count integer not null default 0,
  branch_fullness text not null default 'sparse',
  lantern_warmth text not null default 'dim',
  root_visibility text not null default 'hidden',
  wildlife_witnesses text[] not null default array['rabbit', 'chickadee'],
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, ritual_id)
);

create table if not exists public.ritual_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id text not null references public.chapters(id),
  ritual_id text not null references public.rituals(id),
  visited_at timestamptz not null default now()
);

create table if not exists public.ritual_choices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ritual_id text not null references public.rituals(id),
  choice_layer text not null,
  choice_value text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.memory_objects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_type text not null check (memory_type in ('thought', 'emotion', 'comfort', 'survival', 'hope', 'sign', 'offering', 'whisper', 'growth', 'integration')),
  chapter_id text not null references public.chapters(id),
  ritual_id text not null references public.rituals(id),
  selected_thought text,
  context text,
  custom_text text,
  branch text,
  visual_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_object_id uuid references public.memory_objects(id) on delete set null,
  chapter_id text references public.chapters(id),
  ritual_id text references public.rituals(id),
  body text,
  draft boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_garden_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_object_id uuid not null references public.memory_objects(id) on delete cascade,
  item_kind text not null check (item_kind in ('seed', 'flower', 'root', 'tree', 'lantern', 'stone')),
  memory_type text not null,
  chapter_id text not null references public.chapters(id),
  ritual_id text not null references public.rituals(id),
  growth_state text not null,
  visual_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, memory_object_id, item_kind)
);

create table if not exists public.sync_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sync_kind text not null,
  memory_object_id uuid references public.memory_objects(id) on delete set null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'synced', 'failed')),
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.chapters (id, title, emotional_state, sort_order, enabled)
values
  ('frozen_ground', 'Frozen Ground', 'Shock', 1, true),
  ('storm_garden', 'Storm Garden', 'Anger', 2, true),
  ('crossroads', 'Crossroads', 'Bargaining', 3, true),
  ('the_moors', 'The Moors', 'Depression', 4, true),
  ('first_bloom', 'First Bloom', 'Integration', 5, true)
on conflict (id) do update
set title = excluded.title,
    emotional_state = excluded.emotional_state,
    sort_order = excluded.sort_order,
    enabled = excluded.enabled;

insert into public.rituals (id, chapter_id, title, sort_order, enabled)
values
  ('evergreen_tree', 'frozen_ground', 'Evergreen Tree', 1, true),
  ('frosted_window', 'frozen_ground', 'Frosted Window', 2, true),
  ('frozen_pond', 'frozen_ground', 'Frozen Pond', 3, true),
  ('quiet_hour', 'frozen_ground', 'Quiet Hour', 4, true),
  ('footprints', 'frozen_ground', 'Footprints', 5, true),
  ('lightning_tree', 'storm_garden', 'Lightning Tree', 1, true),
  ('thorn_patch', 'storm_garden', 'Thorn Patch', 2, true),
  ('floodwaters', 'storm_garden', 'Floodwaters', 3, true),
  ('scorched_earth', 'storm_garden', 'Scorched Earth', 4, true),
  ('shattered_mirror', 'storm_garden', 'Shattered Mirror', 5, true),
  ('worn_path', 'crossroads', 'Worn Path', 1, true),
  ('offering', 'crossroads', 'Offering', 2, true),
  ('candle', 'crossroads', 'Candle', 3, true),
  ('searching_for_signs', 'crossroads', 'Searching For Signs', 4, true),
  ('waiting_gate', 'crossroads', 'Waiting Gate', 5, true),
  ('canopy_cloak', 'the_moors', 'Canopy Cloak', 1, true),
  ('mire', 'the_moors', 'Mire', 2, true),
  ('bramble', 'the_moors', 'Bramble', 3, true),
  ('fog', 'the_moors', 'Fog', 4, true),
  ('vanishing_path', 'the_moors', 'Vanishing Path', 5, true),
  ('grounding', 'first_bloom', 'Grounding', 1, true),
  ('opening', 'first_bloom', 'Opening', 2, true),
  ('anchoring', 'first_bloom', 'Anchoring', 3, true),
  ('emergence', 'first_bloom', 'Emergence', 4, true),
  ('integration', 'first_bloom', 'Integration', 5, true)
on conflict (id) do update
set chapter_id = excluded.chapter_id,
    title = excluded.title,
    sort_order = excluded.sort_order,
    enabled = excluded.enabled;

create index if not exists chapter_state_user_id_idx on public.chapter_state(user_id);
create index if not exists ritual_state_user_id_idx on public.ritual_state(user_id);
create index if not exists ritual_visits_user_id_idx on public.ritual_visits(user_id);
create index if not exists ritual_choices_user_id_idx on public.ritual_choices(user_id);
create index if not exists memory_objects_user_id_idx on public.memory_objects(user_id);
create index if not exists memory_objects_created_at_idx on public.memory_objects(created_at);
create index if not exists memory_objects_memory_type_idx on public.memory_objects(memory_type);
create index if not exists journal_entries_user_id_idx on public.journal_entries(user_id);
create index if not exists memory_garden_items_user_id_idx on public.memory_garden_items(user_id);
create index if not exists memory_garden_items_memory_object_id_idx on public.memory_garden_items(memory_object_id);
create index if not exists sync_queue_user_id_idx on public.sync_queue(user_id);
create index if not exists sync_queue_status_idx on public.sync_queue(status);

alter table public.profiles enable row level security;
alter table public.chapters enable row level security;
alter table public.rituals enable row level security;
alter table public.world_state enable row level security;
alter table public.chapter_state enable row level security;
alter table public.ritual_state enable row level security;
alter table public.ritual_visits enable row level security;
alter table public.ritual_choices enable row level security;
alter table public.memory_objects enable row level security;
alter table public.journal_entries enable row level security;
alter table public.memory_garden_items enable row level security;
alter table public.sync_queue enable row level security;

create policy "profiles are private" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "world state is private" on public.world_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chapter state is private" on public.chapter_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ritual state is private" on public.ritual_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ritual visits are private" on public.ritual_visits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ritual choices are private" on public.ritual_choices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memory objects are private" on public.memory_objects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journal entries are private" on public.journal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memory garden items are private" on public.memory_garden_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sync queue is private" on public.sync_queue for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "chapters are readable" on public.chapters for select using (true);
create policy "rituals are readable" on public.rituals for select using (true);
