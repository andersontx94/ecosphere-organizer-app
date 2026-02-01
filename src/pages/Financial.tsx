import React, { useState } from "react";

type Invoice = {
  client: string;
  description: string;
  value: number;
  dueDate: string;
  status: "Pago" | "Pendente" | "Atrasado";
};

export default function Financial() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      client: "Construtora Alfa",
      description: "Licença Ambiental - Janeiro",
      value: 8500,
      dueDate: "10/01/2026",
      status: "Pago",
    },
    {
      client: "Solar Norte Energia",
      description: "Relatório Ambiental",
      value: 4200,
      dueDate: "05/02/2026",
      status: "Pendente",
    },
  ]);

  const [form, setForm] = useState<Invoice>({
    client: "",
    description: "",
    value: 0,
    dueDate: "",
    status: "Pendente",
  });

  function addInvoice() {
    if (!form.client || !form.value || !form.dueDate) return;
    setInvoices([...invoices, form]);
    setForm({
      client: "",
      description: "",
      value: 0,
      dueDate: "",
      status: "Pendente",
    });
  }

  return (
    <div>
      <h1>Financeiro 💰</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Controle de contas a receber da consultoria ambiental
      </p>

      {/* NOVA COBRANÇA */}
      <div
        style={{
          background: "#f9f9f9",
          padding: 20,
          borderRadius: 8,
          marginBottom: 32,
        }}
      >
        <h3 style={{ marginBottom: 16 }}>➕ Nova Cobrança</h3>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            placeholder="Cliente"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />
          <input
            placeholder="Descrição"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Valor (R$)"
            value={form.value}
            onChange={(e) =>
              setForm({ ...form, value: Number(e.target.value) })
            }
          />
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value })
            }
          />
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as any })
            }
          >
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Atrasado">Atrasado</option>
          </select>

          <button onClick={addInvoice}>Adicionar</button>
        </div>
      </div>

      {/* TABELA */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Cliente</th>
            <th style={th}>Descrição</th>
            <th style={th}>Valor</th>
            <th style={th}>Vencimento</th>
            <th style={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((i, idx) => (
            <tr key={idx}>
              <td style={td}>{i.client}</td>
              <td style={td}>{i.description}</td>
              <td style={td}>
                R$ {i.value.toLocaleString("pt-BR")}
              </td>
              <td style={td}>{i.dueDate}</td>
              <td
                style={{
                  ...td,
                  fontWeight: 600,
                  color:
                    i.status === "Pago"
                      ? "green"
                      : i.status === "Pendente"
                      ? "orange"
                      : "red",
                }}
              >
                {i.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 10,
  borderBottom: "1px solid #ddd",
};

const td: React.CSSProperties = {
  padding: 10,
  borderBottom: "1px solid #eee",
};
