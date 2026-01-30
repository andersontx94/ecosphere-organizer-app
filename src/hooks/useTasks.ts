import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export interface TaskWithRelations extends Task {
  clients: { name: string } | null;
  enterprises: { name: string } | null;
}

export function useTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*, clients(name), enterprises(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TaskWithRelations[];
    },
    enabled: !!user,
  });
}

export function usePendingTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'pending', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*, clients(name), enterprises(name)')
        .eq('user_id', user.id)
        .neq('status', 'concluido')
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as TaskWithRelations[];
    },
    enabled: !!user,
  });
}

export function useTask(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from('tasks')
        .select('*, clients(name), enterprises(name)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as TaskWithRelations;
    },
    enabled: !!id && !!user,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<TaskInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({ ...data, user_id: user.id })
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
