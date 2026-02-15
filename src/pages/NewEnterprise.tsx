import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";

type ClientOption = {
  id: string;
  name: string;
};

export default function NewEnterprise() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();
  const [searchParams] = useSearchParams();

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState<string>(
    searchParams.get("client_id") ?? ""
  );
  const [name, setName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [activity, setActivity] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadClients() {
      if (!activeOrganization) return;
      const { data } = await supabase
        .from("clients")
        .select("id, name")
        .eq("organization_id", activeOrganization.id)
        .order("name");
      setClients((data as ClientOption[]) || []);
    }

    loadClients();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nome do empreendimento é obrigatório.");
      return;
    }

    if (!clientId) {
      setError("Selecione um cliente.");
      return;
    }

    if (!user || !activeOrganization) {
      setError("Faça login para salvar o empreendimento.");
      return;
    }

    const latValue = lat.trim() ? Number(lat.replace(",", ".")) : null;
    const lngValue = lng.trim() ? Number(lng.replace(",", ".")) : null;
    if ((lat && Number.isNaN(latValue)) || (lng && Number.isNaN(lngValue))) {
      setError("Coordenadas inválidas.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("enterprises").insert(
      [
        {
          name: name.trim(),
          client_id: clientId,
          cpf_cnpj: cpfCnpj.trim() || null,
          activity: activity.trim() || null,
          address: address.trim() || null,
          state: state.trim() || null,
          city: city.trim() || null,
          lat: latValue,
          lng: lngValue,
          notes: notes.trim() || null,
          active,
          organization_id: activeOrganization.id,
        },
      ] as any
    );

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/empresas");
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-5">Novo Empreendimento</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-white p-4 shadow-sm md:p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Nome da unidade"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              CPF/CNPJ da unidade
            </label>
            <input
              type="text"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Atividade/Ramo
            </label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cidade</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Latitude (opcional)
            </label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Longitude (opcional)
            </label>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Empreendimento ativo
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar Empreendimento"}
        </button>
      </form>
    </div>
  );
}

