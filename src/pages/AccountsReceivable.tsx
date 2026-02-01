import { useState } from "react";
import {
  useAccountsReceivable,
  useDeleteAccountReceivable,
} from "@/integrations/accountsReceivable";

export default function AccountsReceivable() {
  const { data: receivables, isLoading } = useAccountsReceivable();
  const deleteReceivable = useDeleteAccountReceivable();
  const [search, setSearch] = useState("");

  if (isLoading) {
    return <p>Carregando contas a receber...</p>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>
        Contas a Receber
      </h1>

      <input
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 8,
          marginBottom: 16,
          width: 250,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      <table width="100%" cellPadding={10}>
        <thead>
          <tr style={{ textAlign: "left", background: "#f3f4f6" }}>
            <th>Descrição</th>
            <th>Status</th>
            <th>Prazo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {receivables
            .filter((item) =>
              item.description.toLowerCase().includes(search.toLowerCase())
            )
            .map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td>{item.description}</td>
                <td>{item.status}</td>
                <td>{item.due_date || "-"}</td>
                <td>
                  <button
                    onClick={() => deleteReceivable.mutate(item.id)}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}