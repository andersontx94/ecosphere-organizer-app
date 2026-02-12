-- Ensure user_id exists on core tables and references auth.users

alter table public.processes
add column if not exists user_id uuid;

alter table public.enterprises
add column if not exists user_id uuid;

alter table public.services
add column if not exists user_id uuid;

alter table public.financial_entries
add column if not exists user_id uuid;

alter table public.process_tasks
add column if not exists user_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'processes_user_id_fkey'
      and conrelid = 'public.processes'::regclass
  ) then
    alter table public.processes
      add constraint processes_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'enterprises_user_id_fkey'
      and conrelid = 'public.enterprises'::regclass
  ) then
    alter table public.enterprises
      add constraint enterprises_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'services_user_id_fkey'
      and conrelid = 'public.services'::regclass
  ) then
    alter table public.services
      add constraint services_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'financial_entries_user_id_fkey'
      and conrelid = 'public.financial_entries'::regclass
  ) then
    alter table public.financial_entries
      add constraint financial_entries_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'process_tasks_user_id_fkey'
      and conrelid = 'public.process_tasks'::regclass
  ) then
    alter table public.process_tasks
      add constraint process_tasks_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;
