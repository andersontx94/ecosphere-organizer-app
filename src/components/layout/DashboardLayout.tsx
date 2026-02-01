import { Outlet, NavLink } from "react-router-dom";
import React from "react";

export default function DashboardLayout() {
  return (
    <div style={styles.wrapper}>
      {/* MENU LATERAL */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>EcoSphere</h2>

        <nav style={styles.nav}>
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/clientes">Clientes</NavItem>
          <NavItem to="/empreendimentos">Empreendimentos</NavItem>
          <NavItem to="/processos">Processos</NavItem>
          <NavItem to="/financeiro">Financeiro</NavItem>
          <NavItem to="/documentos">Documentos</NavItem>
        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

/* =========================
   COMPONENTE DE LINK
========================= */
function NavItem({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...styles.link,
        color: isActive ? "#00ffff" : "#ffffff",
        fontWeight: isActive ? "bold" : "normal",
      })}
    >
      {children}
    </NavLink>
  );
}

/* =========================
   ESTILOS
========================= */
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f5f6f8",
  },

  sidebar: {
    width: 240,
    background: "#111",
    color: "#fff",
    padding: "24px 16px",
  },

  logo: {
    marginBottom: 32,
    textAlign: "center",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  link: {
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: 6,
    transition: "all 0.2s ease",
  },

  content: {
    flex: 1,
    padding: 40,
  },
};
