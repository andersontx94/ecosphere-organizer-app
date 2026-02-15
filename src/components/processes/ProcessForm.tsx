import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { useEnterprisesByClient } from '@/hooks/useEnterprises';
import { useProcessTypes, useLicenseTypes } from '@/hooks/useProcessTypes';
import { toast } from 'sonner';

const processSchema = z.object({
  process_type: z.string().min(1, 'Tipo de processo é obrigatório'),
  agency: z.string().min(1, 'Órgão ambiental é obrigatório'),
  client_id: z.string().optional(),
  enterprise_id: z.string().optional(),
  license_type_id: z.string().optional(),
  process_number: z.string().optional(),
  protocol_date: z.string().optional(),
  expiry_date: z.string().optional(),
  internal_deadline: z.string().optional(),
  total_value: z.string().optional(),
  status: z.string().default('em_elaboracao'),
  notes: z.string().optional(),
});

type ProcessFormData = z.infer<typeof processSchema>;

interface ProcessFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

const PROCESS_STATUSES = [
  { value: 'em_elaboracao', label: 'Em Elaboração' },
  { value: 'protocolado', label: 'Protocolado' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'exigencia', label: 'Em Exigência' },
  { value: 'deferido', label: 'Deferido' },
  { value: 'indeferido', label: 'Indeferido' },
];

const AGENCIES = [
  'IBAMA',
  'SEMA',
  'SEMAD',
  'CETESB',
  'INEA',
  'FEPAM',
  'IAP',
  'IMA',
  'FATMA',
  'IEMA',
  'Prefeitura Municipal',
  'Outro',
];

export function ProcessForm({ open, onOpenChange, onSubmit, initialData, isEditing }: ProcessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(initialData?.client_id);
  const [showLicenseFields, setShowLicenseFields] = useState(false);

  const { data: clients } = useClients();
  const { data: enterprises } = useEnterprisesByClient(selectedClientId);
  const { data: processTypes } = useProcessTypes();
  const { data: licenseTypes } = useLicenseTypes();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProcessFormData>({
    resolver: zodResolver(processSchema),
    defaultValues: initialData || {
      status: 'em_elaboracao',
    },
  });

  const watchProcessType = watch('process_type');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setSelectedClientId(initialData.client_id);
    }
  }, [initialData, reset]);

  useEffect(() => {
    const processType = processTypes?.find(pt => pt.name === watchProcessType);
    setShowLicenseFields(processType?.is_licensing || false);
  }, [watchProcessType, processTypes]);

  const handleFormSubmit = async (data: ProcessFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        client_id: data.client_id || null,
        enterprise_id: data.enterprise_id || null,
        license_type_id: data.license_type_id || null,
        total_value: data.total_value ? parseFloat(data.total_value) : 0,
      });
      reset();
      onOpenChange(false);
      toast.success(isEditing ? 'Processo atualizado!' : 'Processo criado!');
    } catch (error) {
      toast.error('Erro ao salvar processo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Processo' : 'Novo Processo Ambiental'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="process_type">Tipo de Processo *</Label>
              <Select
                value={watch('process_type')}
                onValueChange={(value) => setValue('process_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {processTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.process_type && (
                <p className="text-sm text-destructive">{errors.process_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency">Órgão Ambiental *</Label>
              <Select
                value={watch('agency')}
                onValueChange={(value) => setValue('agency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  {AGENCIES.map((agency) => (
                    <SelectItem key={agency} value={agency}>
                      {agency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.agency && (
                <p className="text-sm text-destructive">{errors.agency.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente</Label>
              <Select
                value={watch('client_id') || ''}
                onValueChange={(value) => {
                  setValue('client_id', value);
                  setSelectedClientId(value);
                  setValue('enterprise_id', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enterprise_id">Empreendimento</Label>
              <Select
                value={watch('enterprise_id') || ''}
                onValueChange={(value) => setValue('enterprise_id', value)}
                disabled={!selectedClientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedClientId ? "Selecione" : "Selecione um cliente primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {enterprises?.map((enterprise) => (
                    <SelectItem key={enterprise.id} value={enterprise.id}>
                      {enterprise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showLicenseFields && (
            <div className="space-y-2">
              <Label htmlFor="license_type_id">Tipo de Licença</Label>
              <Select
                value={watch('license_type_id') || ''}
                onValueChange={(value) => setValue('license_type_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de licença" />
                </SelectTrigger>
                <SelectContent>
                  {licenseTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.code} - {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="process_number">Número do Processo</Label>
              <Input
                id="process_number"
                {...register('process_number')}
                placeholder="Ex: 123456/2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROCESS_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="protocol_date">Data Protocolo</Label>
              <Input
                id="protocol_date"
                type="date"
                {...register('protocol_date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Prazo Legal</Label>
              <Input
                id="expiry_date"
                type="date"
                {...register('expiry_date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_deadline">Prazo Interno</Label>
              <Input
                id="internal_deadline"
                type="date"
                {...register('internal_deadline')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_value">Valor Total do Serviço (R$)</Label>
            <Input
              id="total_value"
              type="number"
              step="0.01"
              {...register('total_value')}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações sobre o processo..."
              rows={3}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-4 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full md:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Processo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
