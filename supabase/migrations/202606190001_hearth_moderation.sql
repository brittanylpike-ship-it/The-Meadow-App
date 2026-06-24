create table if not exists public.moderation_log (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('letter', 'message', 'post', 'comment', 'reply')),
  content_id text,
  content_text text not null,
  flag_level text not null check (flag_level in ('soft_flag', 'hard_flag', 'crisis')),
  ai_reason text not null,
  author_id uuid references auth.users(id) on delete set null,
  reviewed boolean not null default false,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  action_taken text check (action_taken in ('approved', 'removed', 'escalated')),
  created_at timestamptz not null default now()
);

alter table if exists public.letters add column if not exists flagged boolean not null default false;
alter table if exists public.tea_messages add column if not exists flagged boolean not null default false;
alter table if exists public.courtyard_posts add column if not exists flagged boolean not null default false;
alter table if exists public.post_comments add column if not exists flagged boolean not null default false;

alter table if exists public.hearth_posts add column if not exists flagged boolean not null default false;
alter table if exists public.hearth_replies add column if not exists flagged boolean not null default false;
alter table if exists public.tea_room_messages add column if not exists flagged boolean not null default false;

alter table if exists public.hearth_posts add column if not exists is_deleted boolean not null default false;
alter table if exists public.hearth_replies add column if not exists is_deleted boolean not null default false;
alter table if exists public.tea_room_messages add column if not exists is_deleted boolean not null default false;

alter table public.moderation_log enable row level security;

drop policy if exists "Authors can create moderation logs" on public.moderation_log;
create policy "Authors can create moderation logs"
  on public.moderation_log
  for insert
  to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "Meadow keepers can review moderation logs" on public.moderation_log;
create policy "Meadow keepers can review moderation logs"
  on public.moderation_log
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'meadow_keeper');

drop policy if exists "Meadow keepers can update moderation logs" on public.moderation_log;
create policy "Meadow keepers can update moderation logs"
  on public.moderation_log
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'meadow_keeper')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'meadow_keeper');
