import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function NewClient() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();

  const [type, setType] = useState("PJ");
  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }

    if (!user || !activeOrganization) {
      setError("Faça login para salvar o cliente.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("clients").insert([
      {
        organization_id: activeOrganization.id,
        type,
        name: name.trim(),
        trade_name: tradeName.trim() || null,
        cpf_cnpj: cpfCnpj.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        address: address.trim() || null,
        notes: notes.trim() || null,
        active,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      setError(error.message);
      return;
    }

    navigate("/clientes");
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold mb-6">Novo Cliente</h1>

        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-xl border bg-white p-4 shadow-sm md:p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border px-4 py-2 text-sm"
              >
                <option value="PJ">Pessoa Jurídica (PJ)</option>
                <option value="PF">Pessoa Física (PF)</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm mt-6 md:mt-0">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Cliente ativo
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border px-4 py-2 text-sm"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full rounded-md border px-4 py-2 text-sm"
                placeholder="Se aplicável"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                CPF/CNPJ
              </label>
              <input
                type="text"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                className="w-full rounded-md border px-4 py-2 text-sm"
                placeholder="Documento"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border px-4 py-2 text-sm"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-md border px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Estado</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-md border px-4 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Endereço</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border px-4 py-2 text-sm"
              placeholder="Rua, número, bairro"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border px-4 py-2 text-sm"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60 md:w-auto"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

