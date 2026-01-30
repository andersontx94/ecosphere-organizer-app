import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, Trash2 } from 'lucide-react';

interface CostItem {
  id: string;
  label: string;
  value: number;
}

interface ProcessFinancialsProps {
  totalValue: number;
}

export function ProcessFinancials({ totalValue }: ProcessFinancialsProps) {
  const [costs, setCosts] = useState<CostItem[]>([
    { id: '1', label: 'Taxa ambiental', value: 1200 },
    { id: '2', label: 'Parceiro técnico', value: 1800 },
  ]);

  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState<number | ''>('');

  const totalCosts = costs.reduce((sum, c) => sum + c.value, 0);
  const profit = totalValue - totalCosts;

  const addCost = () => {
    if (!newLabel || !newValue) return;

    setCosts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: newLabel,
        value: Number(newValue),
      },
    ]);

    setNewLabel('');
    setNewValue('');
  };

  const removeCost = (id: string) => {
    setCosts((prev) => prev.filter((c) => c.id !== id));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 font-medium">
          <DollarSign className="h-4 w-4" />
          Financeiro do Processo
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Valor cobrado</div>
            <div className="font-semibold">
              {formatCurrency(totalValue)}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Custos</div>
            <div className="font-semibold">
              {formatCurrency(totalCosts)}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Lucro</div>
            <div
              className={`font-semibold ${
                profit >= 0 ? 'text-success' : 'text-destructive'
              }`}
            >
              {formatCurrency(profit)}
            </div>
          </div>
        </div>

        {/* Lista de custos */}
        <div className="space-y-2">
          {costs.map((cost) => (
            <div
              key={cost.id}
              className="flex items-center justify-between gap-2 border rounded-md p-2"
            >
              <div>
                <div className="text-sm font-medium">{cost.label}</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(cost.value)}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCost(cost.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          {costs.length === 0 && (
            <Badge variant="secondary">Nenhum custo cadastrado</Badge>
          )}
        </div>

        {/* Adicionar custo */}
        <div className="flex flex-col md:flex-row gap-2 pt-2">
          <Input
            placeholder="Descrição do custo"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Valor"
            value={newValue}
            onChange={(e) =>
              setNewValue(e.target.value ? Number(e.target.value) : '')
            }
          />
          <Button onClick={addCost}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
