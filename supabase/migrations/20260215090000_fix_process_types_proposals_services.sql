-- Fix process_types + proposals + proposal_items + services (multi-tenant)

-- PROCESS TYPES
do $$
begin
  if to_regclass('public.process_types') is null then
    create table public.process_types (
      id uuid primary key default gen_random_uuid(),
      organization_id uuid not null references public.organizations(id) on delete cascade,
      name text not null,
      category text,
      code text,
      suggested_deadline_days integer,
      requires_agency boolean not null default false,
      requires_protocol boolean not null default false,
      is_active boolean not null default true,
      created_at timestamptz not null default now()
    );
  end if;
end $$;

alter table public.process_types
  add column if not exists organization_id uuid,
  add column if not exists name text,
  add column if not exists category text,
  add column if not exists code text,
  add column if not exists suggested_deadline_days integer,
  add column if not exists requires_agency boolean default false,
  add column if not exists requires_protocol boolean default false,
  add column if not exists is_active boolean default true,
  add column if not exists default_deadline_days integer,
  add column if not exists requires_protocol_number boolean default true,
  add column if not exists active boolean default true,
  add column if not exists created_at timestamptz default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'process_types_organization_id_fkey'
  ) then
    alter table public.process_types
      add constraint process_types_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_process_types_org
  on public.process_types(organization_id);

create unique index if not exists idx_process_types_org_code
  on public.process_types(organization_id, code)
  where code is not null;

create or replace function public.sync_process_types_compat()
returns trigger
language plpgsql
as $$
begin
  if new.default_deadline_days is null then
    new.default_deadline_days := new.suggested_deadline_days;
  end if;
  if new.suggested_deadline_days is null then
    new.suggested_deadline_days := new.default_deadline_days;
  end if;

  if new.requires_protocol_number is null then
    new.requires_protocol_number := coalesce(new.requires_protocol, false);
  end if;
  if new.requires_protocol is null then
    new.requires_protocol := coalesce(new.requires_protocol_number, false);
  end if;

  if new.active is null then
    new.active := coalesce(new.is_active, true);
  end if;
  if new.is_active is null then
    new.is_active := coalesce(new.active, true);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_process_types_compat on public.process_types;
create trigger trg_sync_process_types_compat
before insert or update on public.process_types
for each row
execute function public.sync_process_types_compat();

alter table public.process_types enable row level security;

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

-- PROPOSALS
do $$
begin
  if to_regclass('public.proposals') is null then
    create table public.proposals (
      id uuid primary key default gen_random_uuid(),
      organization_id uuid not null references public.organizations(id) on delete cascade,
      status text not null default 'draft',
      title text not null,
      company_name text not null,
      contact_name text,
      contact_email text,
      contact_phone text,
      cpf_cnpj text,
      city text,
      state text,
      notes text,
      total_amount numeric(12,2) not null default 0,
      total numeric(12,2) not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      converted_at timestamptz,
      converted_client_id uuid references public.clients(id) on delete set null,
      converted_enterprise_id uuid references public.enterprises(id) on delete set null,
      created_by uuid references auth.users(id) on delete set null
    );
  end if;
end $$;

alter table public.proposals
  add column if not exists organization_id uuid,
  add column if not exists status text default 'draft',
  add column if not exists total_amount numeric(12,2) default 0,
  add column if not exists total numeric(12,2) default 0,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'proposals_organization_id_fkey'
  ) then
    alter table public.proposals
      add constraint proposals_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;

alter table public.proposals enable row level security;

drop policy if exists "org_select_proposals" on public.proposals;
drop policy if exists "org_insert_proposals" on public.proposals;
drop policy if exists "org_update_proposals" on public.proposals;
drop policy if exists "org_delete_proposals" on public.proposals;

create policy "org_select_proposals"
on public.proposals for select
using (public.can_access_org(organization_id));

create policy "org_insert_proposals"
on public.proposals for insert
with check (public.can_access_org(organization_id));

create policy "org_update_proposals"
on public.proposals for update
using (public.can_access_org(organization_id));

create policy "org_delete_proposals"
on public.proposals for delete
using (public.can_access_org(organization_id));

