-- Ensure services table supports owner-based multi-tenancy

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  user_id uuid,
  name text not null,
  description text,
  default_price numeric(10,2),
  created_at timestamptz default now()
);

alter table public.services
add column if not exists owner_id uuid,
add column if not exists user_id uuid,
add column if not exists name text,
add column if not exists description text,
add column if not exists default_price numeric(10,2),
add column if not exists created_at timestamptz default now();

update public.services
set owner_id = user_id
where owner_id is null;

-- Remove orphaned services that still lack owner_id
delete from public.services
where owner_id is null;

alter table public.services
alter column owner_id set not null;

alter table public.services enable row level security;

create or replace function public.set_service_owner()
returns trigger as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_service_owner on public.services;
create trigger set_service_owner
before insert on public.services
for each row
execute function public.set_service_owner();

drop policy if exists "Users can view own services" on public.services;
drop policy if exists "Users can insert own services" on public.services;
drop policy if exists "Users can update own services" on public.services;
drop policy if exists "Users can delete own services" on public.services;

create policy "Users can view own services"
on public.services
for select
using (owner_id = auth.uid());

create policy "Users can insert own services"
on public.services
for insert
with check (owner_id = auth.uid());

create policy "Users can update own services"
on public.services
for update
using (owner_id = auth.uid());

create policy "Users can delete own services"
on public.services
for delete
using (owner_id = auth.uid());
