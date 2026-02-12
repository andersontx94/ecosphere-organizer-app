import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";

export interface EnvironmentalProcess {
  id: string;
  user_id: string;
  owner_id: string;
  organization_id?: string | null;
  enterprise_id: string | null;
  client_id: string | null;
  service_id: string | null;
  process_type: string;
  agency: string;
  process_number: string | null;
  protocol_number: string | null;
  status: string;
  protocol_date: string | null;
  decision_date: string | null;
  expiry_date: string | null;
  due_date: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  license_type_id: string | null;
  internal_deadline: string | null;
  risk_status: string | null;
  total_value: number | null;
}

export interface EnvironmentalProcessWithRelations extends EnvironmentalProcess {
  clients: { name: string } | null;
  enterprises: { name: string } | null;
  services: { name: string } | null;
}

export interface EnvironmentalProcessInsert {
  enterprise_id?: string | null;
  client_id?: string | null;
  service_id?: string | null;
  process_type: string;
  agency: string;
  process_number?: string | null;
  protocol_number?: string | null;
  status?: string;
  protocol_date?: string | null;
  decision_date?: string | null;
  expiry_date?: string | null;
  due_date?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  license_type_id?: string | null;
  internal_deadline?: string | null;
  risk_status?: string | null;
  total_value?: number | null;
}

export interface EnvironmentalProcessUpdate {
  enterprise_id?: string | null;
  client_id?: string | null;
  service_id?: string | null;
  process_type?: string;
  agency?: string;
  process_number?: string | null;
  protocol_number?: string | null;
  status?: string;
  protocol_date?: string | null;
  decision_date?: string | null;
  expiry_date?: string | null;
  due_date?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  license_type_id?: string | null;
  internal_deadline?: string | null;
  risk_status?: string | null;
  total_value?: number | null;
}

export function useEnvironmentalProcesses() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ["environmental-processes", activeOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("environmental_processes")
        .select("*, clients(name), enterprises(name), services(name)")
        .eq("organization_id", activeOrganization!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EnvironmentalProcessWithRelations[];
    },
    enabled: !!activeOrganization,
  });
}

export function useActiveProcesses() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ["environmental-processes", "active", activeOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("environmental_processes")
        .select("*, clients(name), enterprises(name), services(name)")
        .eq("organization_id", activeOrganization!.id)
        .not("status", "in", '("deferido","indeferido","concluido","cancelado")')
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EnvironmentalProcessWithRelations[];
    },
    enabled: !!activeOrganization,
  });
}

export function useEnvironmentalProcess(id: string | undefined) {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ["environmental-processes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("environmental_processes")
        .select("*, clients(name), enterprises(name), services(name)")
        .eq("id", id!)
        .eq("organization_id", activeOrganization!.id)
        .single();

      if (error) throw error;
      return data as EnvironmentalProcessWithRelations;
    },
    enabled: !!id && !!activeOrganization,
  });
}

export function useCreateEnvironmentalProcess() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: EnvironmentalProcessInsert) => {
      if (!activeOrganization) {
        throw new Error("Organization not selected");
      }
      const { data: result, error } = await supabase
        .from("environmental_processes")
        .insert({ ...data, organization_id: activeOrganization.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environmental-processes"] });
    },
  });
}

export function useUpdateEnvironmentalProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: EnvironmentalProcessUpdate;
    }) => {
      const { data: result, error } = await supabase
        .from("environmental_processes")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environmental-processes"] });
    },
  });
}

export function useDeleteEnvironmentalProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("environmental_processes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environmental-processes"] });
    },
  });
}

export function getProcessStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    em_elaboracao: "Em Elaboração",
    protocolado: "Protocolado",
    em_analise: "Em Análise",
    deferido: "Deferido",
    indeferido: "Indeferido",
  };
  return labels[status] || status;
}

export function getProcessStatusColor(status: string): string {
  const colors: Record<string, string> = {
    em_elaboracao: "bg-muted text-muted-foreground",
    protocolado: "bg-primary/20 text-primary",
    em_analise: "bg-warning/20 text-warning",
    deferido: "bg-success/20 text-success",
    indeferido: "bg-destructive/20 text-destructive",
  };
  return colors[status] || "bg-muted text-muted-foreground";
}

