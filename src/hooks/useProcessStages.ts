import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";

export interface ProcessStage {
  id: string;
  process_id: string;
  name: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  responsible: string | null;
  notes: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export function useProcessStages(processId: string | undefined) {
  const { activeOrganization } = useOrganization();
  return useQuery({
    queryKey: ['process_stages', activeOrganization?.id, processId],
    queryFn: async () => {
      if (!processId || !activeOrganization) return [];
      const { data, error } = await supabase
        .from('process_stages')
        .select('*')
        .eq('process_id', processId)
        .eq('organization_id', activeOrganization.id)
        .order('order_index');
      
      if (error) throw error;
      return data as ProcessStage[];
    },
    enabled: !!processId && !!activeOrganization,
  });
}

export function useCreateProcessStage() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Omit<ProcessStage, 'id' | 'created_at' | 'updated_at'>) => {
      if (!activeOrganization) throw new Error('Organization not selected');
      const { data: stage, error } = await supabase
        .from('process_stages')
        .insert({ ...data, organization_id: activeOrganization.id })
        .select()
        .single();
      
      if (error) throw error;
      return stage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['process_stages', variables.process_id] });
    },
  });
}

export function useUpdateProcessStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProcessStage> }) => {
      const { data: stage, error } = await supabase
        .from('process_stages')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return stage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process_stages'] });
    },
  });
}

export function useDeleteProcessStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('process_stages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process_stages'] });
    },
  });
}

// Etapas padrão para licenciamento
export const DEFAULT_LICENSING_STAGES = [
  { name: 'Análise Inicial', order_index: 0 },
  { name: 'Protocolo', order_index: 1 },
  { name: 'Exigências', order_index: 2 },
  { name: 'Complementações', order_index: 3 },
  { name: 'Aprovação', order_index: 4 },
  { name: 'Emissão da Licença', order_index: 5 },
];


