-- Relax organizations insert policy to avoid RLS block; trigger will set owner_id/created_by

alter table public.organizations enable row level security;

DROP POLICY IF EXISTS "Organizations can be created by authenticated users" ON public.organizations;

CREATE POLICY "Organizations can be created by authenticated users"
  ON public.organizations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
