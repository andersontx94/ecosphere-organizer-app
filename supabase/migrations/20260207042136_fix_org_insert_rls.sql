-- Fix organizations insert RLS and ensure owner_id/created_by are set

create or replace function public.set_org_owner()
returns trigger as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists set_org_owner on public.organizations;
create trigger set_org_owner
before insert on public.organizations
for each row execute function public.set_org_owner();

alter table public.organizations enable row level security;

-- Replace policies with explicit insert check
DROP POLICY IF EXISTS "Organizations are viewable by members" ON public.organizations;
DROP POLICY IF EXISTS "Organizations can be created by authenticated users" ON public.organizations;
DROP POLICY IF EXISTS "Organizations can be updated by owners" ON public.organizations;
DROP POLICY IF EXISTS "Organizations can be deleted by owners" ON public.organizations;
DROP POLICY IF EXISTS "org_select" ON public.organizations;

CREATE POLICY "Organizations are viewable by members"
  ON public.organizations
  FOR SELECT
  USING (public.is_org_member(id));

CREATE POLICY "Organizations can be created by authenticated users"
  ON public.organizations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR created_by = auth.uid()));

CREATE POLICY "Organizations can be updated by owners"
  ON public.organizations
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Organizations can be deleted by owners"
  ON public.organizations
  FOR DELETE
  USING (auth.uid() = owner_id);
