import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useFinancialSummary, usePendingReceivables, usePendingPayables } from '@/hooks/useFinancial';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Financial() {
  const { data: summary, isLoading } = useFinancialSummary();
  const { data: pendingReceivables } = usePendingReceivables();
  const { data: pendingPayables } = usePendingPayables();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Financeiro
          </h1>
          <p className="text-muted-foreground mt-1">
            Controle de caixa e movimentações financeiras
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo em Caixa</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1">
                    {isLoading ? '...' : formatCurrency(summary?.cashBalance || 0)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">A Receber</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 text-success">
                    {isLoading ? '...' : formatCurrency(summary?.pendingReceivables || 0)}
                  </p>
                </div>
                <ArrowUpCircle className="h-8 w-8 text-success opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">A Pagar</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 text-destructive">
                    {isLoading ? '...' : formatCurrency(summary?.pendingPayables || 0)}
                  </p>
                </div>
                <ArrowDownCircle className="h-8 w-8 text-destructive opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className={summary?.monthlyResult && summary.monthlyResult >= 0 ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resultado do Mês</p>
                  <p className={`text-2xl lg:text-3xl font-bold mt-1 ${summary?.monthlyResult && summary.monthlyResult >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {isLoading ? '...' : formatCurrency(summary?.monthlyResult || 0)}
                  </p>
                </div>
                <BarChart3 className={`h-8 w-8 opacity-80 ${summary?.monthlyResult && summary.monthlyResult >= 0 ? 'text-success' : 'text-destructive'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/financeiro/receber">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Contas a Receber
            </Button>
          </Link>
          <Link to="/financeiro/pagar">
            <Button variant="outline" className="gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Contas a Pagar
            </Button>
          </Link>
        </div>

        {/* Pending Lists */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Receivables */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-success" />
                  A Receber
                </div>
                <Link to="/financeiro/receber">
                  <Button variant="ghost" size="sm">Ver todos</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!pendingReceivables?.length ? (
                <div className="text-center py-6 text-muted-foreground">
                  <ArrowUpCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nenhuma conta a receber</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {pendingReceivables.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(item.due_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          {item.clients?.name && (
                            <span className="truncate">• {item.clients.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-success">{formatCurrency(item.amount)}</p>
                        {isOverdue(item.due_date) && (
                          <Badge variant="destructive" className="text-xs">Vencido</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Payables */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  A Pagar
                </div>
                <Link to="/financeiro/pagar">
                  <Button variant="ghost" size="sm">Ver todos</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!pendingPayables?.length ? (
                <div className="text-center py-6 text-muted-foreground">
                  <ArrowDownCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nenhuma conta a pagar</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {pendingPayables.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(item.due_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          {item.category && (
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-destructive">{formatCurrency(item.amount)}</p>
                        {isOverdue(item.due_date) && (
                          <Badge variant="destructive" className="text-xs">Vencido</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Resumo do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(summary?.totalReceived || 0)}
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-destructive/10">
                <p className="text-sm text-muted-foreground mb-1">Total Pago</p>
                <p className="text-xl font-bold text-destructive">
                  {formatCurrency(summary?.totalPaid || 0)}
                </p>
              </div>
              <div className={`text-center p-4 rounded-lg ${summary?.monthlyResult && summary.monthlyResult >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <p className="text-sm text-muted-foreground mb-1">
                  {summary?.monthlyResult && summary.monthlyResult >= 0 ? 'Lucro' : 'Prejuízo'}
                </p>
                <p className={`text-xl font-bold ${summary?.monthlyResult && summary.monthlyResult >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(Math.abs(summary?.monthlyResult || 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
