import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import StatusBadge from "../components/ui/StatusBadge";
import ProcessTasks from "../components/ProcessTasks";
import { computeProcessStatus } from "@/hooks/useProcesses";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";

type Process = {
  id: string;
  process_number: string | null;
  process_type: string | null;
  status: string;
  due_date: string | null;
  agency: string | null;
  client_id: string | null;
  enterprise_id: string | null;
  service_id: string | null;
  clients?: { name: string | null } | null;
  enterprises?: { name: string | null } | null;
};

type ServiceItem = {
  id: string;
  service_id: string;
  qty: number;
  unit_price: number;
  notes: string | null;
  services?: { name: string | null } | null;
};

type ServiceOption = {
  id: string;
  name: string;
  default_price: number | null;
};

type LinkedService = {
  id: string;
  name: string;
};

type DocumentRow = {
  id: string;
  title: string;
  file_path: string;
  file_type: string | null;
  created_at: string;
};

type TabKey = "servicos" | "tarefas" | "documentos";

export default function ProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();
  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("servicos");

  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [linkedServices, setLinkedServices] = useState<LinkedService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [itemNotes, setItemNotes] = useState("");
  const [savingItem, setSavingItem] = useState(false);

  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  useEffect(() => {
    async function loadProcess() {
      if (!id || !activeOrganization) return;

      const { data, error } = await supabase
        .from("environmental_processes")
        .select(
          "id, process_number, process_type, status, due_date, agency, client_id, enterprise_id, service_id, clients(name), enterprises(name)"
        )
        .eq("organization_id", activeOrganization.id)
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProcess(data as Process);
      }

      setLoading(false);
    }

    loadProcess();
  }, [id, user]);

  useEffect(() => {
    async function loadServices() {
      if (!activeOrganization) return;
      const { data } = await supabase
        .from("services")
        .select("id, name, default_price")
        .eq("organization_id", activeOrganization.id)
        .eq("active", true)
        .order("name");
      setServiceOptions((data as ServiceOption[]) || []);
    }
    loadServices();
  }, [user]);

  useEffect(() => {
    async function loadLinkedServices() {
      if (!activeOrganization || !id) return;
      setServicesLoading(true);

      const { data, error } = await supabase
        .from("process_services")
        .select("service_id, services(name)")
        .eq("process_id", id)
        .eq("organization_id", activeOrganization.id);

      if (error) {
        console.error("Failed to load linked services:", error);
        setLinkedServices([]);
        setServicesLoading(false);
        return;
      }

      const mapped =
        (data || [])
          .map((row) => ({
            id: row.service_id,
            name: row.services?.name ?? "Serviço",
          }))
          .filter((row) => !!row.id) ?? [];

      if (mapped.length === 0 && process?.service_id) {
        const { data: legacy, error: legacyError } = await supabase
          .from("services")
          .select("id, name")
          .eq("id", process.service_id)
          .single();

        if (!legacyError && legacy) {
          setLinkedServices([{ id: legacy.id, name: legacy.name }]);
          setServicesLoading(false);
          return;
        }
      }

      setLinkedServices(mapped);
      setServicesLoading(false);
    }

    loadLinkedServices();
  }, [activeOrganization, id, process?.service_id]);

  useEffect(() => {
    async function loadServiceItems() {
      if (!activeOrganization || !id) return;
      const { data } = await supabase
        .from("process_services")
        .select("id, service_id, qty, unit_price, notes, services(name)")
        .eq("process_id", id)
        .eq("organization_id", activeOrganization.id)
        .order("created_at", { ascending: false });
      setServiceItems((data as ServiceItem[]) || []);
    }
    loadServiceItems();
  }, [id, user]);

  useEffect(() => {
    async function loadDocuments() {
      if (!activeOrganization || !id) return;
      const { data } = await supabase
        .from("documents")
        .select("id, title, file_path, file_type, created_at")
        .eq("process_id", id)
        .eq("organization_id", activeOrganization.id)
        .order("created_at", { ascending: false });
      setDocuments((data as DocumentRow[]) || []);
    }
    loadDocuments();
  }, [id, user]);

  const totalValue = useMemo(() => {
    return serviceItems.reduce(
      (acc, item) => acc + item.qty * item.unit_price,
      0
    );
  }, [serviceItems]);

  const computed = process
    ? computeProcessStatus(process.status, process.due_date)
    : null;

  async function handleAddServiceItem() {
    if (!activeOrganization || !id) return;
    if (!serviceId) {
      return;
    }

    const qtyValue = Number(qty.replace(",", "."));
    const priceValue = Number(unitPrice.replace(",", "."));
    if (Number.isNaN(qtyValue) || Number.isNaN(priceValue)) {
      return;
    }

    setSavingItem(true);

    const { error } = await supabase.from("process_services").insert([
      {
        organization_id: activeOrganization.id,
        process_id: id,
        service_id: serviceId,
        qty: qtyValue,
        unit_price: priceValue,
        notes: itemNotes.trim() || null,
      },
    ]);

    setSavingItem(false);

    if (!error) {
      setServiceId("");
      setQty("1");
      setUnitPrice("");
      setItemNotes("");

      const { data } = await supabase
        .from("process_services")
        .select("id, service_id, qty, unit_price, notes, services(name)")
        .eq("process_id", id)
        .eq("organization_id", activeOrganization.id)
        .order("created_at", { ascending: false });
      setServiceItems((data as ServiceItem[]) || []);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!activeOrganization) return;
    const ok = window.confirm("Excluir este item?");
    if (!ok) return;

    const { error } = await supabase
      .from("process_services")
      .delete()
      .eq("id", itemId)
      .eq("organization_id", activeOrganization.id);

    if (!error) {
      setServiceItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  }

  async function handleUploadDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !id || !activeOrganization) return;
    setDocError(null);

    if (!docTitle.trim() || !docFile) {
      setDocError("Informe título e arquivo.");
      return;
    }

    setDocLoading(true);

    const path = `${user.id}/${id}/${Date.now()}-${docFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, docFile);

    if (uploadError) {
      setDocError(uploadError.message);
      setDocLoading(false);
      return;
    }

    const { error } = await supabase.from("documents").insert([
      {
        organization_id: activeOrganization.id,
        process_id: id,
        title: docTitle.trim(),
        file_path: path,
        file_type: docFile.type || null,
      },
    ]);

    setDocLoading(false);

    if (error) {
      setDocError(error.message);
      return;
    }

    setDocTitle("");
    setDocFile(null);
    const { data } = await supabase
      .from("documents")
      .select("id, title, file_path, file_type, created_at")
      .eq("process_id", id)
      .eq("organization_id", activeOrganization.id)
      .order("created_at", { ascending: false });
    setDocuments((data as DocumentRow[]) || []);
  }

  if (loading) {
    return <p className="text-gray-500">Carregando processo...</p>;
  }

  if (notFound || !process) {
    return <p className="text-red-500">Processo não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              Processo {process.process_number ?? "—"}
            </h1>
            <p className="text-sm text-gray-500">
              Cliente: {process.clients?.name ?? "—"} • Empreendimento:{" "}
              {process.enterprises?.name ?? "—"}
            </p>
            <p className="text-sm text-gray-500">
              Tipo: {process.process_type ?? "—"} • Órgão:{" "}
              {process.agency ?? "—"}
            </p>
          </div>

          {computed && (
            <StatusBadge status={computed.visualStatus}>
              {computed.label}
            </StatusBadge>
          )}
        </div>

        <div className="text-sm text-gray-700">
          Vencimento:{" "}
          {process.due_date
            ? new Date(process.due_date).toLocaleDateString("pt-BR")
            : "Sem prazo"}
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="flex flex-wrap border-b">
          {(
            [
              ["servicos", "Serviços do processo"],
              ["tarefas", "Tarefas"],
              ["documentos", "Documentos"],
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

        <div className="p-4 space-y-4">
          {activeTab === "servicos" && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-gray-50 p-3">
                <div className="text-sm font-medium text-gray-800">
                  Serviços vinculados
                </div>
                {servicesLoading ? (
                  <p className="text-sm text-gray-500 mt-1">Carregando...</p>
                ) : linkedServices.length === 0 ? (
                  <p className="text-sm text-gray-500 mt-1">
                    Nenhum serviço vinculado.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {linkedServices.map((svc) => (
                      <span
                        key={svc.id}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 border"
                      >
                        {svc.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  className="border rounded px-3 py-2"
                  value={serviceId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setServiceId(id);
                    const svc = serviceOptions.find((s) => s.id === id);
                    setUnitPrice(
                      svc?.default_price !== null && svc?.default_price !== undefined
                        ? String(svc.default_price)
                        : ""
                    );
                  }}
                >
                  <option value="">Selecione um serviço</option>
                  {serviceOptions.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Qtd"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Preço unitário"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                />
                <button
                  onClick={handleAddServiceItem}
                  disabled={savingItem}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingItem ? "Adicionando..." : "Adicionar"}
                </button>
              </div>
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Observações (opcional)"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
              />

              {serviceItems.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum serviço adicionado ao processo.
                </p>
              ) : (
                <div className="space-y-2">
                  {serviceItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">
                          {item.services?.name ?? "Serviço"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qtd: {item.qty} • Unit:{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.unit_price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.qty * item.unit_price)}
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-right text-sm font-medium">
                Total:{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalValue)}
              </div>
            </div>
          )}

          {activeTab === "tarefas" && <ProcessTasks processId={process.id} />}

          {activeTab === "documentos" && (
            <div className="space-y-4">
              <form onSubmit={handleUploadDocument} className="space-y-3">
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Título do documento"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
                <input
                  type="file"
                  onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                />
                {docError && <p className="text-sm text-red-600">{docError}</p>}
                <button
                  type="submit"
                  disabled={docLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  {docLoading ? "Enviando..." : "Enviar documento"}
                </button>
              </form>

              {documents.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum documento anexado ao processo.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded p-3">
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-gray-500">
                        {doc.file_type ?? "Arquivo"} •{" "}
                        {new Date(doc.created_at).toLocaleDateString("pt-BR")}
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

