import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/lib/supabase";
import { useOrganization } from '@/contexts/OrganizationContext';

export interface DashboardStats {
  totalClients: number;
  totalEnterprises: number;
  totalDocuments: number;
  pendingTasks: number;
  receivedThisMonth: number;
  paidThisMonth: number;
}

export function useDashboardStats() {
  const { activeOrganization } = useOrganization();

  return useQuery({
    queryKey: ['dashboard-stats', activeOrganization?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!activeOrganization) {
        return {
          totalClients: 0,
          totalEnterprises: 0,
          totalDocuments: 0,
          pendingTasks: 0,
          receivedThisMonth: 0,
          paidThisMonth: 0,
        };
      }

      // Get current month range
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const [
        clientsResult,
        enterprisesResult,
        documentsResult,
        tasksResult,
        receivablesResult,
        payablesResult,
      ] = await Promise.all([
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', activeOrganization.id),
        supabase
          .from('enterprises')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', activeOrganization.id),
        supabase
          .from('documents')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', activeOrganization.id),
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', activeOrganization.id)
          .neq('status', 'concluido'),
        supabase
          .from('accounts_receivable')
          .select('amount')
          .eq('organization_id', activeOrganization.id)
          .eq('status', 'recebido')
          .gte('received_at', firstDayOfMonth.toISOString())
          .lte('received_at', lastDayOfMonth.toISOString()),
        supabase
          .from('accounts_payable')
          .select('amount')
          .eq('organization_id', activeOrganization.id)
          .eq('status', 'pago')
          .gte('paid_at', firstDayOfMonth.toISOString())
          .lte('paid_at', lastDayOfMonth.toISOString()),
      ]);

      const receivedThisMonth = receivablesResult.data?.reduce(
        (sum, r) => sum + Number(r.amount),
        0
      ) || 0;

      const paidThisMonth = payablesResult.data?.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      ) || 0;

      return {
        totalClients: clientsResult.count || 0,
        totalEnterprises: enterprisesResult.count || 0,
        totalDocuments: documentsResult.count || 0,
        pendingTasks: tasksResult.count || 0,
        receivedThisMonth,
        paidThisMonth,
      };
    },
    enabled: !!activeOrganization,
  });
}

