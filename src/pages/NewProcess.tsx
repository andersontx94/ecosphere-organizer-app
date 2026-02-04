import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function NewProcess() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<any[]>([]);
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [clientId, setClientId] = useState("");
  const [enterpriseId, setEnterpriseId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [agency, setAgency] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const [{ data: clients }, { data: services }] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("services").select("*").order("name"),
    ]);

    setClients(clients || []);
    setServices(services || []);
  }

  async function loadEnterprises(clientId: string) {
    setEnterpriseId("");
    const { data } = await supabase
      .from("enterprises")
      .select("*")
      .eq("client_id", clientId)
      .order("name");

    setEnterprises(data || []);
  }

  async function handleSave() {
    setError("");
    setLoading(true);

    try {
      if (!clientId || !enterpriseId || !serviceId) {
        setError("Cliente, empresa e serviço são obrigatórios.");
        return;
      }

      const formattedDate = dueDate
        ? new Date(dueDate).toISOString().split("T")[0]
        : null;

      const { error } = await supabase.from("processes").insert([
        {
          client_id: clientId,
          enterprise_id: enterpriseId,
          service_id: serviceId,
          agency,
          due_date: formattedDate,
          status: "em_andamento",
        },
      ]);

      if (error) throw error;

      navigate("/processos");
    } catch (err: any) {
      console.error(err);
      setError("Erro ao salvar o processo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Novo Processo</h1>

      <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            loadEnterprises(e.target.value);
          }}
        >
          <option value="">Selecione um cliente</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="w-full border rounded-lg px-3 py-2"
          value={enterpriseId}
          onChange={(e) => setEnterpriseId(e.target.value)}
        >
          <option value="">Selecione uma empresa</option>
          {enterprises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <select
          className="w-full border rounded-lg px-3 py-2"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          <option value="">Selecione o serviço</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Órgão / Agência"
          value={agency}
          onChange={(e) => setAgency(e.target.value)}
        />

        <input
          type="date"
          className="w-full border rounded-lg px-3 py-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Salvando..." : "Salvar Processo"}
        </button>
      </div>
    </div>
  );
}