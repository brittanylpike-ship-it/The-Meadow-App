create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email),
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists world_state_set_updated_at on public.world_state;
create trigger world_state_set_updated_at
  before update on public.world_state
  for each row execute function public.set_updated_at();

drop trigger if exists chapter_state_set_updated_at on public.chapter_state;
create trigger chapter_state_set_updated_at
  before update on public.chapter_state
  for each row execute function public.set_updated_at();

drop trigger if exists ritual_state_set_updated_at on public.ritual_state;
create trigger ritual_state_set_updated_at
  before update on public.ritual_state
  for each row execute function public.set_updated_at();

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

drop trigger if exists memory_garden_items_set_updated_at on public.memory_garden_items;
create trigger memory_garden_items_set_updated_at
  before update on public.memory_garden_items
  for each row execute function public.set_updated_at();

drop trigger if exists sync_queue_set_updated_at on public.sync_queue;
create trigger sync_queue_set_updated_at
  before update on public.sync_queue
  for each row execute function public.set_updated_at();
