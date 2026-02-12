import { useNavigate } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import type { Client } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function Clients() {
  const navigate = useNavigate();
  const { data: clients, isLoading, error } = useClients();
  const safeClients: Client[] = clients ?? [];

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">Carregando clientes...</p>;
  }

  if (error) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : "Erro desconhecido.";
    return (
      <div className="p-6 space-y-2">
        <p className="text-destructive font-medium">Erro ao carregar clientes.</p>
        <p className="text-sm text-destructive/80">Detalhe: {message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Clientes"
        description="Contratantes cadastrados na consultoria."
        action={
          <Button onClick={() => navigate("/clientes/novo")} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        }
      />

      {safeClients.length === 0 ? (
        <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <p className="mt-3 text-foreground font-medium">Nenhum cliente cadastrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre um cliente para organizar processos, faturamento e documentos.
            </p>
            <Button onClick={() => navigate("/clientes/novo")} className="mt-4">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)] overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">CPF/CNPJ</th>
                  <th className="p-3">Cidade/UF</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Criado em</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>

              <tbody>
                {safeClients.map((client: Client, index: number) => {
                  const document = client.cpf_cnpj || "—";
                  const location =
                    [client.city, client.state].filter(Boolean).join(" / ") || "—";
                  const isActive = client.active !== false;

                  return (
                    <tr key={client.id} className={`border-t border-border/60 ${index % 2 === 1 ? "bg-muted/30" : ""}`}>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-foreground">{client.name}</p>
                          {client.trade_name && (
                            <p className="text-xs text-muted-foreground">
                              {client.trade_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <Badge variant="info">{client.type ?? "PJ"}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{document}</td>
                      <td className="p-3 text-muted-foreground">{location}</td>
                      <td className="p-3">
                        <Badge variant={isActive ? "success" : "destructive"}>
                          {isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(client.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/clientes/${client.id}`)}
                          className="text-primary hover:text-primary/80"
                        >
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
