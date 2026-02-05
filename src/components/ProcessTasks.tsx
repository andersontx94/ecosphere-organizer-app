import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Task = {
  id: string;
  process_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  done: boolean;
  created_at: string;
};

type Props = {
  processId: string;
};

export default function ProcessTasks({ processId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showDone, setShowDone] = useState(true);

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const pendingCount = useMemo(
    () => tasks.filter((t) => !t.done).length,
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    return tasks.filter((t) => (showDone ? true : !t.done));
  }, [tasks, showDone]);

  async function loadTasks() {
    setError("");
    setLoading(true);

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("process_id", processId)
      .order("done", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
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
  }, [processId]);

  async function handleAddTask() {
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
        process_id: processId,
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        due_date: formattedDate,
        done: false,
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

  async function toggleDone(task: Task) {
    setError("");

    const { error } = await supabase
      .from("tasks")
      .update({ done: !task.done })
      .eq("id", task.id);

    if (error) {
      console.error(error);
      setError("Erro ao atualizar tarefa.");
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
    );
  }

  async function deleteTask(taskId: string) {
    setError("");

    const ok = window.confirm("Deseja excluir esta tarefa?");
    if (!ok) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

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

        <label className="text-sm flex items-center gap-2 select-none">
          <input
            type="checkbox"
            checked={showDone}
            onChange={(e) => setShowDone(e.target.checked)}
          />
          Mostrar concluídas
        </label>
      </div>

      {/* Form */}
      <div className="grid gap-2">
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Título da tarefa (ex: Emitir boleto TCFA)"
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

          <button
            onClick={loadTasks}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Recarregar
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-gray-500">Carregando tarefas...</p>
      ) : visibleTasks.length === 0 ? (
        <p className="text-gray-500">Nenhuma tarefa encontrada.</p>
      ) : (
        <div className="space-y-2">
          {visibleTasks.map((t) => (
            <div
              key={t.id}
              className="border rounded-lg p-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggleDone(t)}
                  />
                  <p
                    className={`font-medium break-words ${
                      t.done ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {t.title}
                  </p>
                </div>

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

              <button
                onClick={() => deleteTask(t.id)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}