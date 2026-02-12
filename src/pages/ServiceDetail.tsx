import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";

type Service = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  default_price: number | null;
  unit: string | null;
  active: boolean | null;
  created_at: string;
};

const CATEGORY_OPTIONS = [
  "Licenciamento",
  "IBAMA / Federal",
  "Resíduos",
  "Estudos e Relatórios",
  "Monitoramento",
  "Cadastro",
  "Treinamento",
  "Outros",
];

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [defaultPrice, setDefaultPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadService() {
      if (!id || !activeOrganization) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("services")
        .select("id, name, category, description, default_price, unit, active, created_at")
        .eq("id", id)
        .eq("organization_id", activeOrganization.id)
        .single();

      if (error || !data) {
        setError("Serviço não encontrado.");
        setService(null);
        setLoading(false);
        return;
      }

      setService(data as Service);
      setDefaultPrice(
        data.default_price !== null ? String(data.default_price) : "0"
      );
      setLoading(false);
    }

    loadService();
  }, [id, user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!service || !activeOrganization) return;

    if (!service.name.trim()) {
      setError("Nome do serviço é obrigatório.");
      return;
    }

    const priceValue = defaultPrice.trim()
      ? Number(defaultPrice.replace(",", "."))
      : 0;

    if (Number.isNaN(priceValue)) {
      setError("Preço padrão inválido.");
      return;
    }

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("services")
      .update({
        name: service.name.trim(),
        category: service.category ?? "Outros",
        description: service.description?.trim() || null,
        default_price: priceValue,
        unit: service.unit?.trim() || "serviço",
        active: service.active ?? true,
      })
      .eq("id", service.id)
      .eq("organization_id", activeOrganization.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
  }

  async function handleDelete() {
    if (!service || !activeOrganization) return;
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este serviço?"
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", service.id)
      .eq("organization_id", activeOrganization.id);

    setDeleting(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/servicos");
  }

  if (loading) {
    return <p className="p-6 text-gray-500">Carregando serviço...</p>;
  }

  if (!service) {
    return <p className="p-6 text-red-600">{error ?? "Não encontrado."}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Detalhe do Serviço</h1>
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
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={service.name}
            onChange={(e) => setService({ ...service, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoria</label>
          <select
            value={service.category ?? "Outros"}
            onChange={(e) =>
              setService({ ...service, category: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            value={service.description ?? ""}
            onChange={(e) =>
              setService({ ...service, description: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Preço padrão (R$)
            </label>
            <input
              type="text"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unidade</label>
            <input
              type="text"
              value={service.unit ?? "serviço"}
              onChange={(e) => setService({ ...service, unit: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={service.active ?? true}
            onChange={(e) =>
              setService({ ...service, active: e.target.checked })
            }
          />
          Serviço ativo
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
    </div>
  );
}

