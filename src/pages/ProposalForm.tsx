import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { convertProposalToClient } from "@/lib/proposals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/layout/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ProposalRow = {
  id: string;
  organization_id: string;
  status: string;
  title: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  cpf_cnpj: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  total_amount: number | null;
  converted_client_id: string | null;
  converted_enterprise_id: string | null;
};

type ProposalItem = {
  id?: string;
  service_id: string | null;
  name: string;
  description: string;
  quantity: string;
  unit_price: string;
};

type ServiceOption = {
  id: string;
  name: string;
  default_price: number | null;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Rascunho" },
  { value: "sent", label: "Enviada" },
  { value: "negotiation", label: "Em negociação" },
  { value: "lost", label: "Perdida" },
  { value: "canceled", label: "Cancelada" },
];

export default function ProposalForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeOrganization } = useOrganization();
  const { user } = useAuth();
  const { data: processTypes = [] } = useProcessTypes();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [proposal, setProposal] = useState<ProposalRow>({
    id: "",
    organization_id: "",
    status: "draft",
    title: "",
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    cpf_cnpj: "",
    city: "",
    state: "",
    notes: "",
    total_amount: 0,
    converted_client_id: null,
    converted_enterprise_id: null,
  });

  const [items, setItems] = useState<ProposalItem[]>([
    {
      service_id: null,
      name: "",
      description: "",
      quantity: "1",
      unit_price: "0",
    },
  ]);

  const [convertOpen, setConvertOpen] = useState(false);
  const [createInvoice, setCreateInvoice] = useState(false);
  const [createProcess, setCreateProcess] = useState(false);
  const [processTypeId, setProcessTypeId] = useState("");
  const [processAgency, setProcessAgency] = useState("");

  useEffect(() => {
    async function loadServices() {
      if (!activeOrganization) {
        setServices([]);
        return;
      }
      const { data, error } = await supabase
        .from("services")
        .select("id, name, default_price")
        .eq("organization_id", activeOrganization.id)
        .eq("active", true)
        .order("name");
      if (error) {
        console.error("Erro ao carregar serviÃ§os:", error);
        setServicesError(error.message);
        setServices([]);
        return;
      }
      setServices((data as ServiceOption[]) ?? []);
    }

    loadServices();
  }, [activeOrganization]);

  useEffect(() => {
    async function loadProposal() {
      if (!activeOrganization) {
        setLoading(false);
        return;
      }

      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("proposals")
        .select(
          "id, organization_id, status, title, company_name, contact_name, contact_email, contact_phone, cpf_cnpj, city, state, notes, total_amount, converted_client_id, converted_enterprise_id"
        )
        .eq("id", id)
        .eq("organization_id", activeOrganization.id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setProposal(data as ProposalRow);

      const { data: itemsData, error: itemsError } = await supabase
        .from("proposal_items")
        .select("id, service_id, name, description, quantity, unit_price")
        .eq("proposal_id", id)
        .eq("organization_id", activeOrganization.id);

      if (itemsError) {
        setError(itemsError.message);
      } else if (itemsData && itemsData.length > 0) {
        setItems(
          (itemsData as ProposalItem[]).map((item) => ({
            id: item.id,
            service_id: item.service_id,
            name: item.name ?? "",
            description: item.description ?? "",
            quantity: String(item.quantity ?? 1),
            unit_price: String(item.unit_price ?? 0),
          }))
        );
      }

      setLoading(false);
    }

    loadProposal();
  }, [activeOrganization, id]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);
  }, [items]);

  function updateItem(index: number, changes: Partial<ProposalItem>) {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...changes } : item)));
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { service_id: null, name: "", description: "", quantity: "1", unit_price: "0" },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSave(nextStatus?: string) {
    if (!activeOrganization || !user) return;
    setError(null);

    if (!proposal.title.trim()) {
      setError("Informe o título da proposta.");
      return;
    }

    if (!proposal.company_name.trim()) {
      setError("Informe a empresa da proposta.");
      return;
    }

    if (items.length === 0) {
      setError("Adicione ao menos um item.");
      return;
    }

    if (items.some((item) => !item.name.trim())) {
      setError("Preencha o nome dos itens.");
      return;
    }

    setSaving(true);

    const payloadBase = {
      organization_id: activeOrganization.id,
      status: nextStatus ?? proposal.status,
      title: proposal.title.trim(),
      company_name: proposal.company_name.trim(),
      contact_name: proposal.contact_name?.trim() || null,
      contact_email: proposal.contact_email?.trim() || null,
      contact_phone: proposal.contact_phone?.trim() || null,
      cpf_cnpj: proposal.cpf_cnpj?.trim() || null,
      city: proposal.city?.trim() || null,
      state: proposal.state?.trim() || null,
      notes: proposal.notes?.trim() || null,
      total_amount: totalAmount,
    };

    try {
      let proposalId = proposal.id;

      if (!proposalId) {
        const payload = {
          ...payloadBase,
          created_by: user.id,
        };
        const { data, error } = await supabase
          .from("proposals")
          .insert(payload)
          .select("id")
          .single();

        if (error || !data) {
          console.error("Proposals insert error:", error);
          throw error ?? new Error("Falha ao criar proposta.");
        }
        proposalId = data.id;
        setProposal((prev) => ({ ...prev, id: proposalId, ...payloadBase }));
      } else {
        const { error } = await supabase
          .from("proposals")
          .update(payloadBase)
          .eq("id", proposalId)
          .eq("organization_id", activeOrganization.id);
        if (error) {
          console.error("Proposals update error:", error);
          throw error;
        }
        setProposal((prev) => ({ ...prev, ...payloadBase }));
      }

      const { error: deleteError } = await supabase
        .from("proposal_items")
        .delete()
        .eq("proposal_id", proposalId)
        .eq("organization_id", activeOrganization.id);
      if (deleteError) {
        console.error("Proposal items delete error:", deleteError);
        throw deleteError;
      }

      const itemsPayload = items.map((item) => ({
        proposal_id: proposalId,
        organization_id: activeOrganization.id,
        service_id: item.service_id || null,
        name: item.name.trim(),
        description: item.description.trim() || null,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
      }));

      const { error: itemsError } = await supabase
        .from("proposal_items")
        .insert(itemsPayload);

      if (itemsError) {
        console.error("Proposal items insert error:", itemsError);
        throw itemsError;
      }

      toast.success("Proposta salva com sucesso.");
      if (!id) navigate(`/propostas/${proposalId}`);
    } catch (err) {
      console.error("Erro ao salvar proposta:", err);
      const message =
        err instanceof Error ? err.message : "Erro ao salvar proposta.";
      const details =
        typeof err === "object" && err && "details" in err
          ? (err as { details?: string }).details
          : undefined;
      const hint =
        typeof err === "object" && err && "hint" in err
          ? (err as { hint?: string }).hint
          : undefined;
      const fullMessage = [message, details, hint].filter(Boolean).join(" - ");
      setError(message);
      toast.error(fullMessage || message);
    } finally {
      setSaving(false);
    }
  }

  async function handleConvert() {
    if (!proposal.id) {
      setError("Salve a proposta antes de converter.");
      return;
    }

    if (createProcess && !processTypeId) {
      setError("Selecione um tipo de processo.");
      return;
    }

    try {
      setSaving(true);
      const result = await convertProposalToClient(proposal.id, {
        create_invoice: createInvoice,
        create_process: createProcess,
        process_type_id: processTypeId || undefined,
        agency: processAgency || undefined,
      });

      setProposal((prev) => ({
        ...prev,
        status: "won",
        converted_client_id: result.client_id,
        converted_enterprise_id: result.enterprise_id,
      }));

      toast.success("Proposta convertida com sucesso.");
      setConvertOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao converter proposta.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-4 text-muted-foreground md:p-6">Carregando proposta...</p>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={proposal.id ? "Editar Proposta" : "Nova Proposta"}
        description="Estruture serviços e valores para converter em cliente."
        action={
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            {proposal.status !== "won" && (
              <Button
                variant="outline"
                onClick={() => handleSave("sent")}
                disabled={saving}
                className="w-full md:w-auto"
              >
                Marcar como enviada
              </Button>
            )}
            {proposal.status !== "won" && (
              <Button
                onClick={() => setConvertOpen(true)}
                disabled={saving}
                className="w-full md:w-auto"
              >
                Marcar como ganha
              </Button>
            )}
          </div>
        }
      />

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base">Dados da proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Título *</label>
              <Input
                value={proposal.title}
                onChange={(e) => setProposal((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Proposta PGRS - TX HOPE"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Empresa *</label>
              <Input
                value={proposal.company_name}
                onChange={(e) => setProposal((prev) => ({ ...prev, company_name: e.target.value }))}
                placeholder="Nome da empresa"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">CNPJ/CPF</label>
              <Input
                value={proposal.cpf_cnpj ?? ""}
                onChange={(e) => setProposal((prev) => ({ ...prev, cpf_cnpj: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Contato</label>
              <Input
                value={proposal.contact_name ?? ""}
                onChange={(e) => setProposal((prev) => ({ ...prev, contact_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Telefone</label>
              <Input
                value={proposal.contact_phone ?? ""}
                onChange={(e) => setProposal((prev) => ({ ...prev, contact_phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">E-mail</label>
              <Input
                value={proposal.contact_email ?? ""}
                onChange={(e) => setProposal((prev) => ({ ...prev, contact_email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Cidade</label>
              <Input
                value={proposal.city ?? ""}
                onChange={(e) => setProposal((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">UF</label>
              <Input
                value={proposal.state ?? ""}
                onChange={(e) => setProposal((prev) => ({ ...prev, state: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Observações</label>
            <textarea
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              value={proposal.notes ?? ""}
              onChange={(e) => setProposal((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Status</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={proposal.status}
                onChange={(e) => setProposal((prev) => ({ ...prev, status: e.target.value }))}
                disabled={proposal.status === "won"}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                {proposal.status === "won" && (
                  <option value="won">Ganha</option>
                )}
              </select>
            </div>
            <div className="flex items-center gap-2">
              {proposal.status === "won" ? (
                <Badge variant="success">Convertida</Badge>
              ) : (
                <Badge variant="secondary">Pré-venda</Badge>
              )}
            </div>
          </div>

          {proposal.status === "won" && (
            <div className="flex flex-wrap gap-2">
              {proposal.converted_client_id && (
                <Button variant="outline" asChild>
                  <Link to={`/clientes/${proposal.converted_client_id}`}>Abrir cliente</Link>
                </Button>
              )}
              {proposal.converted_enterprise_id && (
                <Button variant="outline" asChild>
                  <Link to={`/empresas/${proposal.converted_enterprise_id}`}>Abrir empreendimento</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Itens da proposta</CardTitle>
          <Button variant="outline" onClick={addItem} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Adicionar item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.length === 0 && (
            <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
              Nenhum serviÃ§o cadastrado. Cadastre em{" "}
              <Link to="/servicos/novo" className="text-primary underline">
                ServiÃ§os
              </Link>
              .
              {servicesError && (
                <p className="mt-2 text-xs text-destructive">
                  {servicesError}
                </p>
              )}
            </div>
          )}
          {items.map((item, index) => {
            const total =
              (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
            return (
              <div
                key={index}
                className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Serviço</label>
                    <select
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      value={item.service_id ?? ""}
                      onChange={(e) => {
                        const value = e.target.value || null;
                        const selected = services.find((svc) => svc.id === value);
                        updateItem(index, {
                          service_id: value,
                          name: selected?.name ?? item.name,
                          unit_price:
                            selected?.default_price != null
                              ? String(selected.default_price)
                              : item.unit_price,
                        });
                      }}
                    >
                      <option value="">Selecionar (opcional)</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-muted-foreground mb-1">Nome do item *</label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      placeholder="Ex: PGRS completo"
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <Button
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Descrição</label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    placeholder="Detalhes adicionais"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Quantidade</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Valor unitário</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, { unit_price: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-end justify-between text-sm text-muted-foreground">
                    <span>Total do item</span>
                    <span className="font-medium text-foreground">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total da proposta</span>
            <span className="text-base font-semibold text-foreground">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2 md:flex-row">
        <Button onClick={() => handleSave()} disabled={saving} className="w-full md:w-auto">
          {saving ? "Salvando..." : "Salvar proposta"}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/propostas")}
          className="w-full md:w-auto"
        >
          Voltar
        </Button>
      </div>

      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Concluir como ganha</DialogTitle>
            <DialogDescription>
              Ao concluir, vamos converter a proposta em cliente e empreendimento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
              <span>Criar fatura inicial com esses itens</span>
              <input
                type="checkbox"
                checked={createInvoice}
                onChange={(e) => setCreateInvoice(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
              <span>Criar processo inicial</span>
              <input
                type="checkbox"
                checked={createProcess}
                onChange={(e) => setCreateProcess(e.target.checked)}
              />
            </label>
            {createProcess && (
              <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">Tipo de processo</label>
                <select
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={processTypeId}
                  onChange={(e) => setProcessTypeId(e.target.value)}
                >
                  <option value="">Selecione um tipo</option>
                  {processTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <label className="block text-sm text-muted-foreground">Órgão</label>
                <Input
                  value={processAgency}
                  onChange={(e) => setProcessAgency(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setConvertOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button onClick={handleConvert} disabled={saving} className="w-full sm:w-auto">
              {saving ? "Convertendo..." : "Concluir proposta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
