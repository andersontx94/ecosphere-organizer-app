import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { organizations, activeOrganization, setActiveOrganization, loading } =
    useOrganization();

  return (
    <div className="flex min-h-screen bg-transparent">
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        <header className="flex flex-col gap-3 border-b border-border/60 bg-card/70 backdrop-blur-xl px-6 py-4 shadow-[var(--shadow-sm)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Organização ativa
            </span>
            {loading ? (
              <span className="text-sm text-muted-foreground">Carregando...</span>
            ) : organizations.length <= 1 ? (
              <span className="text-sm font-medium text-foreground">
                {activeOrganization?.name ?? "Sem organização"}
              </span>
            ) : (
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm md:w-64"
                value={activeOrganization?.id ?? ""}
                onChange={(e) => setActiveOrganization(e.target.value)}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email ?? "Sem usuário"}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-destructive hover:underline"
            >
              Sair
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

