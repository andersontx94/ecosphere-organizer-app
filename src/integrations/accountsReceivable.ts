import { useEffect, useState } from "react";

export type AccountReceivable = {
  id: string;
  description: string;
  amount: number;
  status: "Em Andamento" | "Concluído";
  due_date?: string;
};

export function useAccountsReceivable() {
  const [data, setData] = useState<AccountReceivable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock temporário (depois liga no Supabase)
    setTimeout(() => {
      setData([
        {
          id: "1",
          description: "Licenciamento Ambiental",
          amount: 2500,
          status: "Concluído",
          due_date: "2026-03-12",
        },
        {
          id: "2",
          description: "Consultoria Técnica",
          amount: 1800,
          status: "Em Andamento",
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  return { data, isLoading };
}

export function useDeleteAccountReceivable() {
  return {
    mutate: (id: string) => {
      alert(`Conta a receber ${id} excluída`);
    },
  };
}