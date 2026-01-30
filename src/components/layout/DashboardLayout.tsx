import { Outlet, Link } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      <aside
        style={{
          width: 220,
          background: "#111",
          color: "#fff",
          padding: 20
        }}
      >
        <h2>EcoSphere</h2>

        <nav>
          <p>
            <Link to="/dashboard" style={{ color: "#0ff" }}>
              Dashboard
            </Link>
          </p>
          <p>
            <Link to="/processos" style={{ color: "#0ff" }}>
              Processos
            </Link>
          </p>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 40 }}>
        <Outlet />
      </main>

    </div>
  );
}
