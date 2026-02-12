-- Add organization_id + created_by to core tables and backfill (safe if tables missing)

create or replace function public.set_created_by_and_org()
returns trigger as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;

  if new.organization_id is null then
    new.organization_id := public.get_active_organization_id();
  end if;

  return new;
end;
$$ language plpgsql;

do $do$
declare
  tbl text;
  with_created_by text[] := array[
    'clients','enterprises','environmental_processes','tasks','documents','services',
    'process_services','invoices','invoice_items','payments','process_types','process_stages',
    'process_revenues','process_costs','accounts_receivable','accounts_payable'
  ];
  with_org_only text[] := array[
    'financial_transactions','financial_accounts','projects','environmental_services','client_contacts'
  ];
begin
  foreach tbl in array with_created_by loop
    if to_regclass('public.' || tbl) is not null then
      execute format('alter table public.%I add column if not exists organization_id uuid', tbl);
      execute format('alter table public.%I add column if not exists created_by uuid', tbl);
    else
      raise notice 'Skipping missing table public.%', tbl;
    end if;
  end loop;

  foreach tbl in array with_org_only loop
    if to_regclass('public.' || tbl) is not null then
      execute format('alter table public.%I add column if not exists organization_id uuid', tbl);
    else
      raise notice 'Skipping missing table public.%', tbl;
    end if;
  end loop;
end $do$;

-- Backfill organizations for existing users
insert into public.organizations (name, created_by)
select
  coalesce(p.name, split_part(u.email, '@', 1)) || ' Org',
  u.id
from auth.users u
left join public.profiles p on p.user_id = u.id
where not exists (
  select 1 from public.organizations o where o.created_by = u.id
);

insert into public.organization_members (organization_id, user_id, role)
select o.id, o.created_by, 'owner'
from public.organizations o
where not exists (
  select 1 from public.organization_members m
  where m.organization_id = o.id and m.user_id = o.created_by
);

update public.profiles p
set active_organization_id = o.id
from public.organizations o
where p.user_id = o.created_by
  and p.active_organization_id is null;

-- FKs (only if tables exist)
do $do$
begin
  if to_regclass('public.clients') is not null then
    execute 'alter table public.clients add constraint clients_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.enterprises') is not null then
    execute 'alter table public.enterprises add constraint enterprises_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.environmental_processes') is not null then
    execute 'alter table public.environmental_processes add constraint environmental_processes_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.tasks') is not null then
    execute 'alter table public.tasks add constraint tasks_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.documents') is not null then
    execute 'alter table public.documents add constraint documents_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.services') is not null then
    execute 'alter table public.services add constraint services_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.process_services') is not null then
    execute 'alter table public.process_services add constraint process_services_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.invoices') is not null then
    execute 'alter table public.invoices add constraint invoices_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.invoice_items') is not null then
    execute 'alter table public.invoice_items add constraint invoice_items_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.payments') is not null then
    execute 'alter table public.payments add constraint payments_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.accounts_receivable') is not null then
    execute 'alter table public.accounts_receivable add constraint accounts_receivable_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.accounts_payable') is not null then
    execute 'alter table public.accounts_payable add constraint accounts_payable_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.financial_transactions') is not null then
    execute 'alter table public.financial_transactions add constraint financial_transactions_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.financial_accounts') is not null then
    execute 'alter table public.financial_accounts add constraint financial_accounts_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.projects') is not null then
    execute 'alter table public.projects add constraint projects_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.environmental_services') is not null then
    execute 'alter table public.environmental_services add constraint environmental_services_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
  if to_regclass('public.client_contacts') is not null then
    execute 'alter table public.client_contacts add constraint client_contacts_organization_id_fkey foreign key (organization_id) references public.organizations(id)';
  end if;
end $do$;

-- Triggers (only if tables exist)
do $do$
begin
  if to_regclass('public.clients') is not null then
    execute 'drop trigger if exists set_clients_org on public.clients';
    execute 'create trigger set_clients_org before insert on public.clients for each row execute function public.set_created_by_and_org()';
  end if;
  if to_regclass('public.enterprises') is not null then
    execute 'drop trigger if exists set_enterprises_org on public.enterprises';
    execute 'create trigger set_enterprises_org before insert on public.enterprises for each row execute function public.set_created_by_and_org()';
  end if;
  if to_regclass('public.environmental_processes') is not null then
    execute 'drop trigger if exists set_processes_org on public.environmental_processes';
    execute 'create trigger set_processes_org before insert on public.environmental_processes for each row execute function public.set_created_by_and_org()';
  end if;
  if to_regclass('public.tasks') is not null then
    execute 'drop trigger if exists set_tasks_org on public.tasks';
    execute 'create trigger set_tasks_org before insert on public.tasks for each row execute function public.set_created_by_and_org()';
  end if;
  if to_regclass('public.documents') is not null then
    execute 'drop trigger if exists set_documents_org on public.documents';
    execute 'create trigger set_documents_org before insert on public.documents for each row execute function public.set_created_by_and_org()';
  end if;
  if to_regclass('public.services') is not null then
    execute 'drop trigger if exists set_services_org on public.services';
    execute 'create trigger set_services_org before insert on public.services for each row execute function public.set_created_by_and_org()';
  end if;
  if to_regclass('public.process_services') is not null then
    execute 'drop trigger if exists set_process_services_org on public.process_services';
    execute 'create trigger set_process_services_org before insert on public.process_services for each row execute function public.set_created_by_and_org()';
  end if;
  if to_regclass('public.invoices') is not null then
    execute 'drop trigger if exists set_invoices_org on public.invoices';
    execute 'create trigger set_invoices_org before insert on public.invoices for each row execute function public.set_created_by_and_org()';
  end if;
  if to_regclass('public.invoice_items') is not null then
    execute 'drop trigger if exists set_invoice_items_org on public.invoice_items';
    execute 'create trigger set_invoice_items_org before insert on public.invoice_items for each row execute function public.set_created_by_and_org()';
  end if;
  if to_regclass('public.payments') is not null then
    execute 'drop trigger if exists set_payments_org on public.payments';
    execute 'create trigger set_payments_org before insert on public.payments for each row execute function public.set_created_by_and_org()';
  end if;
