import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/lib/supabase";
import { useOrganization } from '@/contexts/OrganizationContext';

export interface ProcessRevenue {
  id: string;
  process_id: string;
  user_id: string;
  description: string;
  amount: number;
  payment_method: string | null;
  status: string;
  due_date: string | null;
  received_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProcessCost {
  id: string;
  process_id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string | null;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProcessFinancialSummary {
  totalRevenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  totalCosts: number;
  paidCosts: number;
  pendingCosts: number;
  profit: number;
  profitMargin: number;
}

export function useProcessRevenues(processId: string | undefined) {
  const { activeOrganization } = useOrganization();
  return useQuery({
    queryKey: ['process_revenues', activeOrganization?.id, processId],
    queryFn: async () => {
      if (!processId || !activeOrganization) return [];
      const { data, error } = await supabase
        .from('process_revenues')
        .select('*')
        .eq('process_id', processId)
        .eq('organization_id', activeOrganization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProcessRevenue[];
    },
    enabled: !!processId && !!activeOrganization,
  });
}

export function useProcessCosts(processId: string | undefined) {
  const { activeOrganization } = useOrganization();
  return useQuery({
    queryKey: ['process_costs', activeOrganization?.id, processId],
    queryFn: async () => {
      if (!processId || !activeOrganization) return [];
      const { data, error } = await supabase
        .from('process_costs')
        .select('*')
        .eq('process_id', processId)
        .eq('organization_id', activeOrganization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProcessCost[];
    },
    enabled: !!processId && !!activeOrganization,
  });
}

export function useProcessFinancialSummary(processId: string | undefined) {
  const { data: revenues } = useProcessRevenues(processId);
  const { data: costs } = useProcessCosts(processId);

  const summary: ProcessFinancialSummary = {
    totalRevenue: revenues?.reduce((sum, r) => sum + Number(r.amount), 0) || 0,
    receivedRevenue: revenues?.filter(r => r.status === 'recebido').reduce((sum, r) => sum + Number(r.amount), 0) || 0,
    pendingRevenue: revenues?.filter(r => r.status !== 'recebido').reduce((sum, r) => sum + Number(r.amount), 0) || 0,
    totalCosts: costs?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
    paidCosts: costs?.filter(c => c.status === 'pago').reduce((sum, c) => sum + Number(c.amount), 0) || 0,
    pendingCosts: costs?.filter(c => c.status !== 'pago').reduce((sum, c) => sum + Number(c.amount), 0) || 0,
    profit: 0,
    profitMargin: 0,
  };

  summary.profit = summary.totalRevenue - summary.totalCosts;
  summary.profitMargin = summary.totalRevenue > 0 ? (summary.profit / summary.totalRevenue) * 100 : 0;

  return summary;
}

export function useCreateProcessRevenue() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Omit<ProcessRevenue, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!activeOrganization) throw new Error('Organization not selected');
      const { data: revenue, error } = await supabase
        .from('process_revenues')
        .insert({ ...data, organization_id: activeOrganization.id } as any)
        .select()
        .single();
      
      if (error) throw error;
      return revenue;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['process_revenues', variables.process_id] });
    },
  });
}

export function useUpdateProcessRevenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProcessRevenue> }) => {
      const { data: revenue, error } = await supabase
        .from('process_revenues')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return revenue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process_revenues'] });
    },
  });
}

export function useDeleteProcessRevenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('process_revenues')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process_revenues'] });
    },
  });
}

export function useCreateProcessCost() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Omit<ProcessCost, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!activeOrganization) throw new Error('Organization not selected');
      const { data: cost, error } = await supabase
        .from('process_costs')
        .insert({ ...data, organization_id: activeOrganization.id } as any)
        .select()
        .single();
      
      if (error) throw error;
      return cost;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['process_costs', variables.process_id] });
    },
  });
}

export function useUpdateProcessCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProcessCost> }) => {
      const { data: cost, error } = await supabase
        .from('process_costs')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return cost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process_costs'] });
    },
  });
}

export function useDeleteProcessCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('process_costs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process_costs'] });
    },
  });
}

// Categorias de custo padrão
export const COST_CATEGORIES = [
  'Taxas Ambientais',
  'Pagamentos a Parceiros',
  'Estudos Técnicos',
  'Deslocamento',
  'Materiais',
  'Outras Despesas',
];

// Status de receita
export const REVENUE_STATUSES = [
  { value: 'orcado', label: 'Orçado' },
  { value: 'contratado', label: 'Contratado' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'recebido', label: 'Recebido' },
];

// Status de custo
export const COST_STATUSES = [
  { value: 'previsto', label: 'Previsto' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
];


