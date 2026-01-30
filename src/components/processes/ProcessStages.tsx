import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  status: 'pending' | 'current' | 'done';
  date?: string;
}

interface ProcessStagesProps {
  stages: Stage[];
}

export function ProcessStages({ stages }: ProcessStagesProps) {
  const getIcon = (status: Stage['status']) => {
    if (status === 'done') return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === 'current') return <Clock className="h-4 w-4 text-primary" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const getBadge = (status: Stage['status']) => {
    if (status === 'done') return <Badge variant="secondary">Concluído</Badge>;
    if (status === 'current') return <Badge>Em andamento</Badge>;
    return <Badge variant="outline">Pendente</Badge>;
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="font-medium">Etapas do Processo</h3>

        <div className="space-y-3">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex items-center justify-between border rounded-md p-3"
            >
              <div className="flex items-center gap-3">
                {getIcon(stage.status)}
                <div>
                  <div className="font-medium">{stage.name}</div>
                  {stage.date && (
                    <div className="text-sm text-muted-foreground">
                      {stage.date}
                    </div>
                  )}
                </div>
              </div>

              {getBadge(stage.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
