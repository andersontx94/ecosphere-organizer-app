-- Ensure organizations SELECT is allowed for owners
alter table public.organizations enable row level security;

drop policy if exists "Organizations selectable by owner" on public.organizations;
create policy "Organizations selectable by owner"
  on public.organizations
  for select
  using (auth.uid() = owner_id);
