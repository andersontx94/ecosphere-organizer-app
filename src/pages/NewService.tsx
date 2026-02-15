import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";

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

export default function NewService() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Licenciamento");
  const [description, setDescription] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("0");
  const [unit, setUnit] = useState("serviço");
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nome do serviço é obrigatório.");
      return;
    }

    if (!user || !activeOrganization) {
      setError("Faça login para salvar o serviço.");
      return;
    }

    const priceValue = defaultPrice.trim()
      ? Number(defaultPrice.replace(",", "."))
      : 0;

    if (Number.isNaN(priceValue)) {
      setError("Preço padrão inválido.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("services").insert([
      {
        name: name.trim(),
        category,
        description: description.trim() || null,
        default_price: priceValue,
        unit: unit.trim() || "serviço",
        active,
        organization_id: activeOrganization.id,
      },
    ]);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/servicos");
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-5">Novo Serviço</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-white p-4 shadow-sm md:p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: Licenciamento simplificado"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="serviço"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Serviço ativo
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar Serviço"}
        </button>
      </form>
    </div>
  );
}

