import { ReactNode } from "react";
import { ProcessStatus } from "../../hooks/useProcesses";

interface StatusBadgeProps {
  status: ProcessStatus;
  children?: ReactNode;
}

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";

  const styles: Record<ProcessStatus, string> = {
    em_andamento: "bg-yellow-100 text-yellow-800",
    concluido: "bg-green-100 text-green-800",
    atrasado: "bg-red-100 text-red-800",
    vence_em_breve: "bg-orange-100 text-orange-800",
  };

  return <span className={`${base} ${styles[status]}`}>{children}</span>;
}
