-- Monetization base schema (plans, subscriptions, usage)

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  price_cents integer not null default 0,
  billing_period text not null default 'monthly',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.usage_limits (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  key text not null,
  limit_value integer not null default 0,
  created_at timestamptz default now(),
  unique (plan_id, key)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'trialing',
  started_at timestamptz default now(),
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  key text not null,
  quantity integer not null default 1,
  occurred_at timestamptz default now()
);

alter table public.plans enable row level security;
alter table public.usage_limits enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;

create policy "plans_read_all" on public.plans
for select using (true);

create policy "limits_read_all" on public.usage_limits
for select using (true);

create policy "subscriptions_org_access" on public.subscriptions
for all using (public.can_access_org(organization_id))
with check (public.can_access_org(organization_id));

create policy "usage_events_org_access" on public.usage_events
for all using (public.can_access_org(organization_id))
with check (public.can_access_org(organization_id));

create index if not exists idx_subscriptions_org on public.subscriptions(organization_id);
create index if not exists idx_usage_events_org on public.usage_events(organization_id);
