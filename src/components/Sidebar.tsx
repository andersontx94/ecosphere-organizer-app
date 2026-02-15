import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  ClipboardCheck,
  Briefcase,
  FolderKanban,
  DollarSign,
  Tags,
  FileSignature,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export default function Sidebar({ className, onNavigate }: SidebarProps) {
  const baseLink =
    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
  const activeLink =
    "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))] ring-1 ring-[hsl(var(--sidebar-ring))] shadow-sm";
  const inactiveLink =
    "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-primary))]";

  return (
    <aside
      className={cn(
        "w-64 min-h-screen border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] p-6 shadow-[var(--shadow-lg)]",
        className
      )}
    >
      <div className="mb-8 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">EcoSphere</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--sidebar-primary))]">
          Gestão Ambiental
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        <NavLink
          to="/"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <LayoutDashboard className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          Dashboard
        </NavLink>

        <NavLink
          to="/clientes"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <Users className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          Clientes
        </NavLink>

        <NavLink
          to="/empresas"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <Building2 className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          Empreendimentos
        </NavLink>

        <NavLink
          to="/processos"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <FolderKanban className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          Processos
        </NavLink>

        <NavLink
          to="/processos/tipos"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <Tags className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          Tipos de Processo
        </NavLink>

        <NavLink
          to="/propostas"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <FileSignature className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          Propostas
        </NavLink>

        <NavLink
          to="/servicos"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <Briefcase className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          Serviços
        </NavLink>

        <NavLink
          to="/financeiro"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <DollarSign className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          Financeiro
        </NavLink>

        <NavLink
          to="/documentos"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <FileText className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          Documentos
        </NavLink>

        <NavLink
          to="/tarefas"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <ClipboardCheck className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
          Tarefas
        </NavLink>
      </nav>
    </aside>
  );
}

