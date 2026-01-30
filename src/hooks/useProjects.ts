import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export interface ProjectWithRelations extends Project {
  clients: { name: string } | null;
  enterprises: { name: string } | null;
}

export function useProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(name), enterprises(name)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectWithRelations[];
    },
    enabled: !!user,
  });
}

export function useActiveProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', 'active', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(name), enterprises(name)')
        .eq('user_id', user!.id)
        .eq('status', 'em_andamento')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectWithRelations[];
    },
    enabled: !!user,
  });
}

export function useProject(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(name), enterprises(name)')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      return data as ProjectWithRelations;
    },
    enabled: !!id && !!user,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ProjectInsert, 'user_id'>) => {
      const { data: result, error } = await supabase
        .from('projects')
        .insert({ ...data, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectUpdate }) => {
      const { data: result, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
