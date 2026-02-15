import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";
import { FileText, Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

type ClientOption = {
  id: string;
  name: string | null;
};

type EnterpriseOption = {
  id: string;
  name: string | null;
  client_id: string | null;
};

type ProcessOption = {
  id: string;
  process_number: string | null;
  process_type: string | null;
  enterprise_id: string | null;
  client_id: string | null;
};

type InvoiceRow = {
  id: string;
  number: string | null;
  status: string | null;
  issue_date: string | null;
  due_date: string | null;
  total: number | null;
  client_id: string;
  enterprise_id: string | null;
  process_id: string | null;
  clients?: { name: string | null } | null;
  enterprises?: { name: string | null } | null;
  environmental_processes?: {
    process_number: string | null;
    process_type: string | null;
  } | null;
};

type InvoiceItemInput = {
  description: string;
  qty: string;
  unit_price: string;
};

type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  qty: number;
  unit_price: number;
  total: number;
};

type Payment = {
  id: string;
  invoice_id: string;
  paid_at: string | null;
  amount: number;
  method: string | null;
  notes: string | null;
};

function statusVariant(status: string | null) {
  if (status === "Pago") return "success";
  if (status === "Parcial") return "info";
  if (status === "Cancelado") return "destructive";
  if (status === "Enviado") return "warning";
  return "secondary";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseNumber(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function Financial() {
  const { activeOrganization, loading: orgLoading } = useOrganization();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [enterprises, setEnterprises] = useState<EnterpriseOption[]>([]);
  const [processes, setProcesses] = useState<ProcessOption[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [enterpriseId, setEnterpriseId] = useState("");
  const [processId, setProcessId] = useState("");
  const [number, setNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItemInput[]>([
    { description: "", qty: "1", unit_price: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemsMap, setItemsMap] = useState<Record<string, InvoiceItem[]>>({});
  const [paymentsMap, setPaymentsMap] = useState<Record<string, Payment[]>>({});
  const [paymentForms, setPaymentForms] = useState<Record<string, { amount: string; paid_at: string; method: string; notes: string }>>({});

  useEffect(() => {
    async function loadOptions() {
      if (!activeOrganization) {
        setClients([]);
        setEnterprises([]);
        setProcesses([]);
        return;
      }
      const [clientsRes, enterprisesRes, processesRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name")
          .eq("organization_id", activeOrganization.id)
          .order("name"),
        supabase
          .from("enterprises")
          .select("id, name, client_id")
          .eq("organization_id", activeOrganization.id)
          .order("name"),
        supabase
          .from("environmental_processes")
          .select("id, process_number, process_type, enterprise_id, client_id")
          .eq("organization_id", activeOrganization.id)
          .order("created_at", { ascending: false }),
      ]);

      if (clientsRes.error) {
        console.error("Failed to load clients (financial):", clientsRes.error);
      } else {
        setClients((clientsRes.data as ClientOption[]) ?? []);
      }
      if (enterprisesRes.error) {
        console.error("Failed to load enterprises (financial):", enterprisesRes.error);
      } else {
        setEnterprises((enterprisesRes.data as EnterpriseOption[]) ?? []);
      }
      if (processesRes.error) {
        console.error("Failed to load processes (financial):", processesRes.error);
      } else {
        setProcesses((processesRes.data as ProcessOption[]) ?? []);
      }
    }

    loadOptions();
  }, [activeOrganization]);

  async function loadInvoices() {
    if (!activeOrganization) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("invoices")
      .select(
        "id, number, status, issue_date, due_date, total, client_id, enterprise_id, process_id, clients(name), enterprises(name), environmental_processes(process_number, process_type)"
      )
      .eq("organization_id", activeOrganization.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load invoices:", error);
      setError(error.message);
      setInvoices([]);
    } else {
      setInvoices((data as InvoiceRow[]) ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!activeOrganization) {
      setInvoices([]);
      setLoading(false);
      return;
    }
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrganization]);

  const filteredEnterprises = useMemo(() => {
    if (!clientId) return enterprises;
    return enterprises.filter((ent) => ent.client_id === clientId);
  }, [enterprises, clientId]);

  const filteredProcesses = useMemo(() => {
    if (!enterpriseId) return processes.filter((proc) => proc.client_id === clientId || !clientId);
    return processes.filter((proc) => proc.enterprise_id === enterpriseId);
  }, [processes, enterpriseId, clientId]);

  const totalValue = useMemo(() => {
    return items.reduce((acc, item) => {
      const qty = parseNumber(item.qty);
      const price = parseNumber(item.unit_price);
      return acc + qty * price;
    }, 0);
  }, [items]);

  function updateItem(index: number, field: keyof InvoiceItemInput, value: string) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", qty: "1", unit_price: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function importProcessServices() {
    if (!activeOrganization || !processId) {
      setError("Selecione um processo para importar os serviços.");
      return;
    }

    const { data, error } = await supabase
      .from("process_services")
      .select("qty, unit_price, services(name)")
      .eq("organization_id", activeOrganization.id)
      .eq("process_id", processId);

    if (error) {
      console.error("Failed to import process services:", error);
      setError(error.message);
      return;
    }

    const mapped = (data || []).map((row) => ({
      description: row.services?.name ?? "Serviço",
      qty: String(row.qty ?? 1),
      unit_price: String(row.unit_price ?? 0),
    }));

    setItems(mapped.length > 0 ? mapped : [{ description: "", qty: "1", unit_price: "" }]);
  }

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrganization) return;
    setError(null);

    if (!clientId) {
      setError("Selecione o cliente da fatura.");
      return;
    }

    const sanitizedItems = items
      .map((item) => ({
        description: item.description.trim(),
        qty: parseNumber(item.qty),
        unit_price: parseNumber(item.unit_price),
      }))
      .filter((item) => item.description && item.qty > 0);

    if (sanitizedItems.length === 0) {
      setError("Adicione pelo menos um item com descrição e quantidade válida.");
      return;
    }

    setSaving(true);

    const total = sanitizedItems.reduce((acc, item) => acc + item.qty * item.unit_price, 0);

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert([
        {
          organization_id: activeOrganization.id,
          client_id: clientId,
          enterprise_id: enterpriseId || null,
          process_id: processId || null,
          number: number.trim() || null,
          issue_date: issueDate || null,
          due_date: dueDate || null,
          notes: notes.trim() || null,
          total,
          status: "Rascunho",
        },
      ])
      .select("id")
      .single();

    if (invoiceError || !invoice) {
      if (invoiceError) {
        console.error("Failed to create invoice:", invoiceError);
      }
      setError(invoiceError?.message ?? "Erro ao criar fatura.");
      setSaving(false);
      return;
    }

    const itemsPayload = sanitizedItems.map((item) => ({
      organization_id: activeOrganization.id,
      invoice_id: invoice.id,
      description: item.description,
      qty: item.qty,
      unit_price: item.unit_price,
      total: item.qty * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("Failed to create invoice items:", itemsError);
      setError(itemsError.message);
      setSaving(false);
      return;
    }

    setClientId("");
    setEnterpriseId("");
    setProcessId("");
    setNumber("");
    setIssueDate("");
    setDueDate("");
    setNotes("");
    setItems([{ description: "", qty: "1", unit_price: "" }]);
    setSaving(false);

    await loadInvoices();
  }

  async function loadInvoiceDetails(invoiceId: string) {
    if (!activeOrganization) return;
    const [itemsRes, paymentsRes] = await Promise.all([
      supabase
        .from("invoice_items")
        .select("id, invoice_id, description, qty, unit_price, total")
        .eq("organization_id", activeOrganization.id)
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: true }),
      supabase
        .from("payments")
        .select("id, invoice_id, paid_at, amount, method, notes")
        .eq("organization_id", activeOrganization.id)
        .eq("invoice_id", invoiceId)
        .order("paid_at", { ascending: false }),
    ]);

    if (!itemsRes.error) {
      setItemsMap((prev) => ({ ...prev, [invoiceId]: (itemsRes.data as InvoiceItem[]) ?? [] }));
    }

    if (!paymentsRes.error) {
      setPaymentsMap((prev) => ({ ...prev, [invoiceId]: (paymentsRes.data as Payment[]) ?? [] }));
    }
  }

  async function handleToggleDetails(invoiceId: string) {
    if (expandedId === invoiceId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(invoiceId);
    if (!itemsMap[invoiceId] || !paymentsMap[invoiceId]) {
      await loadInvoiceDetails(invoiceId);
    }
  }

  async function handleAddPayment(invoice: InvoiceRow) {
    if (!activeOrganization) return;
    setError(null);

    const form = paymentForms[invoice.id] ?? { amount: "", paid_at: "", method: "", notes: "" };
    const amount = parseNumber(form.amount);

    if (amount <= 0) {
      setError("Informe um valor válido para o pagamento.");
      return;
    }

    const { error } = await supabase.from("payments").insert([
      {
        organization_id: activeOrganization.id,
        invoice_id: invoice.id,
        amount,
        paid_at: form.paid_at || null,
        method: form.method.trim() || null,
        notes: form.notes.trim() || null,
      },
    ]);

    if (error) {
      console.error("Failed to add payment:", error);
      setError(error.message);
      return;
    }

    await loadInvoiceDetails(invoice.id);

    const payments = paymentsMap[invoice.id] ?? [];
    const totalPaid = payments.reduce((acc, pay) => acc + pay.amount, 0) + amount;
    const invoiceTotal = invoice.total ?? 0;

    let nextStatus = invoice.status ?? "Rascunho";
    if (invoiceTotal > 0) {
      if (totalPaid >= invoiceTotal) {
        nextStatus = "Pago";
      } else {
        nextStatus = "Parcial";
      }
    }

    const { error: updateError } = await supabase
      .from("invoices")
      .update({ status: nextStatus })
      .eq("id", invoice.id)
      .eq("organization_id", activeOrganization.id);

    if (updateError) {
      console.error("Failed to update invoice status:", updateError);
      setError(updateError.message);
      return;
    }

    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoice.id ? { ...inv, status: nextStatus } : inv))
    );

    setPaymentForms((prev) => ({
      ...prev,
      [invoice.id]: { amount: "", paid_at: "", method: "", notes: "" },
    }));
  }

  function updatePaymentForm(
    invoiceId: string,
    field: "amount" | "paid_at" | "method" | "notes",
    value: string
  ) {
    setPaymentForms((prev) => ({
      ...prev,
      [invoiceId]: {
        ...(prev[invoiceId] ?? { amount: "", paid_at: "", method: "", notes: "" }),
        [field]: value,
      },
    }));
  }

  if (orgLoading) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-sm text-muted-foreground">Carregando organização...</p>
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="p-4 md:p-6">
        <div className="border border-border/60 bg-card/80 rounded-lg p-6 text-center space-y-2 shadow-[var(--shadow-card)]">
          <h1 className="text-xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Selecione ou crie uma organização para continuar.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Financeiro"
        description="Controle de faturas, cobranças e pagamentos."
      />

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base">Nova fatura</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateInvoice} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Cliente</label>
            <select
              className="border border-input bg-background rounded px-3 py-2 w-full"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setEnterpriseId("");
                setProcessId("");
              }}
            >
              <option value="">Selecione o cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name ?? "Cliente"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Empreendimento</label>
            <select
              className="border border-input bg-background rounded px-3 py-2 w-full"
              value={enterpriseId}
              onChange={(e) => {
                setEnterpriseId(e.target.value);
                setProcessId("");
              }}
            >
              <option value="">Empreendimento (opcional)</option>
              {filteredEnterprises.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name ?? "Empreendimento"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Processo</label>
            <select
              className="border border-input bg-background rounded px-3 py-2 w-full"
              value={processId}
              onChange={(e) => setProcessId(e.target.value)}
            >
              <option value="">Processo (opcional)</option>
              {filteredProcesses.map((proc) => (
                <option key={proc.id} value={proc.id}>
                  {proc.process_number ?? "Sem número"} — {proc.process_type ?? "Sem tipo"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Número</label>
            <Input
              className="bg-background"
              placeholder="Número da fatura"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Emissão</label>
            <Input
              className="bg-background"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Vencimento</label>
            <Input
              className="bg-background"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Observações</label>
          <textarea
            className="border border-input bg-background rounded px-3 py-2 w-full"
            rows={2}
            placeholder="Observações (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Itens da fatura</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={addItem}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Item
              </Button>
              <Button
                type="button"
                onClick={importProcessServices}
                variant="outline"
                size="sm"
              >
                Importar serviços do processo
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                <Input
                  className="bg-background"
                  placeholder="Descrição"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                />
                <Input
                  className="bg-background"
                  placeholder="Qtd"
                  value={item.qty}
                  onChange={(e) => updateItem(index, "qty", e.target.value)}
                />
                <Input
                  className="bg-background"
                  placeholder="Preço unitário"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                />
                <Button
                  type="button"
                  onClick={() => removeItem(index)}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Total calculado: <strong>{formatCurrency(totalValue)}</strong>
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Criar fatura"}
        </Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-background border border-border/60 rounded-lg p-4 space-y-3 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Faturas</h2>
          </div>
          <Button variant="outline" size="sm" onClick={loadInvoices}>
            Recarregar
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando faturas...</p>
        ) : invoices.length === 0 ? (
          <div className="text-center space-y-2 py-6">
            <p className="text-sm text-muted-foreground">Nenhuma fatura registrada.</p>
            <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Criar primeira fatura
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice, index) => (
              <div key={invoice.id} className={`border border-border/60 rounded-lg p-3 ${index % 2 === 1 ? "bg-muted/30" : "bg-card/90"}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {invoice.number ?? "Fatura sem número"}
                      </p>
                      <Badge variant={statusVariant(invoice.status)}>
                        {invoice.status ?? "Rascunho"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {invoice.clients?.name ?? "—"} • Processo: {invoice.environmental_processes?.process_number ?? "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Emissão: {formatDate(invoice.issue_date)} • Vencimento: {formatDate(invoice.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(invoice.total ?? 0)}</p>
                    <Button
                      variant="ghost"
                      onClick={() => handleToggleDetails(invoice.id)}
                      className="text-primary hover:text-primary/80"
                    >
                      {expandedId === invoice.id ? "Ocultar" : "Ver detalhes"}
                    </Button>
                  </div>
                </div>

                {expandedId === invoice.id && (
                  <div className="mt-4 border-t pt-4 space-y-4">
                    <div>
                      <h4 className="font-medium">Itens</h4>
                      {(itemsMap[invoice.id] ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum item.</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {itemsMap[invoice.id]?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span>{item.description}</span>
                              <span>
                                {item.qty} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium">Pagamentos</h4>
                      {(paymentsMap[invoice.id] ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {paymentsMap[invoice.id]?.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between text-sm">
                              <span>
                                {formatDate(payment.paid_at)} • {payment.method ?? "Método não informado"}
                              </span>
                              <span>{formatCurrency(payment.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Input
                          className="bg-background"
                          placeholder="Valor"
                          value={paymentForms[invoice.id]?.amount ?? ""}
                          onChange={(e) => updatePaymentForm(invoice.id, "amount", e.target.value)}
                        />
                        <Input
                          className="bg-background"
                          type="date"
                          value={paymentForms[invoice.id]?.paid_at ?? ""}
                          onChange={(e) => updatePaymentForm(invoice.id, "paid_at", e.target.value)}
                        />
                        <Input
                          className="bg-background"
                          placeholder="Método (PIX, Boleto...)"
                          value={paymentForms[invoice.id]?.method ?? ""}
                          onChange={(e) => updatePaymentForm(invoice.id, "method", e.target.value)}
                        />
                        <Input
                          className="bg-background"
                          placeholder="Observações"
                          value={paymentForms[invoice.id]?.notes ?? ""}
                          onChange={(e) => updatePaymentForm(invoice.id, "notes", e.target.value)}
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddPayment(invoice)}
                        className="mt-2"
                      >
                        Registrar pagamento
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


