import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";

export interface ProcessType {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  code: string | null;
  default_deadline_days: number | null;
  requires_agency: boolean | null;
  requires_protocol_number: boolean | null;
  active: boolean | null;
  is_licensing: boolean | null;
  is_default: boolean | null;
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

export function useProcessTypes(options?: { includeInactive?: boolean }) {
  const { activeOrganization } = useOrganization();
  const includeInactive = options?.includeInactive ?? false;
  return useQuery({
    queryKey: ['process_types', activeOrganization?.id, includeInactive],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('process_types')
        .select('*')
        .eq('organization_id', activeOrganization?.id ?? '')
        .order('category', { ascending: true })
        .order('name');

      if (error) throw error;
      if (!includeInactive) {
        const filtered = (data as ProcessType[] | null)?.filter(
          (item) => item.active !== false
        );
        return (filtered ?? []) as ProcessType[];
      }

      return data as ProcessType[];
    },
    enabled: !!activeOrganization,
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


