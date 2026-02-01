import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

export default function NewClient() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name) {
      showToast("Informe o nome do cliente", "error");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("clients").insert({
      name,
      document: document || null,
    });

    setSaving(false);

    if (error) {
      showToast("Erro ao salvar cliente", "error");
    } else {
      showToast("Cliente criado com sucesso");
      navigate("/clientes");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>Novo Cliente</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label>CPF / CNPJ</label>
          <input
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "10px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {saving ? "Salvando..." : "Salvar Cliente"}
        </button>
      </form>
    </div>
  );
}