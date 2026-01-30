export default function Dashboard() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        padding: 40
      }}
    >
      <h1>DASHBOARD OK</h1>
      <p>Se você está vendo isso, o React está 100% vivo.</p>

      <a href="/processos" style={{ color: "cyan" }}>
        Ir para Processos
      </a>
    </div>
  );
}
