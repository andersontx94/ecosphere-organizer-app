import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EnvironmentalProcess {
  id: string;
  user_id: string;
  enterprise_id: string | null;
  client_id: string | null;
  process_type: string;
  agency: string;
  process_number: string | null;
  status: string;
  protocol_date: string | null;
  decision_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // New fields
  license_type_id: string | null;
  internal_deadline: string | null;
  risk_status: string | null;
  total_value: number | null;
}

export interface EnvironmentalProcessWithRelations extends EnvironmentalProcess {
  clients: { name: string } | null;
  enterprises: { name: string } | null;
}

export interface EnvironmentalProcessInsert {
  enterprise_id?: string | null;
  client_id?: string | null;
  process_type: string;
  agency: string;
  process_number?: string | null;
  status?: string;
  protocol_date?: string | null;
  decision_date?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
  license_type_id?: string | null;
  internal_deadline?: string | null;
  risk_status?: string | null;
  total_value?: number | null;
}

export interface EnvironmentalProcessUpdate {
  enterprise_id?: string | null;
  client_id?: string | null;
  process_type?: string;
  agency?: string;
  process_number?: string | null;
  status?: string;
  protocol_date?: string | null;
  decision_date?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
  license_type_id?: string | null;
  internal_deadline?: string | null;
  risk_status?: string | null;
  total_value?: number | null;
}

export function useEnvironmentalProcesses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['environmental-processes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environmental_processes')
        .select('*, clients(name), enterprises(name)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EnvironmentalProcessWithRelations[];
    },
    enabled: !!user,
  });
}

export function useActiveProcesses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['environmental-processes', 'active', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environmental_processes')
        .select('*, clients(name), enterprises(name)')
        .eq('user_id', user!.id)
        .not('status', 'in', '("deferido","indeferido")')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EnvironmentalProcessWithRelations[];
    },
    enabled: !!user,
  });
}

export function useEnvironmentalProcess(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['environmental-processes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environmental_processes')
        .select('*, clients(name), enterprises(name)')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      return data as EnvironmentalProcessWithRelations;
    },
    enabled: !!id && !!user,
  });
}

export function useCreateEnvironmentalProcess() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: EnvironmentalProcessInsert) => {
      const { data: result, error } = await supabase
        .from('environmental_processes')
        .insert({ ...data, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environmental-processes'] });
    },
  });
}

export function useUpdateEnvironmentalProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EnvironmentalProcessUpdate }) => {
      const { data: result, error } = await supabase
        .from('environmental_processes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environmental-processes'] });
    },
  });
}

export function useDeleteEnvironmentalProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('environmental_processes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environmental-processes'] });
    },
  });
}

export function getProcessStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'em_elaboracao': 'Em Elaboração',
    'protocolado': 'Protocolado',
    'em_analise': 'Em Análise',
    'deferido': 'Deferido',
    'indeferido': 'Indeferido',
  };
  return labels[status] || status;
}

export function getProcessStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'em_elaboracao': 'bg-muted text-muted-foreground',
    'protocolado': 'bg-primary/20 text-primary',
    'em_analise': 'bg-warning/20 text-warning',
    'deferido': 'bg-success/20 text-success',
    'indeferido': 'bg-destructive/20 text-destructive',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}
