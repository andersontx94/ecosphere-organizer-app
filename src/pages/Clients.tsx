import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Client = {
  id: string;
  name: string;
  created_at: string;
};

export default function Clients() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClients() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("clients")
        .select("id, name, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Erro ao carregar clientes.");
        setClients([]);
        setLoading(false);
        return;
      }

      setClients((data ?? []) as Client[]);
      setLoading(false);
    }

    loadClients();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-500">Carregando clientes...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>

        <button
          onClick={() => navigate("/clientes/novo")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Novo Cliente
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Criado em</th>
              <th className="p-3 text-right">Ação</th>
            </tr>
          </thead>

          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={3}>
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="p-3">{client.name}</td>
                  <td className="p-3 text-gray-600">
                    {new Date(client.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate(`/clientes/${client.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Detalhes →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
