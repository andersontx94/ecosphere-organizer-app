import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type ProcessStatus =
  | "em_andamento"
  | "concluido"
  | "atrasado"
  | "vence_em_breve";

export type Process = {
  id: string;
  process_number: string | null;
  status: "em_andamento" | "concluido";
  due_date: string | null;
  created_at: string;
};

function daysDiff(from: Date, to: Date) {
  const diff = to.getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function useProcesses() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProcesses = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("processes")
      .select("id, process_number, status, due_date, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProcesses(data as Process[]);
    } else {
      console.error("Erro ao buscar processos:", error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  async function getProcessById(id: string): Promise<Process | null> {
    const { data, error } = await supabase
      .from("processes")
      .select("id, process_number, status, due_date, created_at")
      .eq("id", id)
      .single();

    if (error) return null;
    return data as Process;
  }

  async function createProcess(input: {
    process_number: string | null;
    due_date: string | null;
  }) {
    const { error } = await supabase.from("processes").insert({
      process_number: input.process_number,
      due_date: input.due_date,
      status: "em_andamento",
    });

    if (error) throw error;

    // 🔄 atualiza lista automaticamente
    await fetchProcesses();
  }

  function getComputedStatus(process: Process): {
    visualStatus: ProcessStatus;
    label: string;
  } {
    if (process.status === "concluido") {
      return { visualStatus: "concluido", label: "Concluído" };
    }

    if (!process.due_date) {
      return { visualStatus: "em_andamento", label: "Em andamento" };
    }

    const today = new Date();
    const due = new Date(process.due_date + "T00:00:00");
    const diff = daysDiff(today, due);

    if (diff < 0) {
      return { visualStatus: "atrasado", label: "Atrasado" };
    }

    if (diff <= 7) {
      return {
        visualStatus: "vence_em_breve",
        label: `Vence em ${diff} dia${diff === 1 ? "" : "s"}`,
      };
    }

    return { visualStatus: "em_andamento", label: "Em andamento" };
  }

  return {
    processes,
    loading,
    fetchProcesses,
    getProcessById,
    createProcess,
    getComputedStatus,
  };
}