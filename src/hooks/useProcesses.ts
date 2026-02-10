import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";

export type ProcessStatus =
  | "em_andamento"
  | "concluido"
  | "atrasado"
  | "vence_em_breve";

export type Process = {
  id: string;
  process_number: string | null;
  process_type: string | null;
  agency: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
  client_id: string | null;
  enterprise_id: string | null;
  service_id: string | null;
  clients?: { name: string | null } | null;
  enterprises?: { name: string | null } | null;
  services?: { name: string | null } | null;
};

function daysDiff(from: Date, to: Date) {
  const diff = to.getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function useProcesses() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);
  const { activeOrganization } = useOrganization();

  const fetchProcesses = useCallback(async () => {
    if (!activeOrganization) {
      setProcesses([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("environmental_processes")
      .select(
        "id, process_number, process_type, agency, status, due_date, created_at, client_id, enterprise_id, service_id, clients(name), enterprises(name)"
      )
      .eq("organization_id", activeOrganization.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped = data.map((item) => ({
        id: item.id,
        process_number: item.process_number,
        process_type: item.process_type ?? null,
        agency: item.agency ?? null,
        status: item.status,
        due_date: item.due_date ?? null,
        created_at: item.created_at,
        client_id: item.client_id ?? null,
        enterprise_id: item.enterprise_id ?? null,
        service_id: item.service_id ?? null,
        clients: item.clients ?? null,
        enterprises: item.enterprises ?? null,
        services: item.services ?? null,
      })) as Process[];
      setProcesses(mapped);
    } else {
      console.error("Erro ao buscar processos:", error);
    }

    setLoading(false);
  }, [activeOrganization]);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  async function getProcessById(id: string): Promise<Process | null> {
    if (!activeOrganization) return null;
    const { data, error } = await supabase
      .from("environmental_processes")
      .select(
        "id, process_number, process_type, agency, status, due_date, created_at, client_id, enterprise_id, service_id, clients(name), enterprises(name)"
      )
      .eq("organization_id", activeOrganization.id)
      .eq("id", id)
      .single();

    if (error) return null;
    return {
      id: data.id,
      process_number: data.process_number,
      process_type: data.process_type ?? null,
      agency: data.agency ?? null,
      status: data.status,
      due_date: data.due_date ?? null,
      created_at: data.created_at,
      client_id: data.client_id ?? null,
      enterprise_id: data.enterprise_id ?? null,
      service_id: data.service_id ?? null,
      clients: data.clients ?? null,
      enterprises: data.enterprises ?? null,
      services: data.services ?? null,
    };
  }

  function getComputedStatus(process: Process): {
    visualStatus: ProcessStatus;
    label: string;
  } {
    return computeProcessStatus(process.status, process.due_date);
  }

  return {
    processes,
    loading,
    fetchProcesses,
    getProcessById,
    getComputedStatus,
  };
}

export function computeProcessStatus(
  status: string,
  dueDate: string | null
): { visualStatus: ProcessStatus; label: string } {
  const normalized = status.toLowerCase();

  if (normalized === "concluído" || normalized === "concluido") {
    return { visualStatus: "concluido", label: "Concluído" };
  }

  if (normalized === "cancelado") {
    return { visualStatus: "concluido", label: "Cancelado" };
  }

  if (!dueDate) {
    return { visualStatus: "em_andamento", label: "Em andamento" };
  }

  const today = new Date();
  const due = new Date(dueDate + "T00:00:00");
  const diff = daysDiff(today, due);

  if (diff < 0) {
    return { visualStatus: "atrasado", label: "Atrasado" };
  }

  if (diff <= 15) {
    return {
      visualStatus: "vence_em_breve",
      label: `Vence em ${diff} dia${diff === 1 ? "" : "s"}`,
    };
  }

  return { visualStatus: "em_andamento", label: "Em andamento" };
}
