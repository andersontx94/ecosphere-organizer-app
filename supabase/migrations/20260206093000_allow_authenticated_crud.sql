-- Allow authenticated users to read/write data in core tables
-- Adjust to stricter, per-user policies as needed.

alter table public.clients enable row level security;
alter table public.processes enable row level security;
alter table public.enterprises enable row level security;
alter table public.services enable row level security;
alter table public.financial_entries enable row level security;
alter table public.process_tasks enable row level security;

drop policy if exists "authenticated_crud_clients" on public.clients;
create policy "authenticated_crud_clients"
on public.clients
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_crud_processes" on public.processes;
create policy "authenticated_crud_processes"
on public.processes
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_crud_enterprises" on public.enterprises;
create policy "authenticated_crud_enterprises"
on public.enterprises
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_crud_services" on public.services;
create policy "authenticated_crud_services"
on public.services
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_crud_financial_entries" on public.financial_entries;
create policy "authenticated_crud_financial_entries"
on public.financial_entries
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_crud_process_tasks" on public.process_tasks;
create policy "authenticated_crud_process_tasks"
on public.process_tasks
for all
to authenticated
using (true)
with check (true);
