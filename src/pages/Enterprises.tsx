import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Enterprise = {
  id: string;
  name: string;
  client_id: string;
  created_at: string;
};

export default function Enterprises() {
  const navigate = useNavigate();

  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnterprises();
  }, []);

  async function fetchEnterprises() {
    setLoading(true);

    const { data, error } = await supabase
      .from("enterprises")
      .select("id, name, client_id, created_at")
      .order("name");

    if (!error) {
      setEnterprises(data || []);
    }

    setLoading(false);
  }

  if (loading) {
    return <p className="p-6 text-gray-500">Carregando empresas...</p>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Empresas</h1>

        <button
          onClick={() => navigate("/empresas/nova")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Nova Empresa
        </button>
      </div>

      {enterprises.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Nenhuma empresa cadastrada.
        </p>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-left px-4 py-3">Criada em</th>
                <th className="text-right px-4 py-3">Ação</th>
              </tr>
            </thead>

            <tbody>
              {enterprises.map((enterprise) => (
                <tr
                  key={enterprise.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">
                    {enterprise.name}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {new Date(
                      enterprise.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        navigate(`/empresas/${enterprise.id}`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      Detalhes →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}