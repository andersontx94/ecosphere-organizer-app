import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/lib/supabase";
import { useOrganization } from '@/contexts/OrganizationContext';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export interface TaskWithRelations extends Task {
  clients: { name: string } | null;
  enterprises: { name: string } | null;
}

export function useTasks() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['tasks', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*, clients(name), enterprises(name)')
        .eq('organization_id', activeOrganization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TaskWithRelations[];
    },
    enabled: !!activeOrganization,
  });
}

export function usePendingTasks() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['tasks', 'pending', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*, clients(name), enterprises(name)')
        .eq('organization_id', activeOrganization.id)
        .neq('status', 'concluido')
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as TaskWithRelations[];
    },
    enabled: !!activeOrganization,
  });
}

export function useTask(id: string | undefined) {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      if (!id || !activeOrganization) return null;
      const { data, error } = await supabase
        .from('tasks')
        .select('*, clients(name), enterprises(name)')
        .eq('id', id)
        .eq('organization_id', activeOrganization.id)
        .single();
      
      if (error) throw error;
      return data as TaskWithRelations;
    },
    enabled: !!id && !!activeOrganization,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Omit<TaskInsert, 'user_id' | 'organization_id'>) => {
      if (!activeOrganization) throw new Error('Organization not selected');
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({ ...data, organization_id: activeOrganization.id })
        .select()
        .single();
      
      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskUpdate }) => {
      const { data: task, error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

