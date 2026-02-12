-- Multi-tenant base: organizations, members, RBAC base

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.permissions (
  key text primary key,
  description text
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  is_system boolean default false
);

create table if not exists public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_key text references public.permissions(key) on delete cascade,
  primary key (role_id, permission_key)
);

alter table public.profiles
add column if not exists active_organization_id uuid references public.organizations(id);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_organizations_updated_at on public.organizations;
create trigger update_organizations_updated_at
before update on public.organizations
for each row execute function public.update_updated_at_column();

create or replace function public.get_active_organization_id()
returns uuid
language sql
stable
as $$
  select active_organization_id
  from public.profiles
  where user_id = auth.uid()
$$;

create or replace function public.is_org_member(_org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = _org_id and m.user_id = auth.uid() and m.status = 'active'
  )
$$;

create or replace function public.handle_new_user()
returns trigger as $$
declare
  org_id uuid;
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;

  insert into public.organizations (name, created_by)
  values (
    coalesce(new.raw_user_meta_data->>'organization_name',
             coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)) || ' Org'),
    new.id
  )
  returning id into org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (org_id, new.id, 'owner');

  update public.profiles
    set active_organization_id = org_id
  where user_id = new.id;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

drop policy if exists "org_select" on public.organizations;
create policy "org_select"
on public.organizations for select
using (public.is_org_member(id));

drop policy if exists "org_members_select" on public.organization_members;
create policy "org_members_select"
on public.organization_members for select
using (public.is_org_member(organization_id));

drop policy if exists "org_members_insert" on public.organization_members;
create policy "org_members_insert"
on public.organization_members for insert
with check (public.is_org_member(organization_id));