end $do$;

-- RLS policies (only if tables exist)
create or replace function public.can_access_org(_org_id uuid)
returns boolean
language sql
stable
as $$
  select public.is_org_member(_org_id)
$$;

do $do$
begin
  if to_regclass('public.clients') is not null then
    execute 'drop policy if exists "org_select_clients" on public.clients';
    execute 'drop policy if exists "org_insert_clients" on public.clients';
    execute 'drop policy if exists "org_update_clients" on public.clients';
    execute 'drop policy if exists "org_delete_clients" on public.clients';
    execute 'create policy "org_select_clients" on public.clients for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_clients" on public.clients for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_clients" on public.clients for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_clients" on public.clients for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.enterprises') is not null then
    execute 'drop policy if exists "org_select_enterprises" on public.enterprises';
    execute 'drop policy if exists "org_insert_enterprises" on public.enterprises';
    execute 'drop policy if exists "org_update_enterprises" on public.enterprises';
    execute 'drop policy if exists "org_delete_enterprises" on public.enterprises';
    execute 'create policy "org_select_enterprises" on public.enterprises for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_enterprises" on public.enterprises for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_enterprises" on public.enterprises for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_enterprises" on public.enterprises for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.environmental_processes') is not null then
    execute 'drop policy if exists "org_select_processes" on public.environmental_processes';
    execute 'drop policy if exists "org_insert_processes" on public.environmental_processes';
    execute 'drop policy if exists "org_update_processes" on public.environmental_processes';
    execute 'drop policy if exists "org_delete_processes" on public.environmental_processes';
    execute 'create policy "org_select_processes" on public.environmental_processes for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_processes" on public.environmental_processes for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_processes" on public.environmental_processes for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_processes" on public.environmental_processes for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.tasks') is not null then
    execute 'drop policy if exists "org_select_tasks" on public.tasks';
    execute 'drop policy if exists "org_insert_tasks" on public.tasks';
    execute 'drop policy if exists "org_update_tasks" on public.tasks';
    execute 'drop policy if exists "org_delete_tasks" on public.tasks';
    execute 'create policy "org_select_tasks" on public.tasks for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_tasks" on public.tasks for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_tasks" on public.tasks for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_tasks" on public.tasks for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.documents') is not null then
    execute 'drop policy if exists "org_select_documents" on public.documents';
    execute 'drop policy if exists "org_insert_documents" on public.documents';
    execute 'drop policy if exists "org_update_documents" on public.documents';
    execute 'drop policy if exists "org_delete_documents" on public.documents';
    execute 'create policy "org_select_documents" on public.documents for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_documents" on public.documents for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_documents" on public.documents for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_documents" on public.documents for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.services') is not null then
    execute 'drop policy if exists "org_select_services" on public.services';
    execute 'drop policy if exists "org_insert_services" on public.services';
    execute 'drop policy if exists "org_update_services" on public.services';
    execute 'drop policy if exists "org_delete_services" on public.services';
    execute 'create policy "org_select_services" on public.services for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_services" on public.services for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_services" on public.services for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_services" on public.services for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.invoices') is not null then
    execute 'drop policy if exists "org_select_invoices" on public.invoices';
    execute 'drop policy if exists "org_insert_invoices" on public.invoices';
    execute 'drop policy if exists "org_update_invoices" on public.invoices';
    execute 'drop policy if exists "org_delete_invoices" on public.invoices';
    execute 'create policy "org_select_invoices" on public.invoices for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_invoices" on public.invoices for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_invoices" on public.invoices for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_invoices" on public.invoices for delete using (public.can_access_org(organization_id))';
  end if;
end $do$;

create index if not exists idx_clients_org on public.clients(organization_id);
create index if not exists idx_enterprises_org on public.enterprises(organization_id);
create index if not exists idx_processes_org on public.environmental_processes(organization_id);
create index if not exists idx_tasks_org on public.tasks(organization_id);
create index if not exists idx_docs_org on public.documents(organization_id);
create index if not exists idx_services_org on public.services(organization_id);
create index if not exists idx_invoices_org on public.invoices(organization_id);

-- Remove permissive legacy policies if present
 do $do$
 begin
   if to_regclass('public.clients') is not null then
     execute 'drop policy if exists "authenticated_crud_clients" on public.clients';
   end if;
   if to_regclass('public.enterprises') is not null then
     execute 'drop policy if exists "authenticated_crud_enterprises" on public.enterprises';
   end if;
   if to_regclass('public.services') is not null then
     execute 'drop policy if exists "authenticated_crud_services" on public.services';
   end if;
   if to_regclass('public.environmental_processes') is not null then
     execute 'drop policy if exists "authenticated_crud_processes" on public.environmental_processes';
   end if;
   if to_regclass('public.tasks') is not null then
     execute 'drop policy if exists "authenticated_crud_tasks" on public.tasks';
   end if;
   if to_regclass('public.documents') is not null then
     execute 'drop policy if exists "authenticated_crud_documents" on public.documents';
   end if;
 end $do$;
