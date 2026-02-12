import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";
import type { Database } from "@/integrations/supabase/types";

type Enterprise = Database["public"]["Tables"]["enterprises"]["Row"];
type EnterpriseInsert = Database["public"]["Tables"]["enterprises"]["Insert"];
type EnterpriseUpdate = Database["public"]["Tables"]["enterprises"]["Update"];

export interface EnterpriseWithClient extends Enterprise {
  clients: { name: string } | null;
}

export function useEnterprises() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ["enterprises", activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) return [];
      const { data, error } = await supabase
        .from("enterprises")
        .select("*, clients(name)")
        .eq("organization_id", activeOrganization.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EnterpriseWithClient[];
    },
    enabled: !!activeOrganization,
  });
}

export function useEnterprisesByClient(clientId: string | undefined) {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ["enterprises", "client", clientId],
    queryFn: async () => {
      if (!clientId || !activeOrganization) return [];
      const { data, error } = await supabase
        .from("enterprises")
        .select("*")
        .eq("client_id", clientId)
        .eq("organization_id", activeOrganization.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Enterprise[];
    },
    enabled: !!clientId && !!activeOrganization,
  });
}

export function useEnterprise(id: string | undefined) {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ["enterprises", id],
    queryFn: async () => {
      if (!id || !activeOrganization) return null;
      const { data, error } = await supabase
        .from("enterprises")
        .select("*, clients(name)")
        .eq("id", id)
        .eq("organization_id", activeOrganization.id)
        .single();

      if (error) throw error;
      return data as EnterpriseWithClient;
    },
    enabled: !!id && !!activeOrganization,
  });
}

export function useCreateEnterprise() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Omit<EnterpriseInsert, "user_id" | "owner_id" | "organization_id">) => {
      if (!activeOrganization) throw new Error("Organization not selected");
      const { data: enterprise, error } = await supabase
        .from("enterprises")
        .insert({ ...data, organization_id: activeOrganization.id })
        .select()
        .single();

      if (error) throw error;
      return enterprise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprises"] });
    },
  });
}

export function useUpdateEnterprise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: EnterpriseUpdate;
    }) => {
      const { data: enterprise, error } = await supabase
        .from("enterprises")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return enterprise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprises"] });
    },
  });
}

export function useDeleteEnterprise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("enterprises").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprises"] });
    },
  });
}
