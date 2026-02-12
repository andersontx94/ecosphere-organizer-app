-- Proposals module: proposals + proposal_items + RLS + RPC conversion

create table if not exists public.proposals (
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
  total_amount numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  converted_at timestamptz,
  converted_client_id uuid references public.clients(id) on delete set null,
  converted_enterprise_id uuid references public.enterprises(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_proposals_org on public.proposals(organization_id);
create index if not exists idx_proposals_status on public.proposals(organization_id, status);
create index if not exists idx_proposals_converted on public.proposals(converted_client_id, converted_enterprise_id);

drop trigger if exists update_proposals_updated_at on public.proposals;
create trigger update_proposals_updated_at
before update on public.proposals
for each row
execute function public.update_updated_at_column();

create table if not exists public.proposal_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  name text not null,
  description text,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total_price numeric generated always as (quantity * unit_price) stored,
  created_at timestamptz default now()
);

create index if not exists idx_proposal_items_org on public.proposal_items(organization_id);
create index if not exists idx_proposal_items_proposal on public.proposal_items(proposal_id);

alter table public.proposals enable row level security;
alter table public.proposal_items enable row level security;

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

drop policy if exists "org_select_proposal_items" on public.proposal_items;
drop policy if exists "org_insert_proposal_items" on public.proposal_items;
drop policy if exists "org_update_proposal_items" on public.proposal_items;
drop policy if exists "org_delete_proposal_items" on public.proposal_items;

create policy "org_select_proposal_items"
on public.proposal_items for select
using (public.can_access_org(organization_id));

create policy "org_insert_proposal_items"
on public.proposal_items for insert
with check (public.can_access_org(organization_id));

create policy "org_update_proposal_items"
on public.proposal_items for update
using (public.can_access_org(organization_id));

create policy "org_delete_proposal_items"
on public.proposal_items for delete
using (public.can_access_org(organization_id));

create or replace function public.convert_proposal(
  proposal_id uuid,
  options jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.proposals%rowtype;
  v_client_id uuid;
  v_enterprise_id uuid;
  v_invoice_id uuid;
  v_process_id uuid;
  v_cpf_cnpj text;
  v_company_key text;
  v_process_type_id uuid;
  v_process_type_name text;
  v_create_invoice boolean := coalesce((options->>'create_invoice')::boolean, false);
  v_create_process boolean := coalesce((options->>'create_process')::boolean, false);
begin
  set local row_security = on;

  select * into v_proposal
  from public.proposals
  where id = proposal_id
  for update;

  if not found then
    raise exception 'Proposta não encontrada';
  end if;

  if not public.can_access_org(v_proposal.organization_id) then
    raise exception 'Acesso negado';
  end if;

  if v_proposal.status = 'won' and v_proposal.converted_client_id is not null then
    return jsonb_build_object(
      'client_id', v_proposal.converted_client_id,
      'enterprise_id', v_proposal.converted_enterprise_id,
      'invoice_id', null,
      'process_id', null
    );
  end if;

  v_cpf_cnpj := regexp_replace(coalesce(v_proposal.cpf_cnpj, ''), '\D', '', 'g');
  v_company_key := regexp_replace(lower(v_proposal.company_name), '[^a-z0-9]+', '', 'g');

  if v_cpf_cnpj <> '' then
    select id into v_client_id
    from public.clients
    where organization_id = v_proposal.organization_id
      and regexp_replace(coalesce(cpf_cnpj, ''), '\D', '', 'g') = v_cpf_cnpj
    limit 1;
  end if;

  if v_client_id is null then
    select id into v_client_id
    from public.clients
    where organization_id = v_proposal.organization_id
      and regexp_replace(lower(name), '[^a-z0-9]+', '', 'g') = v_company_key
    limit 1;
  end if;

  if v_client_id is null then
    insert into public.clients (
      organization_id,
      owner_id,
      name,
      type,
      trade_name,
      cpf_cnpj,
      phone,
      city,
      state,
      address,
      notes,
      active
    ) values (
      v_proposal.organization_id,
      auth.uid(),
      v_proposal.company_name,
      case
        when length(v_cpf_cnpj) = 14 then 'PJ'
        else 'PF'
      end,
      null,
      nullif(v_proposal.cpf_cnpj, ''),
      v_proposal.contact_phone,
      v_proposal.city,
      v_proposal.state,
      null,
      v_proposal.notes,
      true
    )
    returning id into v_client_id;
  end if;

  select id into v_enterprise_id
  from public.enterprises
  where organization_id = v_proposal.organization_id
    and client_id = v_client_id
    and regexp_replace(lower(name), '[^a-z0-9]+', '', 'g') = v_company_key
  limit 1;

  if v_enterprise_id is null then
    insert into public.enterprises (
      organization_id,
      owner_id,
      client_id,
      name,
      city,
      state,
      address,
      notes,
      active
    ) values (
      v_proposal.organization_id,
      auth.uid(),
      v_client_id,
      v_proposal.company_name,
      v_proposal.city,
      v_proposal.state,
      null,
      v_proposal.notes,
      true
    )
    returning id into v_enterprise_id;
  end if;

  if v_create_process then
    v_process_type_id := nullif((options->>'process_type_id')::uuid, null);
    if v_process_type_id is null then
      raise exception 'process_type_id é obrigatório para criar processo';
    end if;

    select name into v_process_type_name
    from public.process_types
    where id = v_process_type_id
      and organization_id = v_proposal.organization_id;

    if v_process_type_name is null then
      raise exception 'Tipo de processo inválido';
    end if;

    insert into public.environmental_processes (
      organization_id,
      user_id,
      owner_id,
      enterprise_id,
      client_id,
      process_type_id,
      process_type,
      agency,
      status,
      notes,
      priority
    ) values (
      v_proposal.organization_id,
      auth.uid(),
      auth.uid(),
      v_enterprise_id,
      v_client_id,
      v_process_type_id,
      v_process_type_name,
      coalesce(options->>'agency', 'A definir'),
      'Em andamento',
      v_proposal.notes,
      'Normal'
    )
    returning id into v_process_id;

    insert into public.process_services (
      organization_id,
      process_id,
      service_id,
      qty,
      unit_price
    )
    select
      v_proposal.organization_id,
      v_process_id,
      pi.service_id,
      pi.quantity,
      pi.unit_price
    from public.proposal_items pi
    where pi.proposal_id = v_proposal.id
      and pi.service_id is not null;
  end if;

  if v_create_invoice then
    insert into public.invoices (
      organization_id,
      client_id,
      enterprise_id,
      process_id,
      status,
      notes,
      total
    ) values (
      v_proposal.organization_id,
      v_client_id,
      v_enterprise_id,
      v_process_id,
      'Rascunho',
      v_proposal.notes,
      v_proposal.total_amount
    )
    returning id into v_invoice_id;

    insert into public.invoice_items (
      organization_id,
      invoice_id,
      description,
      qty,
      unit_price,
      total
    )
    select
      v_proposal.organization_id,
      v_invoice_id,
      pi.name,
      pi.quantity,
      pi.unit_price,
      pi.total_price
    from public.proposal_items pi
    where pi.proposal_id = v_proposal.id;
  end if;

  update public.proposals
  set status = 'won',
      converted_at = now(),
      converted_client_id = v_client_id,
      converted_enterprise_id = v_enterprise_id
  where id = v_proposal.id;

  return jsonb_build_object(
    'client_id', v_client_id,
    'enterprise_id', v_enterprise_id,
    'invoice_id', v_invoice_id,
    'process_id', v_process_id
  );
end;
$$;
