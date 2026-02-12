import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

type Service = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  default_price: number | null;
  unit: string | null;
  active: boolean | null;
  created_at: string;
};

export default function Services() {
  const navigate = useNavigate();
  const { activeOrganization } = useOrganization();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [activeOrganization]);

  async function fetchServices() {
    if (!activeOrganization) {
      setServices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("services")
      .select("id, name, category, description, default_price, unit, active, created_at")
      .eq("organization_id", activeOrganization.id)
      .order("name");

    if (error) {
      setError(error.message);
      setServices([]);
    } else {
      setServices((data as Service[]) || []);
    }

    setLoading(false);
  }

  if (loading) {
    return <p className="p-6 text-muted-foreground">Carregando serviços...</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive font-medium">Erro ao carregar serviços.</p>
        <p className="text-sm text-destructive/80">Detalhe: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Serviços"
        description="Catálogo de serviços oferecidos pela consultoria."
        action={
          <Button onClick={() => navigate("/servicos/novo")}>
            <Plus className="h-4 w-4" />
            Novo serviço
          </Button>
        }
      />

      {services.length === 0 ? (
        <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <p className="text-foreground font-medium">Nenhum serviço cadastrado</p>
            <p className="text-sm text-muted-foreground">
              Cadastre serviços para padronizar propostas e faturamento.
            </p>
            <Button onClick={() => navigate("/servicos/novo")}>
              <Plus className="h-4 w-4" />
              Criar serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Serviço</th>
                <th className="text-left px-4 py-3">Categoria</th>
                <th className="text-left px-4 py-3">Preço padrão</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Ação</th>
              </tr>
            </thead>

            <tbody>
              {services.map((service, index) => (
                <tr key={service.id} className={`border-t border-border/60 ${index % 2 === 1 ? "bg-muted/30" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{service.name}</p>
                    {service.description && (
                      <p className="text-xs text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {service.category ? <Badge variant="info">{service.category}</Badge> : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {service.default_price !== null
                      ? new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(service.default_price)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={service.active ? "success" : "destructive"}
                    >
                      {service.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/servicos/${service.id}`)}
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
