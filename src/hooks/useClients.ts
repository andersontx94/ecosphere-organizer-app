import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Client = {
  id: string;
  name: string;
  cnpj: string | null;
  responsible: string | null;
};

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchClients() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Erro ao buscar clientes:", error);
        setError("Erro ao carregar clientes");
        setClients([]);
        return;
      }

      setClients(data ?? []);
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao carregar clientes");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    reloadClients: fetchClients,
  };
}