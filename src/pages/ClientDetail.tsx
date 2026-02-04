import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Client = {
  id: string;
  name: string;
  created_at: string;
};

type Enterprise = {
  id: string;
  name: string;
};

type Process = {
  id: string;
  process_number: string;
  status: string;
  due_date: string | null;
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const [
        { data: clientData, error: clientError },
        { data: enterprisesData, error: enterprisesError },
        { data: processesData, error: processesError },
      ] = await Promise.all([
        supabase.from("clients").select("*").eq("id", id).single(),
        // se enterprise tiver client_id mesmo, ok:
        supabase.from("enterprises").select("id, name").eq("client_id", id),
        supabase
          .from("processes")
          .select("id, process_number, status, due_date")
          .eq("client_id", id),
      ]);

      // se deu erro no client, considera não encontrado
      if (clientError || !clientData) {
        setClient(null);
        setEnterprises([]);
        setProcesses([]);
        setLoading(false);
        return;
      }

      // enterprises/processes podem falhar sem quebrar o detalhe
      if (enterprisesError) {
        setEnterprises([]);
      } else {
        setEnterprises(enterprisesData ?? []);
      }

      if (processesError) {
        setProcesses([]);
      } else {
        setProcesses(processesData ?? []);
      }

      setClient(clientData as Client);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  if (loading) {
    return <p className="p-6 text-gray-500">Carregando cliente...</p>;
  }

  if (!client) {
    return <p className="p-6 text-red-500">Cliente não encontrado.</p>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <p className="text-sm text-gray-500">
          Criado em {new Date(client.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* EMPRESAS */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">Empresas</h2>

          <button
            onClick={() => navigate(`/empresas/nova?client_id=${client.id}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Nova empresa
          </button>
        </div>

        {enterprises.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma empresa cadastrada.</p>
        ) : (
          <ul className="space-y-2">
            {enterprises.map((enterprise) => (
              <li
                key={enterprise.id}
                className="border rounded p-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/empresas/${enterprise.id}`)}
              >
                {enterprise.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PROCESSOS */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">Processos</h2>

          <button
            onClick={() => navigate(`/processos/novo?client_id=${client.id}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Novo processo
          </button>
        </div>

        {processes.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum processo cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {processes.map((process) => (
              <div
                key={process.id}
                className="border rounded p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/processos/${process.id}`)}
              >
                <div>
                  <p className="font-medium">{process.process_number}</p>
                  <p className="text-xs text-gray-500">
                    Status: {process.status}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  {process.due_date
                    ? new Date(process.due_date).toLocaleDateString("pt-BR")
                    : "Sem prazo"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
