interface StatusBadgeProps {
    status: string;
  }
  
  export default function StatusBadge({ status }: StatusBadgeProps) {
    const base =
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
  
    const styles: Record<string, string> = {
      "em andamento": "bg-blue-100 text-blue-700",
      concluído: "bg-green-100 text-green-700",
      pendente: "bg-yellow-100 text-yellow-700",
    };
  
    return (
      <span className={`${base} ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  }