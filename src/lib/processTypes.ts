import { supabase } from "@/lib/supabase";
import { TablesInsert } from "@/integrations/supabase/types";

type ProcessTypeSeed = Omit<
  TablesInsert<"process_types">,
  "id" | "created_at" | "organization_id"
>;

export const DEFAULT_PROCESS_TYPES: ProcessTypeSeed[] = [
  {
    name: "Licença Prévia (LP)",
    category: "Licenciamento Ambiental",
    code: "LP",
    is_licensing: true,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Licença de Instalação (LI)",
    category: "Licenciamento Ambiental",
    code: "LI",
    is_licensing: true,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Licença de Operação (LO)",
    category: "Licenciamento Ambiental",
    code: "LO",
    is_licensing: true,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Renovação de LO",
    category: "Licenciamento Ambiental",
    code: "RLO",
    is_licensing: true,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Licença Simplificada / Autodeclaratória",
    category: "Licenciamento Ambiental",
    code: "LS",
    is_licensing: true,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Dispensa de Licenciamento / Declaração de Isenção",
    category: "Licenciamento Ambiental",
    code: "DLI",
    is_licensing: false,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "RCA (Relatório de Controle Ambiental)",
    category: "Estudos e Relatórios",
    code: "RCA",
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "PCA (Plano de Controle Ambiental)",
    category: "Estudos e Relatórios",
    code: "PCA",
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "EIA/RIMA (Estudo/Relatório de Impacto Ambiental)",
    category: "Estudos e Relatórios",
    code: "EIA/RIMA",
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "PRAD (Plano de Recuperação de Áreas Degradadas)",
    category: "Estudos e Relatórios",
    code: "PRAD",
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "PBA (Plano Básico Ambiental)",
    category: "Estudos e Relatórios",
    code: "PBA",
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "Inventário/Diagnóstico Ambiental",
    category: "Estudos e Relatórios",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "Relatório de Monitoramento / Condicionantes",
    category: "Estudos e Relatórios",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "PGRS (Plano de Gerenciamento de Resíduos Sólidos)",
    category: "Resíduos",
    code: "PGRS",
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "MTR / Manifesto de Transporte de Resíduos",
    category: "Resíduos",
    code: "MTR",
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "Inventário de Resíduos / Relatório Anual",
    category: "Resíduos",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "Outorga de Uso da Água (captação/lançamento)",
    category: "Recursos Hídricos",
    code: "OUT",
    is_licensing: false,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Renovação de Outorga",
    category: "Recursos Hídricos",
    code: "R-OUT",
    is_licensing: false,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Cadastro/Regularização de Poço",
    category: "Recursos Hídricos",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Autorização de Supressão Vegetal (ASV)",
    category: "Florestal / Supressão",
    code: "ASV",
    is_licensing: false,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Autorização de Intervenção em APP",
    category: "Florestal / Supressão",
    code: "APP",
    is_licensing: false,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Plano de Manejo / Inventário Florestal",
    category: "Florestal / Supressão",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "CTF/IBAMA (Cadastro Técnico Federal)",
    category: "IBAMA / Cadastros",
    code: "CTF",
    is_licensing: false,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Relatórios/Declarações Periódicas (IBAMA)",
    category: "IBAMA / Cadastros",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Auditoria Ambiental",
    category: "Auditorias / Conformidade",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "Due Diligence Ambiental",
    category: "Auditorias / Conformidade",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "Plano de Ação / Adequações",
    category: "Auditorias / Conformidade",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
  {
    name: "Atendimento de Notificação / Auto de Infração",
    category: "Outros",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: true,
    requires_protocol_number: true,
    active: true,
  },
  {
    name: "Parecer Técnico / Laudo",
    category: "Outros",
    code: null,
    is_licensing: false,
    is_default: true,
    requires_agency: false,
    requires_protocol_number: false,
    active: true,
  },
];

export async function ensureDefaultProcessTypes(
  organizationId: string,
  userId?: string
) {
  if (!organizationId) return;

  const { count, error } = await supabase
    .from("process_types")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) {
    throw error;
  }

  if ((count ?? 0) > 0) return;

  const payload = DEFAULT_PROCESS_TYPES.map((item) => ({
    ...item,
    organization_id: organizationId,
    user_id: userId ?? null,
    created_by: userId ?? null,
  }));

  const { error: insertError } = await supabase
    .from("process_types")
    .insert(payload);

  if (insertError) {
    throw insertError;
  }
}
