import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/lib/supabase";
import { useOrganization } from '@/contexts/OrganizationContext';
import type { Database } from '@/integrations/supabase/types';

type AccountReceivable = Database['public']['Tables']['accounts_receivable']['Row'];
type AccountReceivableInsert = Database['public']['Tables']['accounts_receivable']['Insert'];
type AccountReceivableUpdate = Database['public']['Tables']['accounts_receivable']['Update'];

type AccountPayable = Database['public']['Tables']['accounts_payable']['Row'];
type AccountPayableInsert = Database['public']['Tables']['accounts_payable']['Insert'];
type AccountPayableUpdate = Database['public']['Tables']['accounts_payable']['Update'];

type FinancialAccount = Database['public']['Tables']['financial_accounts']['Row'];
type FinancialAccountInsert = Database['public']['Tables']['financial_accounts']['Insert'];

export interface AccountReceivableWithRelations extends AccountReceivable {
  clients: { name: string } | null;
  projects: { name: string } | null;
}

export interface AccountPayableWithRelations extends AccountPayable {
  clients: { name: string } | null;
  projects: { name: string } | null;
}

// ==================== ACCOUNTS RECEIVABLE ====================

export function useAccountsReceivable() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['accounts-receivable', activeOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*, clients(name), projects(name)')
        .eq('organization_id', activeOrganization!.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as AccountReceivableWithRelations[];
    },
    enabled: !!activeOrganization,
  });
}

export function usePendingReceivables() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['accounts-receivable', 'pending', activeOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*, clients(name), projects(name)')
        .eq('organization_id', activeOrganization!.id)
        .eq('status', 'em_aberto')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as AccountReceivableWithRelations[];
    },
    enabled: !!activeOrganization,
  });
}

export function useCreateAccountReceivable() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Omit<AccountReceivableInsert, 'user_id' | 'organization_id'>) => {
      const { data: result, error } = await supabase
        .from('accounts_receivable')
        .insert({ ...data, organization_id: activeOrganization!.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateAccountReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AccountReceivableUpdate }) => {
      const { data: result, error } = await supabase
        .from('accounts_receivable')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteAccountReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('accounts_receivable').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// ==================== ACCOUNTS PAYABLE ====================

export function useAccountsPayable() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['accounts-payable', activeOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*, clients(name), projects(name)')
        .eq('organization_id', activeOrganization!.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as AccountPayableWithRelations[];
    },
    enabled: !!activeOrganization,
  });
}

export function usePendingPayables() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['accounts-payable', 'pending', activeOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*, clients(name), projects(name)')
        .eq('organization_id', activeOrganization!.id)
        .eq('status', 'em_aberto')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as AccountPayableWithRelations[];
    },
    enabled: !!activeOrganization,
  });
}

export function useCreateAccountPayable() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Omit<AccountPayableInsert, 'user_id' | 'organization_id'>) => {
      const { data: result, error } = await supabase
        .from('accounts_payable')
        .insert({ ...data, organization_id: activeOrganization!.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateAccountPayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AccountPayableUpdate }) => {
      const { data: result, error } = await supabase
        .from('accounts_payable')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteAccountPayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('accounts_payable').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// ==================== FINANCIAL ACCOUNTS ====================

export function useFinancialAccounts() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['financial-accounts', activeOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('organization_id', activeOrganization!.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as FinancialAccount[];
    },
    enabled: !!activeOrganization,
  });
}

export function useCreateFinancialAccount() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Omit<FinancialAccountInsert, 'user_id' | 'organization_id'>) => {
      const { data: result, error } = await supabase
        .from('financial_accounts')
        .insert({ ...data, organization_id: activeOrganization!.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });
}

// ==================== FINANCIAL SUMMARY ====================

export interface FinancialSummary {
  totalReceived: number;
  totalPaid: number;
  pendingReceivables: number;
  pendingPayables: number;
  cashBalance: number;
  monthlyResult: number;
}

export function useFinancialSummary(startDate?: string, endDate?: string) {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['financial-summary', user?.id, startDate, endDate],
    queryFn: async (): Promise<FinancialSummary> => {
      if (!activeOrganization) {
        return {
          totalReceived: 0,
          totalPaid: 0,
          pendingReceivables: 0,
          pendingPayables: 0,
          cashBalance: 0,
          monthlyResult: 0,
        };
      }

      const now = new Date();
      const firstDayOfMonth = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDayOfMonth = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const [receivedResult, paidResult, pendingRecResult, pendingPayResult] = await Promise.all([
        // Total received this month
        supabase
          .from('accounts_receivable')
          .select('amount')
          .eq('organization_id', activeOrganization.id)
          .eq('status', 'recebido')
          .gte('received_at', firstDayOfMonth)
          .lte('received_at', lastDayOfMonth),
        // Total paid this month
        supabase
          .from('accounts_payable')
          .select('amount')
          .eq('organization_id', activeOrganization.id)
          .eq('status', 'pago')
          .gte('paid_at', firstDayOfMonth)
          .lte('paid_at', lastDayOfMonth),
        // Pending receivables
        supabase
          .from('accounts_receivable')
          .select('amount')
          .eq('organization_id', activeOrganization.id)
          .eq('status', 'em_aberto'),
        // Pending payables
        supabase
          .from('accounts_payable')
          .select('amount')
          .eq('organization_id', activeOrganization.id)
          .eq('status', 'em_aberto'),
      ]);

      const totalReceived = receivedResult.data?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const totalPaid = paidResult.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const pendingReceivables = pendingRecResult.data?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const pendingPayables = pendingPayResult.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // For cash balance, we need all-time received minus all-time paid
      const [allReceivedResult, allPaidResult] = await Promise.all([
        supabase
          .from('accounts_receivable')
          .select('amount')
          .eq('organization_id', activeOrganization.id)
          .eq('status', 'recebido'),
        supabase
          .from('accounts_payable')
          .select('amount')
          .eq('organization_id', activeOrganization.id)
          .eq('status', 'pago'),
      ]);

      const allReceived = allReceivedResult.data?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const allPaid = allPaidResult.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        totalReceived,
        totalPaid,
        pendingReceivables,
        pendingPayables,
        cashBalance: allReceived - allPaid,
        monthlyResult: totalReceived - totalPaid,
      };
    },
    enabled: !!activeOrganization,
  });
}

export const EXPENSE_CATEGORIES = [
  { value: 'fixa', label: 'Despesa Fixa' },
  { value: 'variavel', label: 'Despesa Variável' },
  { value: 'equipamento', label: 'Equipamento' },
  { value: 'deslocamento', label: 'Deslocamento' },
  { value: 'material', label: 'Material' },
  { value: 'imposto', label: 'Imposto' },
  { value: 'outros', label: 'Outros' },
];

