import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProcessType {
  id: string;
  name: string;
  description: string | null;
  is_licensing: boolean;
  is_default: boolean;
  user_id: string | null;
  created_at: string;
}

export interface LicenseType {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
}

export function useProcessTypes() {
  return useQuery({
    queryKey: ['process_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('process_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as ProcessType[];
    },
  });
}

export function useLicenseTypes() {
  return useQuery({
    queryKey: ['license_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('license_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as LicenseType[];
    },
  });
}
