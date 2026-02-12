import { useNavigate, useLocation } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function SelectOrganization() {
  const navigate = useNavigate();
  const location = useLocation();
  const { organizations, activeOrganizationId, setActiveOrganization, loading } =
    useOrganization();

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  async function handleSelect(orgId: string) {
    await setActiveOrganization(orgId);
    navigate(from, { replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <p className="text-sm text-gray-500">Carregando organização...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm space-y-5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-green-600">
            Múltiplas organizações
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Selecione a organização
          </h1>
          <p className="text-sm text-gray-500">
            Escolha a organização que deseja acessar agora.
          </p>
        </div>

        <div className="grid gap-3">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelect(org.id)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition hover:bg-green-50/60 ${
                activeOrganizationId === org.id ? "border-green-500" : "border-gray-200"
              }`}
            >
              <div>
                <p className="font-medium text-gray-900">{org.name}</p>
                {org.slug && (
                  <p className="text-xs text-gray-500">{org.slug}</p>
                )}
              </div>
              <span className="text-xs text-green-600">Acessar</span>
            </button>
          ))}
          <button
            onClick={() => navigate("/onboarding/organizacao")}
            className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-green-500 hover:text-green-700"
          >
            <span>+ Criar nova organização</span>
            <span className="text-xs text-gray-400">Novo</span>
          </button>
        </div>
      </div>
    </div>
  );
}

