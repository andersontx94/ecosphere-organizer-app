-- Add user_id to clients if missing (aligns with app queries)

alter table public.clients
add column if not exists user_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clients_user_id_fkey'
      and conrelid = 'public.clients'::regclass
  ) then
    alter table public.clients
      add constraint clients_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;
