-- Fix infinite recursion in org member RLS by using SECURITY DEFINER helper

create or replace function public.is_org_member(_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = _org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
$$;

-- Organizations policies
alter table public.organizations enable row level security;

drop policy if exists "Organizations are viewable by members" on public.organizations;
create policy "Organizations are viewable by members"
  on public.organizations
  for select
  using (public.is_org_member(id));

drop policy if exists "Organizations can be created by authenticated users" on public.organizations;
create policy "Organizations can be created by authenticated users"
  on public.organizations
  for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Organizations can be updated by owners" on public.organizations;
create policy "Organizations can be updated by owners"
  on public.organizations
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Organizations can be deleted by owners" on public.organizations;
create policy "Organizations can be deleted by owners"
  on public.organizations
  for delete
  using (auth.uid() = owner_id);

-- Organization members policies
alter table public.organization_members enable row level security;

drop policy if exists "Organization members are viewable by members" on public.organization_members;
create policy "Organization members are viewable by members"
  on public.organization_members
  for select
  using (public.is_org_member(organization_id));

drop policy if exists "Organization owners can add members" on public.organization_members;
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

drop policy if exists "Organization owners can update members" on public.organization_members;
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

drop policy if exists "Organization owners can remove members" on public.organization_members;
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
