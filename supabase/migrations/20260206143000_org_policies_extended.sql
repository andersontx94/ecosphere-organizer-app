-- Extended org RLS policies for remaining tables (safe if tables missing)

do $do$
begin
  if to_regclass('public.client_contacts') is not null then
    execute 'drop policy if exists "org_select_client_contacts" on public.client_contacts';
    execute 'drop policy if exists "org_insert_client_contacts" on public.client_contacts';
    execute 'drop policy if exists "org_update_client_contacts" on public.client_contacts';
    execute 'drop policy if exists "org_delete_client_contacts" on public.client_contacts';
    execute 'create policy "org_select_client_contacts" on public.client_contacts for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_client_contacts" on public.client_contacts for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_client_contacts" on public.client_contacts for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_client_contacts" on public.client_contacts for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.process_services') is not null then
    execute 'drop policy if exists "org_select_process_services" on public.process_services';
    execute 'drop policy if exists "org_insert_process_services" on public.process_services';
    execute 'drop policy if exists "org_update_process_services" on public.process_services';
    execute 'drop policy if exists "org_delete_process_services" on public.process_services';
    execute 'create policy "org_select_process_services" on public.process_services for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_process_services" on public.process_services for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_process_services" on public.process_services for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_process_services" on public.process_services for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.invoice_items') is not null then
    execute 'drop policy if exists "org_select_invoice_items" on public.invoice_items';
    execute 'drop policy if exists "org_insert_invoice_items" on public.invoice_items';
    execute 'drop policy if exists "org_update_invoice_items" on public.invoice_items';
    execute 'drop policy if exists "org_delete_invoice_items" on public.invoice_items';
    execute 'create policy "org_select_invoice_items" on public.invoice_items for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_invoice_items" on public.invoice_items for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_invoice_items" on public.invoice_items for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_invoice_items" on public.invoice_items for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.payments') is not null then
    execute 'drop policy if exists "org_select_payments" on public.payments';
    execute 'drop policy if exists "org_insert_payments" on public.payments';
    execute 'drop policy if exists "org_update_payments" on public.payments';
    execute 'drop policy if exists "org_delete_payments" on public.payments';
    execute 'create policy "org_select_payments" on public.payments for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_payments" on public.payments for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_payments" on public.payments for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_payments" on public.payments for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.accounts_receivable') is not null then
    execute 'drop policy if exists "org_select_receivables" on public.accounts_receivable';
    execute 'drop policy if exists "org_insert_receivables" on public.accounts_receivable';
    execute 'drop policy if exists "org_update_receivables" on public.accounts_receivable';
    execute 'drop policy if exists "org_delete_receivables" on public.accounts_receivable';
    execute 'create policy "org_select_receivables" on public.accounts_receivable for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_receivables" on public.accounts_receivable for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_receivables" on public.accounts_receivable for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_receivables" on public.accounts_receivable for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.accounts_payable') is not null then
    execute 'drop policy if exists "org_select_payables" on public.accounts_payable';
    execute 'drop policy if exists "org_insert_payables" on public.accounts_payable';
    execute 'drop policy if exists "org_update_payables" on public.accounts_payable';
    execute 'drop policy if exists "org_delete_payables" on public.accounts_payable';
    execute 'create policy "org_select_payables" on public.accounts_payable for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_payables" on public.accounts_payable for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_payables" on public.accounts_payable for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_payables" on public.accounts_payable for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.financial_accounts') is not null then
    execute 'drop policy if exists "org_select_financial_accounts" on public.financial_accounts';
    execute 'drop policy if exists "org_insert_financial_accounts" on public.financial_accounts';
    execute 'drop policy if exists "org_update_financial_accounts" on public.financial_accounts';
    execute 'drop policy if exists "org_delete_financial_accounts" on public.financial_accounts';
    execute 'create policy "org_select_financial_accounts" on public.financial_accounts for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_financial_accounts" on public.financial_accounts for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_financial_accounts" on public.financial_accounts for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_financial_accounts" on public.financial_accounts for delete using (public.can_access_org(organization_id))';
  end if;

  if to_regclass('public.financial_transactions') is not null then
    execute 'drop policy if exists "org_select_financial_transactions" on public.financial_transactions';
    execute 'drop policy if exists "org_insert_financial_transactions" on public.financial_transactions';
    execute 'drop policy if exists "org_update_financial_transactions" on public.financial_transactions';
    execute 'drop policy if exists "org_delete_financial_transactions" on public.financial_transactions';
    execute 'create policy "org_select_financial_transactions" on public.financial_transactions for select using (public.can_access_org(organization_id))';
    execute 'create policy "org_insert_financial_transactions" on public.financial_transactions for insert with check (public.can_access_org(organization_id))';
    execute 'create policy "org_update_financial_transactions" on public.financial_transactions for update using (public.can_access_org(organization_id))';
    execute 'create policy "org_delete_financial_transactions" on public.financial_transactions for delete using (public.can_access_org(organization_id))';
  end if;
end $do$;
