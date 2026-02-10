import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";

type EnterpriseOption = {
  id: string;
  name: string;
  client_id: string;
  clients?: { name: string | null } | null;
};

type ServiceOption = { id: string; name: string; default_price: number | null };

const STATUS_OPTIONS = [
  { value: "Em andamento", label: "Em andamento" },
  { value: "Pendente", label: "Pendente" },
  { value: "Concluído", label: "Concluído" },
  { value: "Suspenso", label: "Suspenso" },
  { value: "Cancelado", label: "Cancelado" },
];

export default function NewProcess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();
  const [searchParams] = useSearchParams();
  const { data: processTypes = [], isLoading: processTypesLoading } =
    useProcessTypes();

  const [enterprises, setEnterprises] = useState<EnterpriseOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);

  const [enterpriseId, setEnterpriseId] = useState<string>(
    searchParams.get("enterprise_id") ?? ""
  );
  const [clientId, setClientId] = useState<string>("");
  const [processNumber, setProcessNumber] = useState("");
  const [processTypeId, setProcessTypeId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [agency, setAgency] = useState("");
  const [status, setStatus] = useState("Em andamento");
  const [protocolDate, setProtocolDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Normal");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      if (!activeOrganization) {
        setEnterprises([]);
        return;
      }
      const [{ data: enterprises }, { data: services }] = await Promise.all([
        supabase
          .from("enterprises")
          .select("id, name, client_id, clients(name)")
          .eq("organization_id", activeOrganization.id)
          .order("name"),
        supabase
          .from("services")
          .select("id, name, default_price")
          .eq("organization_id", activeOrganization.id)
          .eq("active", true)
          .order("name"),
      ]);

      setEnterprises((enterprises as EnterpriseOption[]) || []);
      setServices((services as ServiceOption[]) || []);
    }

    loadInitialData();
  }, [activeOrganization]);

  useEffect(() => {
    const selected = enterprises.find((e) => e.id === enterpriseId);
    setClientId(selected?.client_id ?? "");
  }, [enterpriseId, enterprises]);

  const selectedClientName = useMemo(() => {
    const selected = enterprises.find((e) => e.id === enterpriseId);
    return selected?.clients?.name ?? "";
  }, [enterpriseId, enterprises]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user || !activeOrganization) {
        setError("Faça login para salvar o processo.");
        return;
      }

      if (!enterpriseId) {
        setError("Selecione um empreendimento.");
        return;
      }

      if (!processTypeId) {
        setError("Selecione o tipo de processo.");
        return;
      }

      if (!agency.trim()) {
        setError("Informe o órgão responsável.");
        return;
      }

      const selectedProcessType = processTypes.find(
        (type) => type.id === processTypeId
      );

      if (!selectedProcessType) {
        setError("Tipo de processo inválido.");
        return;
      }

      const formattedProtocolDate = protocolDate
        ? new Date(protocolDate).toISOString().split("T")[0]
        : null;
      const formattedDueDate = dueDate
        ? new Date(dueDate).toISOString().split("T")[0]
        : null;

      const { data: process, error } = await supabase
        .from("environmental_processes")
        .insert([
          {
            user_id: user.id,
            organization_id: activeOrganization.id,
            enterprise_id: enterpriseId,
            client_id: clientId || null,
            process_number: processNumber.trim() || null,
            process_type_id: processTypeId,
            process_type: selectedProcessType.name,
            service_id: serviceId || null,
            agency: agency.trim(),
            status,
            protocol_date: formattedProtocolDate,
            due_date: formattedDueDate,
            notes: description.trim() || null,
            risk_status: priority,
          },
        ])
        .select("id")
        .single();

      if (error || !process) throw error ?? new Error("Falha ao criar processo.");

      if (serviceId) {
        const selectedService = services.find((svc) => svc.id === serviceId);
        const { error: linkError } = await supabase
          .from("process_services")
          .insert([
            {
              organization_id: activeOrganization.id,
              process_id: process.id,
              service_id: serviceId,
              qty: 1,
              unit_price: selectedService?.default_price ?? null,
            },
          ]);

        if (linkError) {
          console.error("Falha ao vincular serviço ao processo:", linkError);
          setError(
            "Processo criado, mas não foi possível vincular o serviço. Você pode ajustar no detalhe do processo."
          );
          return;
        }
      }

      navigate("/processos");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar o processo.";
      console.error(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Novo Processo"
        description="Abra processos ambientais com informações essenciais e prazos."
      />

      <Card className="max-w-3xl border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Informações do processo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Empreendimento *
            </label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              value={enterpriseId}
              onChange={(e) => setEnterpriseId(e.target.value)}
            >
              <option value="">Selecione um empreendimento</option>
              {enterprises.map((enterprise) => (
                <option key={enterprise.id} value={enterprise.id}>
                  {enterprise.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Cliente</label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 bg-muted/40"
              value={selectedClientName || "—"}
              readOnly
            />
            <p className="text-xs text-muted-foreground mt-1">
              Vinculado automaticamente ao empreendimento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Tipo de processo *
            </label>
            {processTypesLoading ? (
              <div className="w-full rounded-lg border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Carregando tipos de processo...
              </div>
            ) : processTypes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground space-y-2">
                <p>Nenhum tipo cadastrado. Cadastre um tipo de processo primeiro.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/processos/tipos")}
                >
                  Criar tipo de processo
                </Button>
              </div>
            ) : (
              <select
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                value={processTypeId}
                onChange={(e) => setProcessTypeId(e.target.value)}
              >
                <option value="">Selecione o tipo de processo</option>
                {processTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                    {type.category ? ` • ${type.category}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Serviço</label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              <option value="">Selecione um serviço (opcional)</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Número do processo
            </label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              value={processNumber}
              onChange={(e) => setProcessNumber(e.target.value)}
              placeholder="Ex: 02001.000123/2025-11"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Órgão</label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              placeholder="SEMA / IBAMA / Prefeitura"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Status</label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Prioridade</label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Baixa">Baixa</option>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Data de protocolo
            </label>
            <input
              type="date"
              className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              value={protocolDate}
              onChange={(e) => setProtocolDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Vencimento
            </label>
            <input
              type="date"
              className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Descrição</label>
          <textarea
            className="w-full border border-border rounded-lg px-3 py-2 bg-background"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Salvar Processo"}
        </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
