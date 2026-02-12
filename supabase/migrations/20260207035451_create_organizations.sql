-- Ensure organizations and organization_members exist and add owner_id support
create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  created_by uuid references auth.users(id) on delete set null,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.organizations
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

update public.organizations
set owner_id = created_by
where owner_id is null and created_by is not null;

create unique index if not exists organization_members_org_user_uidx
  on public.organization_members(organization_id, user_id);

create index if not exists organization_members_user_idx
  on public.organization_members(user_id);

create index if not exists organization_members_org_idx
  on public.organization_members(organization_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Organizations policies (owner + members)
create policy "Organizations are viewable by members"
  on public.organizations
  for select
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organizations.id
        and m.user_id = auth.uid()
    )
  );

create policy "Organizations can be created by authenticated users"
  on public.organizations
  for insert
  with check (auth.uid() = owner_id);

create policy "Organizations can be updated by owners"
  on public.organizations
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Organizations can be deleted by owners"
  on public.organizations
  for delete
  using (auth.uid() = owner_id);

-- Organization members policies
create policy "Organization members are viewable by members"
  on public.organization_members
  for select
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organization_members.organization_id
        and m.user_id = auth.uid()
    )
  );

create policy "Organization owners can add members"
  on public.organization_members
  for insert
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_members.organization_id
        and o.owner_id = auth.uid()
    )
  );

create policy "Organization owners can update members"
  on public.organization_members
  for update
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_members.organization_id
        and o.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_members.organization_id
        and o.owner_id = auth.uid()
    )
  );

create policy "Organization owners can remove members"
  on public.organization_members
  for delete
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_members.organization_id
        and o.owner_id = auth.uid()
    )
  );
