alter table public.profiles add column if not exists current_chapter integer not null default 1 check (current_chapter between 1 and 5);
alter table public.profiles add column if not exists journey_complete boolean not null default false;

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  title text not null,
  earned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, key)
);

alter table public.milestones enable row level security;

drop policy if exists "milestones are private" on public.milestones;
create policy "milestones are private" on public.milestones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
