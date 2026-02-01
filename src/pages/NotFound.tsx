import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f6f8",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 8,
          textAlign: "center",
          boxShadow: "0 0 12px rgba(0,0,0,0.08)",
          maxWidth: 420,
        }}
      >
        <h1 style={{ fontSize: 48, marginBottom: 8 }}>404</h1>

        <h2 style={{ marginBottom: 12 }}>
          Página não encontrada
        </h2>

        <p style={{ color: "#555", marginBottom: 24 }}>
          A página que você tentou acessar não existe ou foi removida.
        </p>

        <Link
          to="/dashboard"
          style={{
            textDecoration: "none",
            background: "#00ffff",
            color: "#000",
            padding: "10px 18px",
            borderRadius: 6,
            fontWeight: "bold",
          }}
        >
          Voltar para o Dashboard
        </Link>
      </div>
    </div>
  );
}
