-- MVP schema alignment for EcoSphere (owner_id, contacts, services catalog, process services, finance)

-- Ensure helper function exists
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- CLIENTS adjustments
alter table public.clients
add column if not exists owner_id uuid,
add column if not exists type text default 'PJ',
add column if not exists trade_name text,
add column if not exists cpf_cnpj text,
add column if not exists city text,
add column if not exists state text,
add column if not exists address text,
add column if not exists active boolean default true;

update public.clients
set owner_id = user_id
where owner_id is null;

-- Keep owner_id nullable for now if legacy rows cannot be backfilled
-- Enforce NOT NULL in a later migration after backfill if needed

alter table public.clients enable row level security;

-- CLIENT_CONTACTS
create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  is_primary boolean default false,
  created_at timestamptz default now()
);

alter table public.client_contacts enable row level security;

-- ENTERPRISES adjustments
alter table public.enterprises
add column if not exists owner_id uuid,
add column if not exists cpf_cnpj text,
add column if not exists activity text,
add column if not exists address text,
add column if not exists city text,
add column if not exists state text,
add column if not exists lat numeric,
add column if not exists lng numeric,
add column if not exists notes text,
add column if not exists active boolean default true;

update public.enterprises
set owner_id = coalesce(owner_id, user_id)
where owner_id is null;

alter table public.enterprises enable row level security;

-- SERVICES catalog adjustments
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  user_id uuid,
  name text not null,
  category text not null default 'Outros',
  description text,
  default_price numeric(12,2) default 0,
  unit text default 'serviço',
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.services
add column if not exists owner_id uuid,
add column if not exists user_id uuid,
add column if not exists name text,
add column if not exists category text default 'Outros',
add column if not exists description text,
add column if not exists default_price numeric(12,2) default 0,
add column if not exists unit text default 'serviço',
add column if not exists active boolean default true,
add column if not exists created_at timestamptz default now();

update public.services
set owner_id = user_id
where owner_id is null;

alter table public.services enable row level security;

-- PROCESSES (environmental_processes) adjustments
create table if not exists public.environmental_processes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  user_id uuid,
  enterprise_id uuid references public.enterprises(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  process_number text,
  process_type text not null,
  agency text,
  status text not null default 'Em andamento',
  protocol_date date,
  due_date date,
  description text,
  priority text default 'Normal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.environmental_processes
add column if not exists owner_id uuid,
add column if not exists enterprise_id uuid,
add column if not exists client_id uuid,
add column if not exists process_number text,
add column if not exists process_type text,
add column if not exists agency text,
add column if not exists status text,
add column if not exists protocol_date date,
add column if not exists due_date date,
add column if not exists description text,
add column if not exists priority text default 'Normal';

update public.environmental_processes
set owner_id = user_id
where owner_id is null;

alter table public.environmental_processes enable row level security;

drop trigger if exists update_environmental_processes_updated_at on public.environmental_processes;
create trigger update_environmental_processes_updated_at
before update on public.environmental_processes
for each row
execute function public.update_updated_at_column();

-- PROCESS_SERVICES
create table if not exists public.process_services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  process_id uuid not null references public.environmental_processes(id) on delete cascade,
  service_id uuid not null references public.services(id),
  qty numeric(12,2) default 1,
  unit_price numeric(12,2) default 0,
  notes text,
  created_at timestamptz default now()
);

alter table public.process_services enable row level security;

-- TASKS adjustments (ensure owner_id and process_id)
alter table public.tasks
add column if not exists owner_id uuid,
add column if not exists process_id uuid references public.environmental_processes(id) on delete cascade,
add column if not exists status text default 'Aberta',
add column if not exists created_at timestamptz default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tasks'
      and column_name = 'user_id'
  ) then
    execute 'update public.tasks set owner_id = user_id where owner_id is null';
  end if;
end $$;

alter table public.tasks enable row level security;

-- DOCUMENTS adjustments
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  client_id uuid references public.clients(id) on delete cascade,
  enterprise_id uuid references public.enterprises(id) on delete cascade,
  process_id uuid references public.environmental_processes(id) on delete cascade,
  title text not null,
  file_path text not null,
  file_type text,
  created_at timestamptz default now()
);

alter table public.documents
add column if not exists owner_id uuid,
add column if not exists process_id uuid references public.environmental_processes(id) on delete cascade,
add column if not exists title text,
add column if not exists file_path text,
add column if not exists file_type text,
add column if not exists created_at timestamptz default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'documents'
      and column_name = 'user_id'
  ) then
    execute 'update public.documents set owner_id = user_id where owner_id is null';
  end if;
end $$;

alter table public.documents enable row level security;

-- FINANCEIRO MVP
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  enterprise_id uuid references public.enterprises(id) on delete set null,
  process_id uuid references public.environmental_processes(id) on delete set null,
  number text,
  status text default 'Rascunho',
  issue_date date default current_date,
  due_date date,
  notes text,
  total numeric(12,2) default 0,
  created_at timestamptz default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  qty numeric(12,2) default 1,
  unit_price numeric(12,2) default 0,
  total numeric(12,2) default 0,
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  paid_at date default current_date,
  amount numeric(12,2) not null,
  method text,
  notes text,
  created_at timestamptz default now()
);

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;

