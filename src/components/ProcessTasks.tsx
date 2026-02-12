import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";

type Task = {
  id: string;
  process_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string | null;
  created_at: string;
};

type Props = {
  processId: string;
};

const STATUS_OPTIONS = ["Aberta", "Em progresso", "Concluída"];

export default function ProcessTasks({ processId }: Props) {
  const { activeOrganization } = useOrganization();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const pendingCount = useMemo(
    () => tasks.filter((t) => t.status !== "Concluída").length,
    [tasks]
  );

  async function loadTasks() {
    if (!activeOrganization) return;
    setError("");
    setLoading(true);

    const { data, error } = await supabase
      .from("tasks")
      .select("id, process_id, title, description, due_date, status, created_at")
      .eq("process_id", processId)
      .eq("organization_id", activeOrganization.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Erro ao carregar tarefas.");
      setTasks([]);
    } else {
      setTasks((data || []) as Task[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processId, activeOrganization?.id]);

  async function handleAddTask() {
    if (!activeOrganization) return;
    setError("");

    if (!title.trim()) {
      setError("O título da tarefa é obrigatório.");
      return;
    }

    setSaving(true);

    const formattedDate = dueDate
      ? new Date(dueDate).toISOString().split("T")[0]
      : null;

    const { error } = await supabase.from("tasks").insert([
      {
        organization_id: activeOrganization.id,
        process_id: processId,
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        due_date: formattedDate,
        status: "Aberta",
      },
    ]);

    if (error) {
      console.error(error);
      setError("Erro ao adicionar tarefa.");
      setSaving(false);
      return;
    }

    setTitle("");
    setDescription("");
    setDueDate("");

    await loadTasks();
    setSaving(false);
  }

  async function updateStatus(task: Task, status: string) {
    if (!activeOrganization) return;
    setError("");

    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", task.id)
      .eq("organization_id", activeOrganization.id);

    if (error) {
      console.error(error);
      setError("Erro ao atualizar tarefa.");
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status } : t))
    );
  }

  async function deleteTask(taskId: string) {
    if (!activeOrganization) return;
    setError("");

    const ok = window.confirm("Deseja excluir esta tarefa?");
    if (!ok) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("organization_id", activeOrganization.id);

    if (error) {
      console.error(error);
      setError("Erro ao excluir tarefa.");
      return;
    }

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg">Tarefas do processo</h2>
          <p className="text-sm text-gray-500">
            Pendentes: <span className="font-medium">{pendingCount}</span>
          </p>
        </div>

        <button
          onClick={loadTasks}
          className="border px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
        >
          Recarregar
        </button>
      </div>

      <div className="grid gap-2">
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Título da tarefa (ex: Emitir licença)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <button
            onClick={handleAddTask}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Adicionando..." : "Adicionar"}
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando tarefas...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">Nenhuma tarefa encontrada.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="border rounded-lg p-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{t.title}</p>
                {t.description && (
                  <p className="text-sm text-gray-600 mt-1 break-words">
                    {t.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Prazo:{" "}
                  {t.due_date
                    ? new Date(t.due_date).toLocaleDateString("pt-BR")
                    : "Sem prazo"}
                </p>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={t.status ?? "Aberta"}
                  onChange={(e) => updateStatus(t, e.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