-- PROPOSAL ITEMS
do $$
begin
  if to_regclass('public.proposal_items') is null then
    create table public.proposal_items (
      id uuid primary key default gen_random_uuid(),
      proposal_id uuid not null references public.proposals(id) on delete cascade,
      organization_id uuid not null references public.organizations(id) on delete cascade,
      service_id uuid references public.services(id) on delete set null,
      name text not null,
      description text,
      quantity integer not null default 1,
      unit_price numeric(12,2) not null default 0,
      total numeric(12,2) not null default 0,
      created_at timestamptz not null default now()
    );
  end if;
end $$;

alter table public.proposal_items
  add column if not exists organization_id uuid,
  add column if not exists service_id uuid,
  add column if not exists total numeric(12,2) default 0,
  add column if not exists created_at timestamptz default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'proposal_items_organization_id_fkey'
  ) then
    alter table public.proposal_items
      add constraint proposal_items_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;

update public.proposal_items pi
set organization_id = p.organization_id
from public.proposals p
where pi.organization_id is null
  and pi.proposal_id = p.id;

create or replace function public.set_proposal_item_total()
returns trigger
language plpgsql
as $$
begin
  new.total := coalesce(new.quantity, 1) * coalesce(new.unit_price, 0);
  return new;
end;
$$;

drop trigger if exists trg_set_proposal_item_total on public.proposal_items;
create trigger trg_set_proposal_item_total
before insert or update on public.proposal_items
for each row
execute function public.set_proposal_item_total();

create or replace function public.recalc_proposal_totals(p_proposal_id uuid)
returns void
language plpgsql
as $$
declare
  v_total numeric(12,2);
begin
  select coalesce(sum(coalesce(total, quantity * unit_price)), 0)
  into v_total
  from public.proposal_items
  where proposal_id = p_proposal_id;

  update public.proposals
  set total_amount = v_total,
      total = v_total
  where id = p_proposal_id;
end;
$$;

create or replace function public.sync_proposal_totals()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalc_proposal_totals(old.proposal_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and new.proposal_id <> old.proposal_id then
    perform public.recalc_proposal_totals(old.proposal_id);
  end if;

  perform public.recalc_proposal_totals(new.proposal_id);
  return new;
end;
$$;

drop trigger if exists trg_sync_proposal_totals on public.proposal_items;
create trigger trg_sync_proposal_totals
after insert or update or delete on public.proposal_items
for each row
execute function public.sync_proposal_totals();

alter table public.proposal_items enable row level security;

drop policy if exists "org_select_proposal_items" on public.proposal_items;
drop policy if exists "org_insert_proposal_items" on public.proposal_items;
drop policy if exists "org_update_proposal_items" on public.proposal_items;
drop policy if exists "org_delete_proposal_items" on public.proposal_items;

create policy "org_select_proposal_items"
on public.proposal_items for select
using (
  exists (
    select 1
    from public.proposals p
    where p.id = proposal_id
      and public.can_access_org(p.organization_id)
  )
);

create policy "org_insert_proposal_items"
on public.proposal_items for insert
with check (
  exists (
    select 1
    from public.proposals p
    where p.id = proposal_id
      and public.can_access_org(p.organization_id)
  )
);

create policy "org_update_proposal_items"
on public.proposal_items for update
using (
  exists (
    select 1
    from public.proposals p
    where p.id = proposal_id
      and public.can_access_org(p.organization_id)
  )
);

create policy "org_delete_proposal_items"
on public.proposal_items for delete
using (
  exists (
    select 1
    from public.proposals p
    where p.id = proposal_id
      and public.can_access_org(p.organization_id)
  )
);

-- SERVICES (ensure multi-tenant + RLS)
do $$
begin
  if to_regclass('public.services') is not null then
    execute 'alter table public.services add column if not exists organization_id uuid';
    execute 'alter table public.services enable row level security';
    execute 'drop policy if exists "org_select_services" on public.services';
    execute 'drop policy if exists "org_insert_services" on public.services';
    execute 'drop policy if exists "org_update_services" on public.services';
    execute 'drop policy if exists "org_delete_services" on public.services';
    execute 'create policy "org_select_services" on public.services for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_services" on public.services for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_services" on public.services for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_services" on public.services for delete using (public.can_access_org(organization_id))';
  end if;
end $$;

-- Reload PostgREST schema cache
select pg_notify('pgrst', 'reload schema');
