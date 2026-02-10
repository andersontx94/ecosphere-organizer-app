-- Backward-compatible many-to-many between environmental_processes and services
-- Keeps environmental_processes.service_id (legacy) and backfills into process_services

create extension if not exists "pgcrypto";

create table if not exists public.process_services (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.environmental_processes(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  organization_id uuid null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists process_services_process_service_uidx
  on public.process_services(process_id, service_id);

create index if not exists idx_process_services_process_id
  on public.process_services(process_id);

create index if not exists idx_process_services_service_id
  on public.process_services(service_id);

-- Backfill from legacy column (ignore duplicates)
insert into public.process_services (process_id, service_id, organization_id)
select ep.id, ep.service_id, ep.organization_id
from public.environmental_processes ep
where ep.service_id is not null
on conflict do nothing;

-- Ensure FK is visible to PostgREST schema cache
-- (The FK above already provides it; keep this notify after running in SQL editor)
-- NOTIFY pgrst, 'reload schema';