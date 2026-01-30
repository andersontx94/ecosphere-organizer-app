import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

export interface DocumentWithRelations extends Document {
  clients: { name: string } | null;
  enterprises: { name: string } | null;
}

export function useDocuments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('documents')
        .select('*, clients(name), enterprises(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DocumentWithRelations[];
    },
    enabled: !!user,
  });
}

export function useUpcomingDeadlines(days: number = 30) {
  const { user } = useAuth();
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return useQuery({
    queryKey: ['documents', 'deadlines', user?.id, days],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('documents')
        .select('*, clients(name), enterprises(name)')
        .eq('user_id', user.id)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .order('expiry_date', { ascending: true });
      
      if (error) throw error;
      return data as DocumentWithRelations[];
    },
    enabled: !!user,
  });
}

export function useDocument(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from('documents')
        .select('*, clients(name), enterprises(name)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as DocumentWithRelations;
    },
    enabled: !!id && !!user,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<DocumentInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data: document, error } = await supabase
        .from('documents')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DocumentUpdate }) => {
      const { data: document, error } = await supabase
        .from('documents')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function getDocumentStatus(expiryDate: string | null): 'valido' | 'proximo_vencimento' | 'vencido' {
  if (!expiryDate) return 'valido';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'vencido';
  if (diffDays <= 30) return 'proximo_vencimento';
  return 'valido';
}
