import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function OnboardingOrganization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    organizations,
    loading: orgLoading,
    setActiveOrganization,
    reloadOrganizations,
  } = useOrganization();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgLoading && organizations.length > 0) {
      navigate("/dashboard", { replace: true });
    }
  }, [orgLoading, organizations.length, navigate]);

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <p className="text-sm text-gray-500">Carregando organização...</p>
      </div>
    );
  }

  if (!orgLoading && organizations.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleCreateOrganization(e: React.FormEvent) {
    e.preventDefault();
    if (!user || saving) return;

    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Informe o nome da organização.");
      return;
    }

    setSaving(true);

    const { data: existing, error: existingError } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .ilike("name", trimmedName)
      .maybeSingle();

    if (existingError) {
      console.error("Failed to check existing organization:", existingError);
    }

    if (existing?.id) {
      await setActiveOrganization(existing.id);
      await reloadOrganizations();
      setSaving(false);
      navigate("/dashboard", { replace: true });
      return;
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert([
        {
          name: trimmedName,
          slug: slugify(trimmedName),
          created_by: user.id,
          owner_id: user.id,
        },
      ])
      .select("id")
      .single();

    if (orgError || !org) {
      console.error("Failed to create organization:", orgError);
      setError(orgError?.message ?? "Erro ao criar organização.");
      setSaving(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("organization_members")
      .insert([
        {
          organization_id: org.id,
          user_id: user.id,
          role: "owner",
        },
      ]);

    if (memberError) {
      console.error("Failed to create organization member:", memberError);
      setError(memberError.message);
      setSaving(false);
      return;
    }

    await setActiveOrganization(org.id);
    await reloadOrganizations();

    setSaving(false);
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 rounded-2xl border bg-white/70 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-green-600">
            Primeiro acesso
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900">
            Crie sua organização
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Vamos preparar o seu espaço de trabalho para clientes, processos e finanças.
          </p>
          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <span>Escolha um nome que sua equipe reconheça.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <span>Você poderá adicionar outras pessoas depois.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <span>A organização fica vinculada à sua conta.</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Detalhes básicos</h2>
              <p className="text-sm text-gray-500">Você pode editar isso depois.</p>
            </div>
          </div>

          <form onSubmit={handleCreateOrganization} className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nome da organização
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                placeholder="Ex: EcoSphere Consultoria"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {saving ? "Criando..." : "Criar organização"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
