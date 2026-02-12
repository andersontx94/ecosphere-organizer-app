import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

type ProcessOption = {
  id: string;
  process_number: string | null;
  process_type: string | null;
  enterprises?: { name: string | null } | null;
};

type TaskRow = {
  id: string;
  process_id: string;
  title: string;
  description: string | null;
  status: string | null;
  due_date: string | null;
  created_at: string;
  environmental_processes?: {
    process_number: string | null;
    process_type: string | null;
    enterprises?: { name: string | null } | null;
  } | null;
};

const STATUS_OPTIONS = ["Aberta", "Em progresso", "Concluída"];

function statusVariant(status: string | null) {
  if (status === "Concluída") return "success";
  if (status === "Em progresso") return "info";
  return "warning";
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false;
  const today = new Date();
  const due = new Date(`${dueDate}T00:00:00`);
  return due.getTime() < today.setHours(0, 0, 0, 0);
}

export default function Tasks() {
  const { activeOrganization, loading: orgLoading } = useOrganization();
  const [processes, setProcesses] = useState<ProcessOption[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [processId, setProcessId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Aberta");
  const [saving, setSaving] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadProcesses() {
      if (!activeOrganization) {
        setProcesses([]);
        return;
      }
      const { data, error } = await supabase
        .from("environmental_processes")
        .select("id, process_number, process_type, enterprises(name)")
        .eq("organization_id", activeOrganization.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load processes (tasks):", error);
        return;
      }

      setProcesses((data as ProcessOption[]) ?? []);
    }

    loadProcesses();
  }, [activeOrganization]);

  async function loadTasks() {
    if (!activeOrganization) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("tasks")
      .select(
        "id, process_id, title, description, status, due_date, created_at, environmental_processes(process_number, process_type, enterprises(name))"
      )
      .eq("organization_id", activeOrganization.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load tasks:", error);
      setError(error.message);
      setTasks([]);
    } else {
      setTasks((data as TaskRow[]) ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!activeOrganization) {
      setTasks([]);
      setLoading(false);
      setError(null);
      return;
    }
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrganization]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = statusFilter ? task.status === statusFilter : true;
      const matchesSearch = search
        ? task.title.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [tasks, statusFilter, search]);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrganization) return;

    setError(null);

    if (!processId) {
      setError("Selecione um processo para a tarefa.");
      return;
    }

    if (!title.trim()) {
      setError("Informe o título da tarefa.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("tasks").insert([
      {
        organization_id: activeOrganization.id,
        process_id: processId,
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        due_date: dueDate ? dueDate : null,
        status,
      },
    ]);

    if (error) {
      console.error("Failed to create task:", error);
      setError(error.message);
      setSaving(false);
      return;
    }

    setProcessId("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setStatus("Aberta");
    setSaving(false);

    await loadTasks();
  }

  async function handleUpdateStatus(taskId: string, nextStatus: string) {
    if (!activeOrganization) return;
    const { error } = await supabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", taskId)
      .eq("organization_id", activeOrganization.id);

    if (error) {
      console.error("Failed to update task status:", error);
      setError(error.message);
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      )
    );
  }

  async function handleDelete(taskId: string) {
    if (!activeOrganization) return;
    const ok = window.confirm("Excluir esta tarefa?");
    if (!ok) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("organization_id", activeOrganization.id);

    if (error) {
      console.error("Failed to delete task:", error);
      setError(error.message);
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  if (orgLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Carregando organização...</p>
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="p-6">
        <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
          <CardContent className="p-6 text-center space-y-2">
            <h1 className="text-xl font-semibold">Tarefas</h1>
            <p className="text-sm text-muted-foreground">
              Selecione ou crie uma organização para continuar.
            </p>
            <Button asChild>
              <Link to="/">Voltar ao painel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Tarefas"
        description="Controle de pendências e atividades vinculadas aos processos."
      />

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base">Nova tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Processo</label>
                <select
                  className="border border-input bg-background rounded px-3 py-2 w-full"
                  value={processId}
                  onChange={(e) => setProcessId(e.target.value)}
                >
                  <option value="">Selecione o processo</option>
                  {processes.map((proc) => (
                    <option key={proc.id} value={proc.id}>
                      {proc.process_number ?? "Sem número"} — {proc.process_type ?? "Sem tipo"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Título</label>
                <input
                  className="border border-input bg-background rounded px-3 py-2 w-full"
                  placeholder="Título da tarefa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Prazo</label>
                <input
                  className="border border-input bg-background rounded px-3 py-2 w-full"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Status</label>
                <select
                  className="border border-input bg-background rounded px-3 py-2 w-full"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Descrição</label>
              <textarea
                className="border border-input bg-background rounded px-3 py-2 w-full"
                rows={3}
                placeholder="Descrição (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Salvando..." : "Criar tarefa"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Lista de tarefas</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="border border-input bg-background rounded px-3 py-2"
              placeholder="Buscar por título"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border border-input bg-background rounded px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando tarefas...</p>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center space-y-2 py-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada.</p>
              <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <Plus className="h-4 w-4" />
                Criar tarefa
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task, index) => (
                <div key={task.id} className={`border border-border/60 rounded-lg p-3 ${index % 2 === 1 ? "bg-muted/30" : "bg-card/90"}`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{task.title}</p>
                        <Badge variant={statusVariant(task.status)}>
                          {task.status ?? "Aberta"}
                        </Badge>
                        {task.due_date && isOverdue(task.due_date) && (
                          <Badge variant="destructive">Vencida</Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Processo: {task.environmental_processes?.process_number ?? "—"} — {task.environmental_processes?.process_type ?? "Sem tipo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Prazo: {task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "Sem prazo"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        className="border border-input bg-background rounded px-2 py-1 text-sm"
                        value={task.status ?? "Aberta"}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <Button variant="ghost" className="text-red-600" onClick={() => handleDelete(task.id)}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