-- RLS policies (owner_id)
do $$
begin
  -- clients
  execute 'drop policy if exists "owner_select_clients" on public.clients';
  execute 'drop policy if exists "owner_insert_clients" on public.clients';
  execute 'drop policy if exists "owner_update_clients" on public.clients';
  execute 'drop policy if exists "owner_delete_clients" on public.clients';

  execute 'create policy "owner_select_clients" on public.clients for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_clients" on public.clients for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_clients" on public.clients for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_clients" on public.clients for delete using (owner_id = auth.uid())';

  -- client_contacts
  execute 'drop policy if exists "owner_select_client_contacts" on public.client_contacts';
  execute 'drop policy if exists "owner_insert_client_contacts" on public.client_contacts';
  execute 'drop policy if exists "owner_update_client_contacts" on public.client_contacts';
  execute 'drop policy if exists "owner_delete_client_contacts" on public.client_contacts';

  execute 'create policy "owner_select_client_contacts" on public.client_contacts for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_client_contacts" on public.client_contacts for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_client_contacts" on public.client_contacts for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_client_contacts" on public.client_contacts for delete using (owner_id = auth.uid())';

  -- enterprises
  execute 'drop policy if exists "owner_select_enterprises" on public.enterprises';
  execute 'drop policy if exists "owner_insert_enterprises" on public.enterprises';
  execute 'drop policy if exists "owner_update_enterprises" on public.enterprises';
  execute 'drop policy if exists "owner_delete_enterprises" on public.enterprises';

  execute 'create policy "owner_select_enterprises" on public.enterprises for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_enterprises" on public.enterprises for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_enterprises" on public.enterprises for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_enterprises" on public.enterprises for delete using (owner_id = auth.uid())';

  -- services
  execute 'drop policy if exists "owner_select_services" on public.services';
  execute 'drop policy if exists "owner_insert_services" on public.services';
  execute 'drop policy if exists "owner_update_services" on public.services';
  execute 'drop policy if exists "owner_delete_services" on public.services';

  execute 'create policy "owner_select_services" on public.services for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_services" on public.services for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_services" on public.services for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_services" on public.services for delete using (owner_id = auth.uid())';

  -- processes
  execute 'drop policy if exists "owner_select_processes" on public.environmental_processes';
  execute 'drop policy if exists "owner_insert_processes" on public.environmental_processes';
  execute 'drop policy if exists "owner_update_processes" on public.environmental_processes';
  execute 'drop policy if exists "owner_delete_processes" on public.environmental_processes';

  execute 'create policy "owner_select_processes" on public.environmental_processes for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_processes" on public.environmental_processes for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_processes" on public.environmental_processes for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_processes" on public.environmental_processes for delete using (owner_id = auth.uid())';

  -- process_services
  execute 'drop policy if exists "owner_select_process_services" on public.process_services';
  execute 'drop policy if exists "owner_insert_process_services" on public.process_services';
  execute 'drop policy if exists "owner_update_process_services" on public.process_services';
  execute 'drop policy if exists "owner_delete_process_services" on public.process_services';

  execute 'create policy "owner_select_process_services" on public.process_services for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_process_services" on public.process_services for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_process_services" on public.process_services for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_process_services" on public.process_services for delete using (owner_id = auth.uid())';

  -- tasks
  execute 'drop policy if exists "owner_select_tasks" on public.tasks';
  execute 'drop policy if exists "owner_insert_tasks" on public.tasks';
  execute 'drop policy if exists "owner_update_tasks" on public.tasks';
  execute 'drop policy if exists "owner_delete_tasks" on public.tasks';

  execute 'create policy "owner_select_tasks" on public.tasks for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_tasks" on public.tasks for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_tasks" on public.tasks for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_tasks" on public.tasks for delete using (owner_id = auth.uid())';

  -- documents
  execute 'drop policy if exists "owner_select_documents" on public.documents';
  execute 'drop policy if exists "owner_insert_documents" on public.documents';
  execute 'drop policy if exists "owner_update_documents" on public.documents';
  execute 'drop policy if exists "owner_delete_documents" on public.documents';

  execute 'create policy "owner_select_documents" on public.documents for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_documents" on public.documents for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_documents" on public.documents for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_documents" on public.documents for delete using (owner_id = auth.uid())';

  -- invoices
  execute 'drop policy if exists "owner_select_invoices" on public.invoices';
  execute 'drop policy if exists "owner_insert_invoices" on public.invoices';
  execute 'drop policy if exists "owner_update_invoices" on public.invoices';
  execute 'drop policy if exists "owner_delete_invoices" on public.invoices';

  execute 'create policy "owner_select_invoices" on public.invoices for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_invoices" on public.invoices for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_invoices" on public.invoices for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_invoices" on public.invoices for delete using (owner_id = auth.uid())';

  -- invoice_items
  execute 'drop policy if exists "owner_select_invoice_items" on public.invoice_items';
  execute 'drop policy if exists "owner_insert_invoice_items" on public.invoice_items';
  execute 'drop policy if exists "owner_update_invoice_items" on public.invoice_items';
  execute 'drop policy if exists "owner_delete_invoice_items" on public.invoice_items';

  execute 'create policy "owner_select_invoice_items" on public.invoice_items for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_invoice_items" on public.invoice_items for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_invoice_items" on public.invoice_items for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_invoice_items" on public.invoice_items for delete using (owner_id = auth.uid())';

  -- payments
  execute 'drop policy if exists "owner_select_payments" on public.payments';
  execute 'drop policy if exists "owner_insert_payments" on public.payments';
  execute 'drop policy if exists "owner_update_payments" on public.payments';
  execute 'drop policy if exists "owner_delete_payments" on public.payments';

  execute 'create policy "owner_select_payments" on public.payments for select using (owner_id = auth.uid())';
  execute 'create policy "owner_insert_payments" on public.payments for insert with check (owner_id = auth.uid())';
  execute 'create policy "owner_update_payments" on public.payments for update using (owner_id = auth.uid())';
  execute 'create policy "owner_delete_payments" on public.payments for delete using (owner_id = auth.uid())';
