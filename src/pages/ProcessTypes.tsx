import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, SlidersHorizontal, MoreHorizontal } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

type ProcessTypeRow = {
  id: string;
  name: string;
  category: string | null;
  code: string | null;
  default_deadline_days: number | null;
  requires_agency: boolean | null;
  requires_protocol_number: boolean | null;
  active: boolean | null;
  created_at: string;
};

const CATEGORY_LABELS = [
  "Licenciamento Ambiental",
  "Estudos e Relatórios",
  "Resíduos",
  "Recursos Hídricos",
  "Florestal / Supressão",
  "IBAMA / Cadastros",
  "Auditorias / Conformidade",
  "Outros",
];

export default function ProcessTypes() {
  const { activeOrganization } = useOrganization();
  const { user } = useAuth();

  const [processTypes, setProcessTypes] = useState<ProcessTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessTypeRow | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    category: "",
    code: "",
    default_deadline_days: "",
    requires_agency: false,
    requires_protocol_number: true,
    active: true,
  });

  useEffect(() => {
    loadProcessTypes();
  }, [activeOrganization]);

  async function loadProcessTypes() {
    if (!activeOrganization) {
      setProcessTypes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("process_types")
      .select(
        "id, name, category, code, default_deadline_days, requires_agency, requires_protocol_number, active, created_at"
      )
      .eq("organization_id", activeOrganization.id)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
      setProcessTypes([]);
    } else {
      setProcessTypes((data as ProcessTypeRow[]) ?? []);
    }

    setLoading(false);
  }

  const categories = useMemo(() => {
    const dynamic = processTypes
      .map((item) => item.category)
      .filter((item): item is string => !!item);
    return Array.from(new Set([...CATEGORY_LABELS, ...dynamic]));
  }, [processTypes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return processTypes.filter((item) => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.code?.toLowerCase().includes(term);
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? item.active !== false : item.active === false);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [processTypes, search, categoryFilter, statusFilter]);

  function openNewDialog() {
    setEditing(null);
    setFormState({
      name: "",
      category: "",
      code: "",
      default_deadline_days: "",
      requires_agency: false,
      requires_protocol_number: true,
      active: true,
    });
    setDialogOpen(true);
  }

  function openEditDialog(item: ProcessTypeRow) {
    setEditing(item);
    setFormState({
      name: item.name ?? "",
      category: item.category ?? "",
      code: item.code ?? "",
      default_deadline_days:
        item.default_deadline_days !== null
          ? String(item.default_deadline_days)
          : "",
      requires_agency: item.requires_agency ?? false,
      requires_protocol_number: item.requires_protocol_number ?? true,
      active: item.active !== false,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!activeOrganization) return;
    if (!formState.name.trim()) {
      setError("Informe o nome do tipo de processo.");
      return;
    }

    setError(null);

    const payload = {
      name: formState.name.trim(),
      category: formState.category.trim() || null,
      code: formState.code.trim() || null,
      default_deadline_days: formState.default_deadline_days
        ? Number(formState.default_deadline_days)
        : null,
      requires_agency: formState.requires_agency,
      requires_protocol_number: formState.requires_protocol_number,
      active: formState.active,
      organization_id: activeOrganization.id,
      user_id: user?.id ?? null,
      created_by: user?.id ?? null,
    };

    if (editing) {
      const { error } = await supabase
        .from("process_types")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("process_types")
        .insert(payload);
      if (error) {
        setError(error.message);
        return;
      }
    }

    setDialogOpen(false);
    await loadProcessTypes();
  }

  async function toggleActive(item: ProcessTypeRow) {
    const next = item.active === false ? true : false;
    const { error } = await supabase
      .from("process_types")
      .update({ active: next })
      .eq("id", item.id);
    if (error) {
      setError(error.message);
      return;
    }
    await loadProcessTypes();
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Tipos de Processo"
        description="Catálogo de processos ambientais por organização."
        action={
          <Button onClick={openNewDialog} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo tipo
          </Button>
        }
      />

      <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Buscar</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, categoria ou código"
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando tipos...</p>
      ) : processTypes.length === 0 ? (
        <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)]">
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-base font-medium">Nenhum tipo cadastrado</p>
            <p className="text-sm text-muted-foreground">
              Cadastre tipos de processo para padronizar o fluxo de abertura.
            </p>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4" />
              Criar tipo de processo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card/80 shadow-[var(--shadow-card)] overflow-hidden">
          <div className="w-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-left px-4 py-3">Categoria</th>
                  <th className="text-left px-4 py-3">Código</th>
                  <th className="text-left px-4 py-3">Flags</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-t ${index % 2 === 1 ? "bg-muted/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{item.name}</p>
                      {item.default_deadline_days !== null && (
                        <p className="text-xs text-muted-foreground">
                          Prazo sugerido: {item.default_deadline_days} dias
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.category ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.code ?? "—"}
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      {item.requires_agency && (
                        <Badge variant="secondary">Órgão</Badge>
                      )}
                      {item.requires_protocol_number && (
                        <Badge variant="secondary">Protocolo</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.active === false ? "destructive" : "success"}>
                        {item.active === false ? "Inativo" : "Ativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(item)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActive(item)}>
                            {item.active === false ? "Ativar" : "Desativar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar tipo de processo" : "Novo tipo de processo"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Licença de Operação"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={formState.category}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Ex: Licenciamento Ambiental"
                />
              </div>
              <div className="space-y-2">
                <Label>Código</Label>
                <Input
                  value={formState.code}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="LP, LI, LO..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prazo sugerido (dias)</Label>
              <Input
                type="number"
                min="0"
                value={formState.default_deadline_days}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    default_deadline_days: e.target.value,
                  }))
                }
                placeholder="Opcional"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
                <span>Exige órgão responsável</span>
                <Switch
                  checked={formState.requires_agency}
                  onCheckedChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      requires_agency: value,
                    }))
                  }
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
                <span>Exige número de protocolo</span>
                <Switch
                  checked={formState.requires_protocol_number}
                  onCheckedChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      requires_protocol_number: value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
              <span>Tipo ativo</span>
              <Switch
                checked={formState.active}
                onCheckedChange={(value) =>
                  setFormState((prev) => ({ ...prev, active: value }))
                }
              />
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              {editing ? "Salvar alterações" : "Criar tipo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

