import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/lib/supabase";
import { useOrganization } from '@/contexts/OrganizationContext';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export interface ProjectWithRelations extends Project {
  clients: { name: string } | null;
  enterprises: { name: string } | null;
}

export function useProjects() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['projects', activeOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(name), enterprises(name)')
        .eq('organization_id', activeOrganization!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectWithRelations[];
    },
    enabled: !!activeOrganization,
  });
}

export function useActiveProjects() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['projects', 'active', activeOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(name), enterprises(name)')
        .eq('organization_id', activeOrganization!.id)
        .eq('status', 'em_andamento')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectWithRelations[];
    },
    enabled: !!activeOrganization,
  });
}

export function useProject(id: string | undefined) {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(name), enterprises(name)')
        .eq('id', id!)
        .eq('organization_id', activeOrganization!.id)
        .single();

      if (error) throw error;
      return data as ProjectWithRelations;
    },
    enabled: !!id && !!activeOrganization,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Omit<ProjectInsert, 'user_id' | 'organization_id'>) => {
      const { data: result, error } = await supabase
        .from('projects')
        .insert({ ...data, organization_id: activeOrganization!.id })
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

