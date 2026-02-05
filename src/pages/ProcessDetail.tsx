import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StatusBadge from "../components/ui/StatusBadge";

type ProcessStatus = "em_andamento" | "concluido" | "atrasado";

type Process = {
  id: string;
  process_number: string | null;
  status: ProcessStatus;
  due_date: string | null;
  agency: string | null;
  client_id: string;
  enterprise_id: string;
};

export default function ProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProcess() {
      if (!id) return;

      const { data, error } = await supabase
        .from("processes")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProcess(data as Process);
      }

      setLoading(false);
    }

    loadProcess();
  }, [id]);

  if (loading) {
    return <p className="text-gray-500">Carregando processo...</p>;
  }

  if (notFound || !process) {
    return <p className="text-red-500">Processo não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg border p-4">
        <h1 className="text-xl font-semibold">
          Processo {process.process_number ?? "—"}
        </h1>

        <div className="mt-2">
          <StatusBadge status={process.status} />
        </div>
      </div>

      {/* Prazo */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-1">Prazo</h2>
        <p className="text-gray-700">
          {process.due_date
            ? new Date(process.due_date).toLocaleDateString("pt-BR")
            : "Sem prazo definido"}
        </p>
      </div>

      {/* Órgão / Agência */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-1">Órgão / Agência</h2>
        <p className="text-gray-700">{process.agency || "Não informado"}</p>
      </div>

      {/* Próximos módulos */}
      <div className="border-t pt-4 text-sm text-gray-500">
        Próximos módulos:
        <ul className="list-disc ml-5 mt-1">
          <li>Histórico do processo</li>
          <li>Documentos</li>
          <li>Financeiro</li>
          <li>Movimentações</li>
        </ul>
      </div>
    </div>
  );
}