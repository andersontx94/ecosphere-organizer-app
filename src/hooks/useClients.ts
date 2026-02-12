import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";

export type Client = {
  id: string;
  name: string;
  type: string | null;
  trade_name: string | null;
  cpf_cnpj: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  notes: string | null;
  active: boolean | null;
  created_at: string;
};

export function useClients() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ["clients", activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) return [];
      const { data, error } = await supabase
        .from("clients")
        .select(
          "id, name, type, trade_name, cpf_cnpj, phone, city, state, address, notes, active, created_at"
        )
        .eq("organization_id", activeOrganization.id)
        .order("name", { ascending: true });

      if (error) {
        console.error("Failed to load clients", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      return (data as Client[]) ?? [];
    },
    enabled: !!activeOrganization,
  });
}
