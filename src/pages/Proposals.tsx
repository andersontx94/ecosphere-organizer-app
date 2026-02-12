import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/layout/PageHeader";
import { FileText, Plus, Search } from "lucide-react";

type ProposalRow = {
  id: string;
  title: string;
  company_name: string;
  status: string;
  total_amount: number | null;
  updated_at: string;
  converted_client_id: string | null;
  converted_enterprise_id: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  negotiation: "Em negociação",
  won: "Ganha",
  lost: "Perdida",
  canceled: "Cancelada",
};

function statusVariant(status: string) {
  if (status === "won") return "success";
  if (status === "sent") return "info";
  if (status === "negotiation") return "warning";
  if (status === "lost" || status === "canceled") return "destructive";
  return "secondary";
}

function formatCurrency(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function Proposals() {
  const navigate = useNavigate();
  const { activeOrganization } = useOrganization();

  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      if (!activeOrganization) {
        setProposals([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("proposals")
        .select(
          "id, title, company_name, status, total_amount, updated_at, converted_client_id, converted_enterprise_id"
        )
        .eq("organization_id", activeOrganization.id)
        .order("updated_at", { ascending: false });

      if (error) {
        setError(error.message);
        setProposals([]);
      } else {
        setProposals((data as ProposalRow[]) ?? []);
      }

      setLoading(false);
    }

    load();
  }, [activeOrganization]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return proposals.filter((proposal) => {
      const matchesTerm =
        !term ||
        proposal.title.toLowerCase().includes(term) ||
        proposal.company_name.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "all" || proposal.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [proposals, search, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Propostas"
        description="Pré-vendas e conversão automática para clientes e empreendimentos."
        action={
          <Button onClick={() => navigate("/propostas/nova")}>
            <Plus className="h-4 w-4" />
            Nova proposta
          </Button>
        }
      />

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Buscar</label>
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Empresa ou título"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Status</label>
            <select
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="sent">Enviada</option>
              <option value="negotiation">Em negociação</option>
              <option value="won">Ganha</option>
              <option value="lost">Perdida</option>
              <option value="canceled">Cancelada</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-muted-foreground">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nenhuma proposta encontrada.
              </p>
              <Button onClick={() => navigate("/propostas/nova")}>
                <Plus className="h-4 w-4" />
                Criar proposta
              </Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/60 border-b border-border/60">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Proposta</th>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Atualizada</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((proposal, index) => (
                  <tr
                    key={proposal.id}
                    className={`border-b border-border/60 ${index % 2 === 1 ? "bg-muted/30" : ""}`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {proposal.title}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {proposal.company_name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(proposal.status)}>
                        {STATUS_LABELS[proposal.status] ?? proposal.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatCurrency(proposal.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(proposal.updated_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        className="text-primary hover:text-primary/80"
                        onClick={() => navigate(`/propostas/${proposal.id}`)}
                      >
                        Detalhes
                      </Button>
                      {proposal.status === "won" && proposal.converted_client_id && (
                        <Button variant="ghost" asChild>
                          <Link to={`/clientes/${proposal.converted_client_id}`}>
                            Abrir cliente
                          </Link>
                        </Button>
                      )}
                      {proposal.status === "won" && proposal.converted_enterprise_id && (
                        <Button variant="ghost" asChild>
                          <Link to={`/empresas/${proposal.converted_enterprise_id}`}>
                            Abrir empreendimento
                          </Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
