import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Calendar,
  FileText,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface ProcessCardProps {
  process: {
    id: string;
    process_type: string;
    agency: string;
    process_number: string | null;
    status: string;
    expiry_date: string | null;
    internal_deadline: string | null;
    risk_status: string | null;
    total_value: number | null;
    clients?: { name: string } | null;
    enterprises?: { name: string } | null;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  em_elaboracao: { label: 'Em Elaboração', variant: 'secondary' },
  protocolado: { label: 'Protocolado', variant: 'outline' },
  em_analise: { label: 'Em Análise', variant: 'default' },
  exigencia: { label: 'Em Exigência', variant: 'destructive' },
  deferido: { label: 'Deferido', variant: 'default' },
  indeferido: { label: 'Indeferido', variant: 'destructive' },
};

function getRiskStatus(
  expiryDate: string | null,
  internalDeadline: string | null
): { label: string; icon: JSX.Element; color: string } {
  const dateToCheck = internalDeadline || expiryDate;

  if (!dateToCheck) {
    return {
      label: 'Sem prazo',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-success',
    };
  }

  const daysUntil = differenceInDays(new Date(dateToCheck), new Date());

  if (daysUntil < 0) {
    return {
      label: 'Vencido',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-destructive',
    };
  }

  if (daysUntil <= 15) {
    return {
      label: 'Crítico',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-destructive',
    };
  }

  if (daysUntil <= 30) {
    return {
      label: 'Atenção',
      icon: <Clock className="h-4 w-4" />,
      color: 'text-warning',
    };
  }

  return {
    label: 'Em dia',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-success',
  };
}

export function ProcessCard({ process, onEdit, onDelete }: ProcessCardProps) {
  const statusConfig =
    STATUS_CONFIG[process.status] || STATUS_CONFIG.em_elaboracao;

  const riskInfo = getRiskStatus(
    process.expiry_date,
    process.internal_deadline
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Linha principal */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">
                {process.process_type}
              </span>

              <Badge variant={statusConfig.variant}>
                {statusConfig.label}
              </Badge>

              <span
                className={`flex items-center gap-1 text-xs font-medium ${riskInfo.color}`}
              >
                {riskInfo.icon}
                {riskInfo.label}
              </span>
            </div>

            {/* Informações básicas */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{process.agency}</span>
                {process.process_number && (
                  <span className="font-mono">
                    • Nº {process.process_number}
                  </span>
                )}
              </div>

              {process.clients?.name && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{process.clients.name}</span>
                  {process.enterprises?.name && (
                    <span>• {process.enterprises.name}</span>
                  )}
                </div>
              )}

              {(process.internal_deadline || process.expiry_date) && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {process.internal_deadline && (
                    <span>
                      Interno:{' '}
                      {format(
                        new Date(process.internal_deadline),
                        'dd/MM/yyyy',
                        { locale: ptBR }
                      )}
                    </span>
                  )}
                  {process.expiry_date && (
                    <span>
                      • Legal:{' '}
                      {format(
                        new Date(process.expiry_date),
                        'dd/MM/yyyy',
                        { locale: ptBR }
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Valor */}
            {process.total_value && process.total_value > 0 && (
              <div className="flex items-center gap-1 pt-1 text-sm font-semibold text-primary">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(process.total_value)}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <Link to={`/processos/${process.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
