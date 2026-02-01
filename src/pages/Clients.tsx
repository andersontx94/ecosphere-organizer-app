import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

type Client = {
  id: string;
  name: string;
  document: string | null;
};

export default function Clients() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        showToast("Erro ao buscar clientes", "error");
      } else {
        setClients(data as Client[]);
      }

      setLoading(false);
    }

    fetchClients();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Carregando clientes...</p>;

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2>Clientes</h2>

        <button
          onClick={() => navigate("/clientes/novo")}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          + Novo Cliente
        </button>
      </div>

      <table
        style={{
          width: "100%",
          background: "#fff",
          borderRadius: 8,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
            <th style={{ padding: 12 }}>Nome</th>
            <th style={{ padding: 12 }}>Documento</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client) => (
            <tr key={client.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: 12 }}>{client.name}</td>
              <td style={{ padding: 12 }}>
                {client.document ?? "-"}
              </td>
            </tr>
          ))}

          {clients.length === 0 && (
            <tr>
              <td colSpan={2} style={{ padding: 20, textAlign: "center" }}>
                Nenhum cliente cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}