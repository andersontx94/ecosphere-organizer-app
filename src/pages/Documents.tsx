import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Plus, UploadCloud } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

type ProcessOption = {
  id: string;
  process_number: string | null;
  process_type: string | null;
};

type DocumentRow = {
  id: string;
  title: string;
  file_path: string;
  file_type: string | null;
  created_at: string;
  process_id: string | null;
  environmental_processes?: {
    process_number: string | null;
    process_type: string | null;
  } | null;
};

export default function Documents() {
  const { activeOrganization, loading: orgLoading } = useOrganization();
  const [processes, setProcesses] = useState<ProcessOption[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [title, setTitle] = useState("");
  const [processId, setProcessId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [filterProcessId, setFilterProcessId] = useState("");

  useEffect(() => {
    async function loadProcesses() {
      if (!activeOrganization) {
        setProcesses([]);
        return;
      }
      const { data, error } = await supabase
        .from("environmental_processes")
        .select("id, process_number, process_type")
        .eq("organization_id", activeOrganization.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load processes (documents):", error);
        return;
      }

      setProcesses((data as ProcessOption[]) ?? []);
    }

    loadProcesses();
  }, [activeOrganization]);

  useEffect(() => {
    async function loadDocuments() {
      if (!activeOrganization) return;
      setLoading(true);
      setError(null);

      let query = (supabase as any)
        .from("documents")
        .select(
          "id, title, file_path, file_type, created_at, process_id, environmental_processes(process_number, process_type)"
        )
        .eq("organization_id", activeOrganization.id)
        .order("created_at", { ascending: false });

      if (filterProcessId) {
        query = query.eq("process_id", filterProcessId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to load documents:", error);
        setError(error.message);
        setDocuments([]);
      } else {
        setDocuments((data as DocumentRow[]) ?? []);
      }

      setLoading(false);
    }

    if (!activeOrganization) {
      setDocuments([]);
      setLoading(false);
      setError(null);
      return;
    }

    loadDocuments();
  }, [activeOrganization, filterProcessId]);

  const processOptions = useMemo(() => {
    return processes.map((proc) => ({
      id: proc.id,
      label: `${proc.process_number ?? "Sem número"} — ${proc.process_type ?? "Sem tipo"}`,
    }));
  }, [processes]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrganization) return;

    setError(null);

    if (!title.trim()) {
      setError("Informe o título do documento.");
      return;
    }

    if (!processId) {
      setError("Selecione um processo para vincular o documento.");
      return;
    }

    if (!file) {
      setError("Selecione um arquivo para enviar.");
      return;
    }

    setUploading(true);

    const safeName = file.name.replace(/\s+/g, "-");
    const path = `${activeOrganization.id}/${processId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      console.error("Failed to upload document:", uploadError);
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("documents").insert(
      [
        {
          organization_id: activeOrganization.id,
          process_id: processId,
          title: title.trim(),
          file_path: path,
          file_type: file.type || null,
        },
      ] as any
    );

    if (insertError) {
      console.error("Failed to insert document:", insertError);
      setError(insertError.message);
      setUploading(false);
      return;
    }

    setTitle("");
    setProcessId("");
    setFile(null);
    setUploading(false);

    const { data, error: reloadError } = await (supabase as any)
      .from("documents")
      .select(
        "id, title, file_path, file_type, created_at, process_id, environmental_processes(process_number, process_type)"
      )
      .eq("organization_id", activeOrganization.id)
      .order("created_at", { ascending: false });

    if (reloadError) {
      console.error("Failed to reload documents:", reloadError);
      return;
    }

    setDocuments((data as DocumentRow[]) ?? []);
  }

  async function handleDownload(doc: DocumentRow) {
    setError(null);
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 60 * 60);

    if (error || !data?.signedUrl) {
      console.error("Failed to create signed url:", error);
      setError(error?.message ?? "Erro ao gerar link de download.");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete(doc: DocumentRow) {
    if (!activeOrganization) return;
    const ok = window.confirm("Excluir este documento?");
    if (!ok) return;

    setError(null);

    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([doc.file_path]);

    if (storageError) {
      console.error("Failed to remove document from storage:", storageError);
      setError(storageError.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id)
      .eq("organization_id", activeOrganization.id);

    if (deleteError) {
      console.error("Failed to delete document row:", deleteError);
      setError(deleteError.message);
      return;
    }

    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  }

  if (orgLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Carregando organização...</p>
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="p-6">
        <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
          <CardContent className="p-6 text-center space-y-2">
            <h1 className="text-xl font-semibold">Documentos</h1>
            <p className="text-sm text-muted-foreground">
              Selecione ou crie uma organização para continuar.
            </p>
            <Button asChild>
              <Link to="/">Voltar ao painel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Documentos"
        description="Gerencie anexos vinculados aos processos ambientais."
      />

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base">Novo documento</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleUpload} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Título</label>
                <Input
                  className="bg-background"
                  placeholder="Título do documento"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">Processo</label>
                <select
                  className="border border-input bg-background rounded px-3 py-2 w-full"
                  value={processId}
                  onChange={(e) => setProcessId(e.target.value)}
                >
                  <option value="">Selecione o processo</option>
                  {processOptions.map((proc) => (
                    <option key={proc.id} value={proc.id}>
                      {proc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">Arquivo</label>
                <Input
                  type="file"
                  className="bg-background text-sm"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={uploading}>
              <UploadCloud className="h-4 w-4" />
              {uploading ? "Enviando..." : "Enviar documento"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Lista de documentos</CardTitle>
          <select
            className="border border-input bg-background rounded px-3 py-2 text-sm"
            value={filterProcessId}
            onChange={(e) => setFilterProcessId(e.target.value)}
          >
            <option value="">Todos os processos</option>
            {processOptions.map((proc) => (
              <option key={proc.id} value={proc.id}>
                {proc.label}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando documentos...</p>
          ) : documents.length === 0 ? (
            <div className="text-center space-y-2 py-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum documento encontrado.</p>
              <Button
                variant="outline"
                onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                <Plus className="h-4 w-4" />
                Enviar documento
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="p-2">Documento</th>
                    <th className="p-2">Processo</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Criado em</th>
                    <th className="p-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr key={doc.id} className={`border-t border-border/60 ${index % 2 === 1 ? "bg-muted/30" : ""}`}>
                      <td className="p-2">
                        <p className="font-medium text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.file_path}</p>
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {doc.environmental_processes
                          ? `${doc.environmental_processes.process_number ?? "Sem número"} — ${doc.environmental_processes.process_type ?? "Sem tipo"}`
                          : "—"}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {doc.file_type ? <Badge variant="secondary">{doc.file_type}</Badge> : "Arquivo"}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" onClick={() => handleDownload(doc)}>
                            Baixar
                          </Button>
                          <Button variant="ghost" className="text-destructive" onClick={() => handleDelete(doc)}>
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
