export type ProcessStatus =
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
  | 'suspenso';

export type Process = {
  id: string;
  process_number: string | null;
  status: ProcessStatus;
  due_date: string | null;
  created_at: string;
};