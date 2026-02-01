import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ProcessStatus } from "../types/process";
import { useToast } from "../components/Toast";

export default function NewProcess() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [processNumber, setProcessNumber] = useState("");
  const [status, setStatus] = useState<ProcessStatus>("em_andamento");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!processNumber) {
      showToast("Informe o número do processo", "error");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("processes").insert({
      process_number: processNumber,
      status,
      due_date: dueDate,
    });

    setSaving(false);

    if (error) {
      showToast("Erro ao salvar processo", "error");
    } else {
      showToast("Processo criado com sucesso");
      navigate("/processos");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>Novo Processo</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Nº do Processo</label>
          <input
            value={processNumber}
            onChange={(e) => setProcessNumber(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Status</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as ProcessStatus)
            }
            style={{ width: "100%", padding: 8 }}
          >
            <option value="em_andamento">Em andamento</option>
            <option value="concluido">Concluído</option>
            <option value="suspenso">Suspenso</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label>Prazo</label>
          <input
            type="date"
            value={dueDate ?? ""}
            onChange={(e) => setDueDate(e.target.value)}
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
          {saving ? "Salvando..." : "Salvar Processo"}
        </button>
      </form>
    </div>
  );
}