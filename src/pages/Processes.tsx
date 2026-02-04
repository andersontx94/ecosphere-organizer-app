import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/ui/StatusBadge";
import { useProcesses } from "../hooks/useProcesses";

export default function Processes() {
  const navigate = useNavigate();
  const { processes, loading, getComputedStatus } = useProcesses();

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  /**
   * 🔒 Filtro de limpeza (FRONTEND ONLY)
   * Esconde processos de teste ou incompletos
   */
  const visibleProcesses = processes.filter((process) => {
    const number = process.process_number;

    if (!number) return false;

    // contém letras (ex: kkkkk)
    if (/[a-zA-Z]/.test(number)) return false;

    // muito curto (ex: 55555)
    if (number.length < 7) return false;

    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Processos
        </h1>

        <button
          onClick={() => navigate("/processos/novo")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Novo Processo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500">Carregando...</div>
        ) : visibleProcesses.length === 0 ? (
          <div className="p-6 text-gray-500 italic">
            Nenhum processo válido para exibição.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="px-6 py-3">Processo</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Prazo</th>
                <th className="px-6 py-3 text-right">Ação</th>
              </tr>
            </thead>

            <tbody>
              {visibleProcesses.map((process) => {
                const computed = getComputedStatus(process);

                return (
                  <tr
                    key={process.id}
                    onClick={() =>
                      navigate(`/processos/${process.id}`)
                    }
                    className="border-b last:border-none hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">
                        {process.process_number}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={computed.visualStatus}>
                        {computed.label}
                      </StatusBadge>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {process.due_date ? (
                        `📅 ${formatDate(process.due_date)}`
                      ) : (
                        <span className="italic text-gray-400">
                          Sem prazo definido
                        </span>
                      )}
                    </td>

                    <td
                      className="px-6 py-4 text-right text-blue-600 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/processos/${process.id}`);
                      }}
                    >
                      Detalhes →
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}