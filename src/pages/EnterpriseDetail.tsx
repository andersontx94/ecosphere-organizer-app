import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";

type Enterprise = {
  id: string;
  client_id: string;
  name: string;
  cpf_cnpj: string | null;
  activity: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  active: boolean | null;
  created_at: string;
};

type ClientOption = {
  id: string;
  name: string;
};

type Process = {
  id: string;
  process_number: string | null;
  process_type: string | null;
  status: string | null;
  due_date: string | null;
};

export default function EnterpriseDetail() {
  const { id } = useParams<{ id: string }>();
  const { activeOrganization } = useOrganization();
  const navigate = useNavigate();

  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id || !activeOrganization) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const [
        { data: enterpriseData, error: enterpriseError },
        { data: clientData },
        { data: processData },
      ] = await Promise.all([
        supabase
          .from("enterprises")
          .select(
            "id, client_id, name, cpf_cnpj, activity, address, city, state, lat, lng, notes, active, created_at"
          )
          .eq("id", id)
          .eq("organization_id", activeOrganization.id)
          .single(),
        supabase
          .from("clients")
          .select("id, name")
          .eq("organization_id", activeOrganization.id)
          .order("name"),
        supabase
          .from("environmental_processes")
          .select("id, process_number, process_type, status, due_date")
          .eq("enterprise_id", id)
          .eq("organization_id", activeOrganization.id)
          .order("created_at", { ascending: false }),
      ]);

      if (enterpriseError || !enterpriseData) {
        setError("Empreendimento não encontrado.");
        setEnterprise(null);
        setClients((clientData as ClientOption[]) || []);
        setProcesses((processData as Process[]) || []);
        setLoading(false);
        return;
      }

      setEnterprise(enterpriseData as Enterprise);
      setClients((clientData as ClientOption[]) || []);
      setProcesses((processData as Process[]) || []);
      setLoading(false);
    }

    loadData();
  }, [id, activeOrganization]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!enterprise || !activeOrganization) return;

    if (!enterprise.name.trim()) {
      setError("Nome do empreendimento é obrigatório.");
      return;
    }

    if (!enterprise.client_id) {
      setError("Selecione um cliente.");
      return;
    }

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("enterprises")
      .update({
        name: enterprise.name.trim(),
        client_id: enterprise.client_id,
        cpf_cnpj: enterprise.cpf_cnpj?.trim() || null,
        activity: enterprise.activity?.trim() || null,
        address: enterprise.address?.trim() || null,
        city: enterprise.city?.trim() || null,
        state: enterprise.state?.trim() || null,
        lat: enterprise.lat,
        lng: enterprise.lng,
        notes: enterprise.notes?.trim() || null,
        active: enterprise.active ?? true,
      })
      .eq("id", enterprise.id)
      .eq("organization_id", activeOrganization.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
  }

  async function handleDelete() {
    if (!enterprise || !activeOrganization) return;
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este empreendimento?"
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    const { error } = await supabase
      .from("enterprises")
      .delete()
      .eq("id", enterprise.id)
      .eq("organization_id", activeOrganization.id);

    setDeleting(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/empresas");
  }

  if (loading) {
    return <p className="p-6 text-gray-500">Carregando empreendimento...</p>;
  }

  if (!enterprise) {
    return <p className="p-6 text-red-600">{error ?? "Não encontrado."}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Detalhe do Empreendimento</h1>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:underline"
          disabled={deleting}
        >
          {deleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <select
            value={enterprise.client_id}
            onChange={(e) =>
              setEnterprise({ ...enterprise, client_id: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={enterprise.name}
            onChange={(e) =>
              setEnterprise({ ...enterprise, name: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">CPF/CNPJ</label>
            <input
              type="text"
              value={enterprise.cpf_cnpj ?? ""}
              onChange={(e) =>
                setEnterprise({ ...enterprise, cpf_cnpj: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Atividade/Ramo
            </label>
            <input
              type="text"
              value={enterprise.activity ?? ""}
              onChange={(e) =>
                setEnterprise({ ...enterprise, activity: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <input
            type="text"
            value={enterprise.address ?? ""}
            onChange={(e) =>
              setEnterprise({ ...enterprise, address: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cidade</label>
            <input
              type="text"
              value={enterprise.city ?? ""}
              onChange={(e) =>
                setEnterprise({ ...enterprise, city: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <input
              type="text"
              value={enterprise.state ?? ""}
              onChange={(e) =>
                setEnterprise({ ...enterprise, state: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              type="text"
              value={enterprise.lat ?? ""}
              onChange={(e) =>
                setEnterprise({
                  ...enterprise,
                  lat: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              type="text"
              value={enterprise.lng ?? ""}
              onChange={(e) =>
                setEnterprise({
                  ...enterprise,
                  lng: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea
            value={enterprise.notes ?? ""}
            onChange={(e) =>
              setEnterprise({ ...enterprise, notes: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enterprise.active ?? true}
            onChange={(e) =>
              setEnterprise({ ...enterprise, active: e.target.checked })
            }
          />
          Empreendimento ativo
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Processos do empreendimento</h2>
          <button
            onClick={() => navigate(`/processos/novo?enterprise_id=${enterprise.id}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Novo processo
          </button>
        </div>

        {processes.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum processo vinculado a este empreendimento.
          </p>
        ) : (
          <div className="space-y-2">
            {processes.map((process) => (
              <div
                key={process.id}
                className="border rounded p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/processos/${process.id}`)}
              >
                <div>
                  <p className="font-medium">
                    {process.process_number ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {process.process_type ?? "—"} • {process.status ?? "—"}
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
