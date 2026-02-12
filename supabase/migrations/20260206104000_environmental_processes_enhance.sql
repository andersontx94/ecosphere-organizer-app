-- Ensure environmental_processes exists and supports services + owner-based RLS

create table if not exists public.environmental_processes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  owner_id uuid,
  enterprise_id uuid references public.enterprises(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  process_type text not null,
  agency text not null,
  process_number text,
  protocol_number text,
  status text not null default 'em_elaboracao',
  protocol_date date,
  decision_date date,
  expiry_date date,
  start_date date,
  due_date date,
  internal_deadline date,
  city text,
  state text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.environmental_processes
add column if not exists owner_id uuid,
add column if not exists service_id uuid references public.services(id) on delete set null,
add column if not exists protocol_number text,
add column if not exists city text,
add column if not exists state text,
add column if not exists start_date date,
add column if not exists due_date date;

update public.environmental_processes
set owner_id = user_id
where owner_id is null;

-- Remove orphaned processes that still lack owner_id
delete from public.environmental_processes
where owner_id is null;

alter table public.environmental_processes
alter column owner_id set not null;

alter table public.environmental_processes enable row level security;

create or replace function public.set_environmental_process_owner()
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

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_environmental_process_owner on public.environmental_processes;
create trigger set_environmental_process_owner
before insert on public.environmental_processes
for each row
execute function public.set_environmental_process_owner();

drop trigger if exists update_environmental_processes_updated_at on public.environmental_processes;
create trigger update_environmental_processes_updated_at
before update on public.environmental_processes
for each row
execute function public.update_updated_at_column();

drop policy if exists "Users can view own processes" on public.environmental_processes;
drop policy if exists "Users can insert own processes" on public.environmental_processes;
drop policy if exists "Users can update own processes" on public.environmental_processes;
drop policy if exists "Users can delete own processes" on public.environmental_processes;

create policy "Users can view own processes"
on public.environmental_processes
for select
using (owner_id = auth.uid());

create policy "Users can insert own processes"
on public.environmental_processes
for insert
with check (owner_id = auth.uid());

create policy "Users can update own processes"
on public.environmental_processes
for update
using (owner_id = auth.uid());

create policy "Users can delete own processes"
on public.environmental_processes
for delete
using (owner_id = auth.uid());

create index if not exists idx_environmental_processes_owner_id
on public.environmental_processes(owner_id);

create index if not exists idx_environmental_processes_service_id
on public.environmental_processes(service_id);
