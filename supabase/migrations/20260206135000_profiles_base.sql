-- Profiles base table (idempotent)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text,
  active_organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

-- Profiles policies
create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "Profiles are insertable by owner"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
