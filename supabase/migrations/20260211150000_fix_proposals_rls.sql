-- Fix proposals RLS policies to ensure inserts work for active org members

alter table public.proposals enable row level security;
alter table public.proposal_items enable row level security;

drop policy if exists "org_select_proposals" on public.proposals;
drop policy if exists "org_insert_proposals" on public.proposals;
drop policy if exists "org_update_proposals" on public.proposals;
drop policy if exists "org_delete_proposals" on public.proposals;

create policy "org_select_proposals"
on public.proposals for select
using (
  public.can_access_org(organization_id)
  or organization_id = public.get_active_organization_id()
);

create policy "org_insert_proposals"
on public.proposals for insert
with check (
  public.can_access_org(organization_id)
  or organization_id = public.get_active_organization_id()
);

create policy "org_update_proposals"
on public.proposals for update
using (
  public.can_access_org(organization_id)
  or organization_id = public.get_active_organization_id()
);

create policy "org_delete_proposals"
on public.proposals for delete
using (
  public.can_access_org(organization_id)
  or organization_id = public.get_active_organization_id()
);

drop policy if exists "org_select_proposal_items" on public.proposal_items;
drop policy if exists "org_insert_proposal_items" on public.proposal_items;
drop policy if exists "org_update_proposal_items" on public.proposal_items;
drop policy if exists "org_delete_proposal_items" on public.proposal_items;

create policy "org_select_proposal_items"
on public.proposal_items for select
using (
  public.can_access_org(organization_id)
  or organization_id = public.get_active_organization_id()
);

create policy "org_insert_proposal_items"
on public.proposal_items for insert
with check (
  public.can_access_org(organization_id)
  or organization_id = public.get_active_organization_id()
);

create policy "org_update_proposal_items"
on public.proposal_items for update
using (
  public.can_access_org(organization_id)
  or organization_id = public.get_active_organization_id()
);

create policy "org_delete_proposal_items"
on public.proposal_items for delete
using (
  public.can_access_org(organization_id)
  or organization_id = public.get_active_organization_id()
);
