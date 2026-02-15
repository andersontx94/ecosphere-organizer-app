import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";

type Client = {
  id: string;
  name: string;
  type: string | null;
  trade_name: string | null;
  cpf_cnpj: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  notes: string | null;
  active: boolean | null;
  created_at: string;
};

type Contact = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean | null;
  created_at: string;
};

type Enterprise = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  activity: string | null;
};

type Process = {
  id: string;
  process_number: string | null;
  status: string;
  due_date: string | null;
};

type Invoice = {
  id: string;
  number: string | null;
  status: string | null;
  issue_date: string | null;
  due_date: string | null;
  total: number | null;
};

type TabKey =
  | "dados"
  | "contatos"
  | "empreendimentos"
  | "processos"
  | "financeiro";

export default function ClientDetail() {
  const supabaseAny = supabase as any;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeOrganization } = useOrganization();

  const [client, setClient] = useState<Client | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("dados");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    is_primary: false,
  });

  const enterpriseIds = useMemo(
    () => enterprises.map((e) => e.id),
    [enterprises]
  );

  useEffect(() => {
    async function fetchData() {
      if (!id || !activeOrganization) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const [
        { data: clientData, error: clientError },
        { data: contactsData, error: contactsError },
        { data: enterprisesData, error: enterprisesError },
        { data: invoicesData, error: invoicesError },
      ] = await Promise.all([
        supabase
          .from("clients")
          .select(
            "id, name, type, trade_name, cpf_cnpj, phone, city, state, address, notes, active, created_at"
          )
          .eq("id", id)
          .eq("organization_id", activeOrganization.id)
          .single(),
        supabase
          .from("client_contacts")
          .select("id, name, role, email, phone, is_primary, created_at")
          .eq("client_id", id)
          .eq("organization_id", activeOrganization.id)
          .order("is_primary", { ascending: false }),
        supabase
          .from("enterprises")
          .select("id, name, city, state, activity")
          .eq("client_id", id)
          .eq("organization_id", activeOrganization.id)
          .order("name"),
        supabase
          .from("invoices")
          .select("id, number, status, issue_date, due_date, total")
          .eq("client_id", id)
          .eq("organization_id", activeOrganization.id)
          .order("issue_date", { ascending: false }),
      ]);

      if (clientError || !clientData) {
        setClient(null);
        setError("Cliente não encontrado.");
        setLoading(false);
        return;
      }

      setClient(clientData as unknown as Client);
      setContacts((contactsError ? [] : (contactsData as unknown as Contact[])) ?? []);
      setEnterprises(
        (enterprisesError ? [] : (enterprisesData as unknown as Enterprise[])) ?? []
      );
      setInvoices((invoicesError ? [] : (invoicesData as Invoice[])) ?? []);
      setLoading(false);
    }

    fetchData();
  }, [id, activeOrganization]);

  useEffect(() => {
    async function fetchProcesses() {
      if (!activeOrganization || enterpriseIds.length === 0) {
        setProcesses([]);
        return;
      }

      const { data, error } = await supabase
        .from("environmental_processes")
        .select("id, process_number, status, due_date, enterprise_id")
        .eq("organization_id", activeOrganization.id)
        .in("enterprise_id", enterpriseIds)
        .order("created_at", { ascending: false });

      if (error) {
        setProcesses([]);
        return;
      }

      setProcesses((data as Process[]) ?? []);
    }

    fetchProcesses();
  }, [enterpriseIds, activeOrganization]);

  async function handleSaveClient(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !activeOrganization) return;

    if (!client.name.trim()) {
      setError("Nome do cliente é obrigatório.");
      return;
    }

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("clients")
      .update({
        name: client.name.trim(),
        type: client.type,
        trade_name: client.trade_name?.trim() || null,
        cpf_cnpj: client.cpf_cnpj?.trim() || null,
        phone: client.phone?.trim() || null,
        city: client.city?.trim() || null,
        state: client.state?.trim() || null,
        address: client.address?.trim() || null,
        notes: client.notes?.trim() || null,
        active: client.active ?? true,
      })
      .eq("id", client.id)
      .eq("organization_id", activeOrganization.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrganization || !id) return;

    if (!contactForm.name.trim()) {
      setError("Nome do contato é obrigatório.");
      return;
    }

    const { error } = await supabaseAny.from("client_contacts").insert([
      {
        organization_id: activeOrganization.id,
        client_id: id,
        name: contactForm.name.trim(),
        role: contactForm.role.trim() || null,
        email: contactForm.email.trim() || null,
        phone: contactForm.phone.trim() || null,
        is_primary: contactForm.is_primary,
      },
    ]);

    if (error) {
      setError(error.message);
      return;
    }

    setContactForm({
      name: "",
      role: "",
      email: "",
      phone: "",
      is_primary: false,
    });

    const { data } = await supabase
      .from("client_contacts")
      .select("id, name, role, email, phone, is_primary, created_at")
      .eq("client_id", id)
      .eq("organization_id", activeOrganization.id)
      .order("is_primary", { ascending: false });
    setContacts((data as Contact[]) ?? []);
  }

  async function handleDeleteContact(contactId: string) {
    if (!activeOrganization) return;
    const confirmDelete = window.confirm("Excluir este contato?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("client_contacts")
      .delete()
      .eq("id", contactId)
      .eq("organization_id", activeOrganization.id);

    if (error) {
      setError(error.message);
      return;
    }

    setContacts((prev) => prev.filter((c) => c.id !== contactId));
  }

  if (loading) {
    return <p className="p-6 text-gray-500">Carregando cliente...</p>;
  }

  if (!client) {
    return <p className="p-6 text-red-500">{error ?? "Cliente não encontrado."}</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <p className="text-sm text-gray-500">
          Criado em {new Date(client.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="flex flex-wrap border-b">
          {(
            [
              ["dados", "Dados do cliente"],
              ["contatos", "Contatos"],
              ["empreendimentos", "Empreendimentos"],
              ["processos", "Processos"],
              ["financeiro", "Financeiro"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm ${
                activeTab === key
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === "dados" && (
            <form onSubmit={handleSaveClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                  <select
                    value={client.type ?? "PJ"}
                    onChange={(e) =>
                      setClient({ ...client, type: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="PJ">Pessoa Jurídica (PJ)</option>
                    <option value="PF">Pessoa Física (PF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Nome
                  </label>
                  <input
                    value={client.name}
                    onChange={(e) =>
                      setClient({ ...client, name: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Nome Fantasia
                </label>
                <input
                  value={client.trade_name ?? ""}
                  onChange={(e) =>
                    setClient({ ...client, trade_name: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    CPF/CNPJ
                  </label>
                  <input
                    value={client.cpf_cnpj ?? ""}
                    onChange={(e) =>
                      setClient({ ...client, cpf_cnpj: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Telefone
                  </label>
                  <input
                    value={client.phone ?? ""}
                    onChange={(e) =>
                      setClient({ ...client, phone: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Endereço
                </label>
                <input
                  value={client.address ?? ""}
                  onChange={(e) =>
                    setClient({ ...client, address: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Cidade
                  </label>
                  <input
                    value={client.city ?? ""}
                    onChange={(e) =>
                      setClient({ ...client, city: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Estado
                  </label>
                  <input
                    value={client.state ?? ""}
                    onChange={(e) =>
                      setClient({ ...client, state: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Observações
                </label>
                <textarea
                  value={client.notes ?? ""}
                  onChange={(e) =>
                    setClient({ ...client, notes: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={client.active ?? true}
                  onChange={(e) =>
                    setClient({ ...client, active: e.target.checked })
                  }
                />
                Cliente ativo
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </form>
          )}

          {activeTab === "contatos" && (
            <div className="space-y-4">
              <form onSubmit={handleAddContact} className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="border rounded px-3 py-2"
                    placeholder="Nome do contato"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                  />
                  <input
                    className="border rounded px-3 py-2"
                    placeholder="Cargo / Função"
                    value={contactForm.role}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, role: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="border rounded px-3 py-2"
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                  />
                  <input
                    className="border rounded px-3 py-2"
                    placeholder="Telefone"
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={contactForm.is_primary}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        is_primary: e.target.checked,
                      })
                    }
                  />
                  Contato principal
                </label>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Adicionar contato
                </button>
              </form>

              {contacts.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum contato cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="border rounded p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">
                          {contact.name} {contact.is_primary ? "• Principal" : ""}
                        </p>
                        <p className="text-xs text-gray-500">
                          {contact.role ?? "—"} • {contact.email ?? "—"} • {contact.phone ?? "—"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "empreendimentos" && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <h2 className="font-semibold">Empreendimentos</h2>
                <button
                  onClick={() => navigate(`/empresas/nova?client_id=${client.id}`)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + Novo empreendimento
                </button>
              </div>

              {enterprises.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum empreendimento cadastrado.
                </p>
              ) : (
                <ul className="space-y-2">
                  {enterprises.map((enterprise) => (
                    <li
                      key={enterprise.id}
                      className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/empresas/${enterprise.id}`)}
                    >
                      <p className="font-medium">{enterprise.name}</p>
                      <p className="text-xs text-gray-500">
                        {[enterprise.city, enterprise.state]
                          .filter(Boolean)
                          .join(" / ") || "Sem localização"} {enterprise.activity ? `• ${enterprise.activity}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "processos" && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <h2 className="font-semibold">Processos</h2>
              </div>
              {processes.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum processo vinculado aos empreendimentos.
                </p>
              ) : (
                <div className="space-y-2">
                  {processes.map((process) => (
                    <div
                      key={process.id}
                      className="border rounded p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/processos/${process.id}`)}
                    >
                      <div>
                        <p className="font-medium">
                          {process.process_number ?? "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: {process.status}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {process.due_date
                          ? new Date(process.due_date).toLocaleDateString("pt-BR")
                          : "Sem prazo"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "financeiro" && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <h2 className="font-semibold">Faturas</h2>
                <button
                  onClick={() => navigate("/financeiro")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver financeiro
                </button>
              </div>
              {invoices.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhuma fatura cadastrada para este cliente.
                </p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded p-3">
                      <p className="font-medium">
                        {invoice.number ?? "Fatura sem número"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {invoice.status ?? "Rascunho"} • Total: {invoice.total
                          ? new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(invoice.total)
                          : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



