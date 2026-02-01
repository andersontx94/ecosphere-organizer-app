import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/ui/StatusBadge";

const processes = [
  {
    id: "1",
    numero: "52564255",
    status: "em andamento",
    prazo: "2027-03-12",
  },
  {
    id: "2",
    numero: "-",
    status: "concluido",
    prazo: "2026-03-12",
  },
  {
    id: "3",
    numero: "-",
    status: "em andamento",
    prazo: "-",
  },
];

export default function Processes() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Processos</h1>

        <button
          onClick={() => navigate("/processos/novo")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Novo Processo
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="px-6 py-3">Nº do Processo</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Prazo</th>
            <th className="px-6 py-3 text-right">Ações</th>
          </tr>
        </thead>

        <tbody>
          {processes.map((process) => (
            <tr key={process.id} className="border-b">
              <td className="px-6 py-4">{process.numero}</td>

              <td className="px-6 py-4">
                <StatusBadge status={process.status} />
              </td>

              <td className="px-6 py-4 text-gray-600">
                {process.prazo !== "-" ? process.prazo : "-"}
              </td>

              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => navigate(`/processos/${process.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}