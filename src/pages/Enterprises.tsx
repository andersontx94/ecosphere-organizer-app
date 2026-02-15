import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

type EnterpriseRow = {
  id: string;
  name: string;
  client_id: string;
  created_at: string;
  city: string | null;
  state: string | null;
  activity: string | null;
  clients?: { name: string | null } | null;
};

export default function Enterprises() {
  const navigate = useNavigate();
  const { activeOrganization } = useOrganization();

  const [enterprises, setEnterprises] = useState<EnterpriseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnterprises();
  }, [activeOrganization]);

  async function fetchEnterprises() {
    if (!activeOrganization) {
      setEnterprises([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("enterprises")
      .select("id, name, client_id, created_at, city, state, activity, clients(name)")
      .eq("organization_id", activeOrganization.id)
      .order("name");

    if (error) {
      setError(error.message);
      setEnterprises([]);
    } else {
      setEnterprises((data as EnterpriseRow[]) || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <p className="p-4 text-muted-foreground md:p-6">
        Carregando empreendimentos...
      </p>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-destructive font-medium">Erro ao carregar empreendimentos.</p>
        <p className="text-sm text-destructive/80">Detalhe: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageHeader
        title="Empreendimentos"
        description="Unidades e empresas vinculadas aos clientes."
        action={
          <Button onClick={() => navigate("/empresas/nova")} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo empreendimento
          </Button>
        }
      />

      {enterprises.length === 0 ? (
        <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="text-foreground font-medium">Nenhum empreendimento cadastrado</p>
            <p className="text-sm text-muted-foreground">
              Cadastre o primeiro empreendimento para vincular processos.
            </p>
            <Button onClick={() => navigate("/empresas/nova")}>
              <Plus className="h-4 w-4" />
              Criar empreendimento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Empreendimento</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Cidade/UF</th>
                <th className="text-left px-4 py-3">Atividade</th>
                <th className="text-left px-4 py-3">Criado em</th>
                <th className="text-right px-4 py-3">Ação</th>
              </tr>
            </thead>

            <tbody>
              {enterprises.map((enterprise, index) => (
                <tr key={enterprise.id} className={`border-t border-border/60 ${index % 2 === 1 ? "bg-muted/30" : ""}`}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {enterprise.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {enterprise.clients?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[enterprise.city, enterprise.state].filter(Boolean).join(" / ") ||
                      "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {enterprise.activity ? <Badge variant="secondary">{enterprise.activity}</Badge> : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(enterprise.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/empresas/${enterprise.id}`)}
                      className="text-primary hover:text-primary/80"
                    >
                      Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
