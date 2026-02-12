-- Legacy consolidation: map old tables into canonical entities (safe if tables missing)

do $do$
begin
  if to_regclass('public.environmental_services') is not null then
    execute $sql$
      insert into public.services (organization_id, user_id, name, category, description, default_price, unit, active, created_at)
      select
        coalesce(es.organization_id, o.id) as organization_id,
        es.user_id,
        es.name,
        'Outros',
        es.description,
        0,
        'serviço',
        true,
        es.created_at
      from public.environmental_services es
      left join public.organizations o on o.created_by = es.user_id
      where not exists (
        select 1 from public.services s
        where s.organization_id = coalesce(es.organization_id, o.id)
          and s.name = es.name
      );
    $sql$;
  end if;

  if to_regclass('public.projects') is not null then
    execute $sql$
      insert into public.environmental_processes (
        organization_id,
        user_id,
        owner_id,
        enterprise_id,
        client_id,
        process_type,
        agency,
        process_number,
        status,
        protocol_date,
        due_date,
        description,
        created_at,
        updated_at
      )
      select
        coalesce(p.organization_id, o.id) as organization_id,
        p.user_id,
        p.user_id as owner_id,
        p.enterprise_id,
        p.client_id,
        coalesce(p.name, 'Processo') as process_type,
        null,
        null,
        coalesce(p.status, 'Em andamento') as status,
        p.start_date,
        p.end_date,
        p.description,
        p.created_at,
        p.updated_at
      from public.projects p
      left join public.organizations o on o.created_by = p.user_id
      where not exists (
        select 1 from public.environmental_processes ep
        where ep.organization_id = coalesce(p.organization_id, o.id)
          and ep.client_id is not distinct from p.client_id
          and ep.enterprise_id is not distinct from p.enterprise_id
          and ep.created_at = p.created_at
      );
    $sql$;
  end if;

  if to_regclass('public.accounts_receivable') is not null then
    execute $sql$
      with inserted as (
        insert into public.invoices (
          organization_id,
          client_id,
          enterprise_id,
          process_id,
          number,
          status,
          issue_date,
          due_date,
          notes,
          total,
          created_at
        )
        select
          coalesce(ar.organization_id, o.id) as organization_id,
          ar.client_id,
          null,
          null,
          null,
          case when ar.status = 'recebido' then 'Pago' else 'Em aberto' end,
          (ar.created_at::date),
          ar.due_date,
          ar.notes,
          ar.amount,
          ar.created_at
        from public.accounts_receivable ar
        left join public.organizations o on o.created_by = ar.user_id
        where not exists (
          select 1 from public.invoices i
          where i.organization_id = coalesce(ar.organization_id, o.id)
            and i.client_id is not distinct from ar.client_id
            and i.due_date is not distinct from ar.due_date
            and i.total = ar.amount
        )
        returning id, organization_id, total
      )
      insert into public.invoice_items (
        organization_id,
        invoice_id,
        description,
        qty,
        unit_price,
        total,
        created_at
      )
      select
        ins.organization_id,
        ins.id,
        'Recebível legado',
        1,
        ins.total,
        ins.total,
        now()
      from inserted ins;
    $sql$;
  end if;
end $do$;
