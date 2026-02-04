import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function NewClient() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [responsible, setResponsible] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      alert("Informe o nome do cliente");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("clients").insert([
      {
        name,
        cnpj,
        responsible,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Erro ao salvar cliente");
      return;
    }

    navigate("/clientes");
  }

  return (
    <div className="p-8">
      {/* Container central */}
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold mb-6">Novo Cliente</h1>

        <div className="space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome da empresa"
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">CNPJ</label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="00.000.000/0000-00"
            />
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Responsável
            </label>
            <input
              type="text"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              className="w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do responsável"
            />
          </div>

          {/* Botão */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}