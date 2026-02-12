import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/ui/StatusBadge";
import { useProcesses } from "../hooks/useProcesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function Processes() {
  const navigate = useNavigate();
  const { processes, loading, getComputedStatus } = useProcesses();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dueSoonOnly, setDueSoonOnly] = useState(false);

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  const visibleProcesses = useMemo(() => {
    return processes.filter((process) => {
      if (statusFilter !== "all" && process.status !== statusFilter) {
        return false;
      }

      if (dueSoonOnly) {
        if (!process.due_date) return false;
        const today = new Date();
        const due = new Date(process.due_date + "T00:00:00");
        const diffDays =
          (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 15) return false;
      }

      return true;
    });
  }, [processes, statusFilter, dueSoonOnly]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Processos"
        description="Licenças, protocolos e prazos ambientais."
        action={
          <Button onClick={() => navigate("/processos/novo")}>
            <Plus className="h-4 w-4" />
            Novo processo
          </Button>
        }
      />

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Pendente">Pendente</option>
              <option value="Concluído">Concluído</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm mt-6 md:mt-0">
            <input
              type="checkbox"
              checked={dueSoonOnly}
              onChange={(e) => setDueSoonOnly(e.target.checked)}
            />
            Vencimento nos próximos 15 dias
          </label>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-muted-foreground">Carregando...</div>
          ) : visibleProcesses.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FolderKanban className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nenhum processo encontrado com os filtros selecionados.
              </p>
              <Button onClick={() => navigate("/processos/novo")}>
                <Plus className="h-4 w-4" />
                Criar processo
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/60 border-b border-border/60">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Processo</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Empreendimento</th>
                  <th className="px-6 py-3">Órgão</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Vencimento</th>
                  <th className="px-6 py-3 text-right">Ação</th>
                </tr>
              </thead>

              <tbody>
                {visibleProcesses.map((process, index) => {
                  const computed = getComputedStatus(process);
                  const isDueSoon = computed.visualStatus === "vence_em_breve";
                  const isOverdue = computed.visualStatus === "atrasado";

                  return (
                    <tr
                      key={process.id}
                      onClick={() => navigate(`/processos/${process.id}`)}
                      className={`border-b border-border/60 last:border-none hover:bg-muted/40 cursor-pointer transition ${index % 2 === 1 ? "bg-muted/30" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {process.process_number ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {process.process_type ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {process.clients?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {process.enterprises?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {process.agency ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={computed.visualStatus}>
                          {computed.label}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {process.due_date ? (
                          <span
                            className={
                              isOverdue
                                ? "text-destructive font-medium"
                                : isDueSoon
                                ? "text-amber-600 font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {formatDate(process.due_date)}
                          </span>
                        ) : (
                          <span className="italic text-muted-foreground">Sem prazo</span>
                        )}
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/processos/${process.id}`);
                        }}
                      >
                        <Button variant="ghost" className="text-primary hover:text-primary/80">
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
