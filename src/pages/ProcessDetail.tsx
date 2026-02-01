import { useParams, useNavigate } from "react-router-dom";

export default function ProcessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 mb-4 hover:underline"
      >
        ← Voltar
      </button>

      <h1 className="text-2xl font-semibold mb-4">
        Detalhe do Processo
      </h1>

      <div className="bg-white p-4 rounded shadow">
        <p>
          <strong>ID do Processo:</strong> {id}
        </p>

        <p className="text-gray-600 mt-2">
          Aqui depois você liga com Supabase / API.
        </p>
      </div>
    </div>
  );
}