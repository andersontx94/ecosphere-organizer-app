-- Add owner_id and extra fields to enterprises for multi-tenant access
alter table public.enterprises
add column if not exists owner_id uuid,
add column if not exists cnpj text,
add column if not exists city text,
add column if not exists state text,
add column if not exists segment text;

-- Backfill owner_id/user_id from existing data
update public.enterprises
set owner_id = user_id
where owner_id is null;

-- If user_id is missing, inherit from client
update public.enterprises e
set user_id = c.user_id
from public.clients c
where e.user_id is null
  and e.client_id = c.id;

update public.enterprises e
set owner_id = c.user_id
from public.clients c
where e.owner_id is null
  and e.client_id = c.id;

-- Remove orphaned enterprises that still lack owner_id
delete from public.enterprises
where owner_id is null;

-- Ensure owner_id is present going forward
alter table public.enterprises
alter column owner_id set not null;

-- Trigger to set owner_id/user_id on insert
create or replace function public.set_enterprise_owner()
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

drop trigger if exists set_enterprise_owner on public.enterprises;
create trigger set_enterprise_owner
before insert on public.enterprises
for each row
execute function public.set_enterprise_owner();

-- RLS policies using owner_id
drop policy if exists "Users can view own enterprises" on public.enterprises;
drop policy if exists "Users can insert own enterprises" on public.enterprises;
drop policy if exists "Users can update own enterprises" on public.enterprises;
drop policy if exists "Users can delete own enterprises" on public.enterprises;

create policy "Users can view own enterprises"
on public.enterprises
for select
using (owner_id = auth.uid());

create policy "Users can insert own enterprises"
on public.enterprises
for insert
with check (owner_id = auth.uid());

create policy "Users can update own enterprises"
on public.enterprises
for update
using (owner_id = auth.uid());

create policy "Users can delete own enterprises"
on public.enterprises
for delete
using (owner_id = auth.uid());
