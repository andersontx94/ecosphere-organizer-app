import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  FolderKanban,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

type Stats = {
  clients: number;
  enterprises: number;
  activeProcesses: number;
  openTasks: number;
  dueSoon: number;
};

type AlertItem = {
  id: string;
  process_number: string | null;
  process_type: string | null;
  due_date: string | null;
  clients?: { name: string | null } | null;
  enterprises?: { name: string | null } | null;
};

const EMPTY_STATS: Stats = {
  clients: 0,
  enterprises: 0,
  activeProcesses: 0,
  openTasks: 0,
  dueSoon: 0,
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dueLabel(dueDate: string | null) {
  if (!dueDate) return "Sem prazo";
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(`${dueDate}T00:00:00`));
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    const days = Math.abs(diff);
    return `Vencido há ${days} dia${days === 1 ? "" : "s"}`;
  }
  if (diff === 0) return "Vence hoje";
  return `Vence em ${diff} dia${diff === 1 ? "" : "s"}`;
}

export default function Dashboard() {
  const { activeOrganization } = useOrganization();
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!activeOrganization) return;
      setLoading(true);
      setError(null);

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const soon = new Date();
      soon.setDate(soon.getDate() + 15);
      const soonStr = soon.toISOString().split("T")[0];

      try {
        const [
          clientsCount,
          enterprisesCount,
          activeProcessesCount,
          openTasksCount,
          dueSoonCount,
          alertsData,
        ] = await Promise.all([
          supabase
            .from("clients")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", activeOrganization.id),
          supabase
            .from("enterprises")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", activeOrganization.id),
          supabase
            .from("environmental_processes")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", activeOrganization.id)
            .not("status", "in", '("Concluído","Concluido","Cancelado")'),
          supabase
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", activeOrganization.id)
            .neq("status", "Concluída"),
          supabase
            .from("environmental_processes")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", activeOrganization.id)
            .gte("due_date", todayStr)
            .lte("due_date", soonStr)
            .not("status", "in", '("Concluído","Concluido","Cancelado")'),
          supabase
            .from("environmental_processes")
            .select(
              "id, process_number, process_type, due_date, clients(name), enterprises(name)"
            )
            .eq("organization_id", activeOrganization.id)
            .not("due_date", "is", null)
            .lte("due_date", soonStr)
            .not("status", "in", '("Concluído","Concluido","Cancelado")')
            .order("due_date", { ascending: true })
            .limit(5),
        ]);

        if (
          clientsCount.error ||
          enterprisesCount.error ||
          activeProcessesCount.error ||
          openTasksCount.error ||
          dueSoonCount.error ||
          alertsData.error
        ) {
          throw (
            clientsCount.error ||
            enterprisesCount.error ||
            activeProcessesCount.error ||
            openTasksCount.error ||
            dueSoonCount.error ||
            alertsData.error
          );
        }

        setStats({
          clients: clientsCount.count ?? 0,
          enterprises: enterprisesCount.count ?? 0,
          activeProcesses: activeProcessesCount.count ?? 0,
          openTasks: openTasksCount.count ?? 0,
          dueSoon: dueSoonCount.count ?? 0,
        });

        setAlerts((alertsData.data as AlertItem[]) ?? []);
      } catch (err) {
        const message =
          typeof err === "object" && err && "message" in err
            ? (err as { message?: string }).message
            : "Erro desconhecido ao carregar dashboard.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [activeOrganization]);

  const cards = useMemo(
    () => [
      {
        label: "Clientes",
        value: stats.clients,
        icon: Users,
        accent: "border-emerald-500/60",
        badge: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Empreendimentos",
        value: stats.enterprises,
        icon: Building2,
        accent: "border-blue-500/60",
        badge: "bg-blue-100 text-blue-700",
      },
      {
        label: "Processos ativos",
        value: stats.activeProcesses,
        icon: FolderKanban,
        accent: "border-violet-500/60",
        badge: "bg-violet-100 text-violet-700",
      },
      {
        label: "Tarefas abertas",
        value: stats.openTasks,
        icon: ClipboardCheck,
        accent: "border-amber-500/60",
        badge: "bg-amber-100 text-amber-700",
      },
      {
        label: "Vencendo em 15 dias",
        value: stats.dueSoon,
        icon: AlertTriangle,
        accent: "border-rose-500/60",
        badge: "bg-rose-100 text-rose-700",
      },
    ],
    [stats]
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral da consultoria ambiental"
        eyebrow="Visão geral"
        action={
          <div className="flex items-center gap-2 text-xs text-primary/80">
            <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
            Atualização em tempo real
          </div>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          Erro ao carregar dashboard: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card
            key={card.label}
            className={`border-l-4 ${card.accent} border-border/60 bg-card/80 shadow-[var(--shadow-card)] backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs uppercase tracking-[0.16em] text-primary/70">
                  {card.label}
                </CardDescription>
                <span className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs ${card.badge}`}>
                  <card.icon className="h-3.5 w-3.5" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">
                {loading ? "..." : card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading &&
        stats.clients === 0 &&
        stats.enterprises === 0 &&
        stats.activeProcesses === 0 && (
          <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)] backdrop-blur">
            <CardHeader>
              <CardTitle>Comece em 3 passos</CardTitle>
              <CardDescription>
                Configure sua operação e já comece a registrar processos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-dashed border-border/60 bg-card/60 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">1. Cadastre um cliente</CardTitle>
                    <CardDescription>
                      Organize dados e contatos do contratante.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/clientes/novo">Criar cliente</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-dashed border-border/60 bg-card/60 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">2. Crie um empreendimento</CardTitle>
                    <CardDescription>
                      Relacione unidades e localizações.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/empresas/nova">Criar empreendimento</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-dashed border-border/60 bg-card/60 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">3. Abra um processo</CardTitle>
                    <CardDescription>
                      Controle prazos, serviços e tarefas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/processos/novo">Criar processo</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)] backdrop-blur">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Alertas importantes</CardTitle>
            <CardDescription>
              {alerts.length} processo(s) com vencimento próximo
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando alertas...</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum processo com vencimento próximo.
            </p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/90 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {alert.process_number ?? "Processo sem número"} — {alert.process_type ?? "Sem tipo"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {alert.clients?.name ?? "—"} • Empreendimento: {alert.enterprises?.name ?? "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {dueLabel(alert.due_date)} • {formatDate(alert.due_date)}
                    </p>
                  </div>
                  <Link
                    to={`/processos/${alert.id}`}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Ver processo
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