end $$;

-- Indexes
create index if not exists idx_clients_owner_id on public.clients(owner_id);
create index if not exists idx_enterprises_owner_id on public.enterprises(owner_id);
create index if not exists idx_services_owner_id on public.services(owner_id);
create index if not exists idx_processes_owner_id on public.environmental_processes(owner_id);
create index if not exists idx_process_services_owner_id on public.process_services(owner_id);
create index if not exists idx_tasks_owner_id on public.tasks(owner_id);
create index if not exists idx_documents_owner_id on public.documents(owner_id);
create index if not exists idx_invoices_owner_id on public.invoices(owner_id);

create index if not exists idx_enterprises_client_id on public.enterprises(client_id);
create index if not exists idx_processes_enterprise_id on public.environmental_processes(enterprise_id);
create index if not exists idx_process_services_process_id on public.process_services(process_id);
create index if not exists idx_tasks_process_id on public.tasks(process_id);
create index if not exists idx_documents_process_id on public.documents(process_id);
create index if not exists idx_invoices_client_id on public.invoices(client_id);

-- Seed services for existing users (catalog)
insert into public.services (owner_id, user_id, name, category, default_price, unit, active)
select u.id, u.id, s.name, s.category, 0, 'serviço', true
from auth.users u
cross join (
  values
    ('Licença Prévia (LP)', 'Licenciamento'),
    ('Licença de Instalação (LI)', 'Licenciamento'),
    ('Licença de Operação (LO)', 'Licenciamento'),
    ('Renovação de LO', 'Licenciamento'),
    ('Licença Ambiental Única (LAU)', 'Licenciamento'),
    ('Regularização / Atendimento a Notificação / Auto de Infração', 'Licenciamento'),
    ('Renovação / Atualização de condicionantes', 'Licenciamento'),
    ('PGRS', 'Resíduos'),
    ('PGRSS', 'Resíduos'),
    ('MTR / Manifesto de Transporte de Resíduos', 'Resíduos'),
    ('Inventário de Resíduos / Relatório anual', 'Resíduos'),
    ('Treinamento / Procedimentos de segregação', 'Resíduos'),
    ('RCA', 'Estudos e Relatórios'),
    ('PCA', 'Estudos e Relatórios'),
    ('EIA/RIMA', 'Estudos e Relatórios'),
    ('PRAD', 'Estudos e Relatórios'),
    ('Relatório de Monitoramento Ambiental', 'Estudos e Relatórios'),
    ('Plano de Emergência Ambiental / PAE', 'Estudos e Relatórios'),
    ('CTF/APP', 'IBAMA / Federal'),
    ('CTF/AIDA', 'IBAMA / Federal'),
    ('RAPP', 'IBAMA / Federal'),
    ('TCFA (suporte/regularização)', 'IBAMA / Federal'),
    ('Cadastro/renovação no IBAMA', 'IBAMA / Federal'),
    ('Cadastro Ambiental Rural (CAR)', 'Cadastros e Outorgas'),
    ('Outorga de uso de recursos hídricos', 'Cadastros e Outorgas'),
    ('Cadastro municipal/estadual ambiental', 'Cadastros e Outorgas'),
    ('Diagnóstico de conformidade ambiental', 'Auditoria/Consultoria'),
    ('Auditoria interna de requisitos', 'Auditoria/Consultoria'),
    ('Implantação de rotinas e checklist de compliance', 'Auditoria/Consultoria')
) as s(name, category)
where not exists (
  select 1
  from public.services sv
  where sv.owner_id = u.id and sv.name = s.name
);
