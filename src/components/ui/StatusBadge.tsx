import { ReactNode } from "react";
import { ProcessStatus } from "../../hooks/useProcesses";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: ProcessStatus;
  children?: ReactNode;
}

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  const variants: Record<ProcessStatus, "warning" | "success" | "destructive"> =
    {
      em_andamento: "warning",
      concluido: "success",
      atrasado: "destructive",
      vence_em_breve: "warning",
    };

  return (
    <Badge variant={variants[status]} className="px-3 py-1 text-xs font-medium">
      {children}
    </Badge>
  );
}
