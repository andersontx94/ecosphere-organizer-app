import { Link } from "react-router-dom";

type Alerta = {
  tipo: "Processo" | "Documento";
  descricao: string;
  vencimento: string;
  status: "Urgente" | "Atenção";
  link: string;
};

export default function Dashboard() {
  const alertas: Alerta[] = [
    {
      tipo: "Processo",
      descricao: "Licença Ambiental – Usina Solar Manaus",
      vencimento: "15/03/2026",
      status: "Urgente",
      link: "/processos/1",
    },
    {
      tipo: "Documento",
      descricao: "Relatório Ambiental – Residencial Jardim Verde",
      vencimento: "02/02/2026",
      status: "Atenção",
      link: "/documentos",
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Dashboard 📊</h1>
      <p style={{ color: "#555", marginBottom: 32 }}>
        Visão geral da consultoria ambiental
      </p>

      {/* RESUMO */}
      <section style={grid}>
        <Card titulo="Clientes" valor="12" />
        <Card titulo="Empreendimentos" valor="18" />
        <Card titulo="Processos Ativos" valor="9" />
        <Card titulo="Pendências" valor="3" />
      </section>

      {/* ALERTAS */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{ marginBottom: 12 }}>⚠️ Alertas Importantes</h2>

        {alertas.length === 0 && (
          <p style={{ color: "#777" }}>
            Nenhum alerta no momento.
          </p>
        )}

        {alertas.map((a, i) => (
          <div
            key={i}
            style={{
              ...alertBox,
              borderLeft:
                a.status === "Urgente"
                  ? "6px solid #ff4d4f"
                  : "6px solid #faad14",
            }}
          >
            <div>
              <strong>{a.tipo}</strong>
              <p>{a.descricao}</p>
              <small>Vencimento: {a.vencimento}</small>
            </div>

            <Link to={a.link} style={alertLink}>
              Ver
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}

/* =========================
   COMPONENTES AUXILIARES
========================= */

function Card({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 8 }}>{titulo}</h3>
      <span style={{ fontSize: 32, fontWeight: "bold" }}>
        {valor}
      </span>
    </div>
  );
}

/* =========================
   ESTILOS
========================= */

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
};

const card: React.CSSProperties = {
  background: "#fff",
  padding: 24,
  borderRadius: 8,
  boxShadow: "0 0 10px rgba(0,0,0,0.05)",
};

const alertBox: React.CSSProperties = {
  background: "#fff",
  padding: 16,
  borderRadius: 6,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
  boxShadow: "0 0 8px rgba(0,0,0,0.05)",
};

const alertLink: React.CSSProperties = {
  textDecoration: "none",
  fontWeight: "bold",
  color: "#1890ff",
};
