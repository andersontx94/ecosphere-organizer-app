-- Process types catalog per organization + process_type_id on processes

alter table public.process_types
  add column if not exists organization_id uuid,
  add column if not exists category text,
  add column if not exists code text,
  add column if not exists default_deadline_days integer,
  add column if not exists requires_agency boolean default false,
  add column if not exists requires_protocol_number boolean default true,
  add column if not exists active boolean default true,
  add column if not exists created_by uuid;

do $do$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'process_types_organization_id_fkey'
  ) then
    alter table public.process_types
      add constraint process_types_organization_id_fkey
      foreign key (organization_id) references public.organizations(id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'process_types_created_by_fkey'
  ) then
    alter table public.process_types
      add constraint process_types_created_by_fkey
      foreign key (created_by) references auth.users(id);
  end if;
end $do$;

-- Backfill organization_id when possible
update public.process_types pt
set organization_id = o.id
from public.organizations o
where pt.organization_id is null
  and (o.created_by = pt.created_by or o.created_by = pt.user_id);

-- Remove legacy global defaults (they will be seeded per organization in-app)
delete from public.process_types
where organization_id is null;

alter table public.process_types
  alter column organization_id set not null;

alter table public.process_types enable row level security;

drop policy if exists "Anyone can view default process types" on public.process_types;
drop policy if exists "Users can insert own process types" on public.process_types;
drop policy if exists "org_select_process_types" on public.process_types;
drop policy if exists "org_insert_process_types" on public.process_types;
drop policy if exists "org_update_process_types" on public.process_types;
drop policy if exists "org_delete_process_types" on public.process_types;

create policy "org_select_process_types"
on public.process_types for select
using (public.can_access_org(organization_id));

create policy "org_insert_process_types"
on public.process_types for insert
with check (public.can_access_org(organization_id));

create policy "org_update_process_types"
on public.process_types for update
using (public.can_access_org(organization_id));

create policy "org_delete_process_types"
on public.process_types for delete
using (public.can_access_org(organization_id));

create index if not exists idx_process_types_org
  on public.process_types(organization_id);

create index if not exists idx_process_types_org_active
  on public.process_types(organization_id, active);

alter table public.environmental_processes
  add column if not exists process_type_id uuid;

do $do$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'environmental_processes_process_type_id_fkey'
  ) then
    alter table public.environmental_processes
      add constraint environmental_processes_process_type_id_fkey
      foreign key (process_type_id) references public.process_types(id);
  end if;
end $do$;

create index if not exists idx_environmental_processes_process_type_id
  on public.environmental_processes(process_type_id);

update public.environmental_processes ep
set process_type_id = pt.id
from public.process_types pt
where ep.process_type_id is null
  and ep.process_type is not null
  and pt.organization_id = ep.organization_id
  and pt.name = ep.process_type;
