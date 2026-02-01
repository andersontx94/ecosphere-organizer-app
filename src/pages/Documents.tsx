export default function Documents() {
  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Documentos 📁</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Gestão de documentos ambientais por processo
      </p>

      {/* Upload (mock) */}
      <div
        style={{
          background: "#f9f9f9",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <strong>📤 Novo Documento</strong>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input placeholder="Nome do documento" />
          <select>
            <option>Licença Ambiental</option>
            <option>Relatório Ambiental</option>
            <option>Ofício</option>
            <option>Protocolo</option>
          </select>
          <input type="date" />
          <button>Adicionar</button>
        </div>
      </div>

      {/* Tabela */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
        }}
      >
        <thead>
          <tr>
            <th style={th}>Documento</th>
            <th style={th}>Tipo</th>
            <th style={th}>Processo</th>
            <th style={th}>Data</th>
            <th style={th}>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td style={td}>Licença Prévia</td>
            <td style={td}>Licença Ambiental</td>
            <td style={td}>02001.000123/2025-11</td>
            <td style={td}>15/01/2026</td>
            <td style={{ ...td, color: "green" }}>Aprovado</td>
          </tr>

          <tr>
            <td style={td}>Relatório Técnico</td>
            <td style={td}>Relatório Ambiental</td>
            <td style={td}>2025/RA-8891</td>
            <td style={td}>28/01/2026</td>
            <td style={{ ...td, color: "orange" }}>Pendente</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* estilos */
const th: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid #ddd",
};

const td: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #eee",
};
