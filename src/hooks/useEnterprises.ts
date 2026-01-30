import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Enterprise = Database['public']['Tables']['enterprises']['Row'];
type EnterpriseInsert = Database['public']['Tables']['enterprises']['Insert'];
type EnterpriseUpdate = Database['public']['Tables']['enterprises']['Update'];

export interface EnterpriseWithClient extends Enterprise {
  clients: { name: string } | null;
}

export function useEnterprises() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enterprises', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('enterprises')
        .select('*, clients(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EnterpriseWithClient[];
    },
    enabled: !!user,
  });
}

export function useEnterprisesByClient(clientId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enterprises', 'client', clientId],
    queryFn: async () => {
      if (!clientId || !user) return [];
      const { data, error } = await supabase
        .from('enterprises')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Enterprise[];
    },
    enabled: !!clientId && !!user,
  });
}

export function useEnterprise(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enterprises', id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from('enterprises')
        .select('*, clients(name)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as EnterpriseWithClient;
    },
    enabled: !!id && !!user,
  });
}

export function useCreateEnterprise() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<EnterpriseInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data: enterprise, error } = await supabase
        .from('enterprises')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return enterprise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprises'] });
    },
  });
}

export function useUpdateEnterprise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EnterpriseUpdate }) => {
      const { data: enterprise, error } = await supabase
        .from('enterprises')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return enterprise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprises'] });
    },
  });
}

export function useDeleteEnterprise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enterprises')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprises'] });
    },
  });
}
