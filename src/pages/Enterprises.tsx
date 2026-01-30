import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEnterprises, useCreateEnterprise, useUpdateEnterprise, useDeleteEnterprise } from '@/hooks/useEnterprises';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Building2, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Enterprise = Database['public']['Tables']['enterprises']['Row'];

const enterpriseSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(100),
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  activity_type: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type EnterpriseFormData = z.infer<typeof enterpriseSchema>;

function EnterpriseForm({ 
  enterprise, 
  defaultClientId,
  onSuccess 
}: { 
  enterprise?: Enterprise | null;
  defaultClientId?: string;
  onSuccess: () => void;
}) {
  const { data: clients } = useClients();
  const createEnterprise = useCreateEnterprise();
  const updateEnterprise = useUpdateEnterprise();
  const isEditing = !!enterprise;

  const form = useForm<EnterpriseFormData>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: {
      name: enterprise?.name || '',
      client_id: enterprise?.client_id || defaultClientId || '',
      activity_type: enterprise?.activity_type || '',
      address: enterprise?.address || '',
      status: enterprise?.status || 'ativo',
      notes: enterprise?.notes || '',
    },
  });

  const onSubmit = async (data: EnterpriseFormData) => {
    try {
      const payload = {
        name: data.name,
        client_id: data.client_id,
        status: data.status || 'ativo',
        activity_type: data.activity_type || null,
        address: data.address || null,
        notes: data.notes || null,
      };

      if (isEditing && enterprise) {
        await updateEnterprise.mutateAsync({ id: enterprise.id, data: payload });
        toast.success('Empreendimento atualizado');
      } else {
        await createEnterprise.mutateAsync(payload);
        toast.success('Empreendimento cadastrado');
      }
      onSuccess();
    } catch (error) {
      toast.error('Erro ao salvar empreendimento');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Empreendimento *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Fazenda São João" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activity_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Atividade</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Agropecuária, Indústria, Comércio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Endereço completo do empreendimento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="em_regularizacao">Em Regularização</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações técnicas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={createEnterprise.isPending || updateEnterprise.isPending}>
            {isEditing ? 'Salvar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Enterprises() {
  const [searchParams] = useSearchParams();
  const clientIdFilter = searchParams.get('cliente');
  
  const { data: enterprises, isLoading } = useEnterprises();
  const { data: clients } = useClients();
  const deleteEnterprise = useDeleteEnterprise();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(clientIdFilter || 'all');

  useEffect(() => {
    if (clientIdFilter) {
      setSelectedClientId(clientIdFilter);
    }
  }, [clientIdFilter]);

  const filteredEnterprises = enterprises?.filter(enterprise => {
    const matchesSearch = enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enterprise.activity_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = selectedClientId === 'all' || enterprise.client_id === selectedClientId;
    return matchesSearch && matchesClient;
  });

  const handleEdit = (enterprise: Enterprise) => {
    setEditingEnterprise(enterprise);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEnterprise.mutateAsync(id);
      toast.success('Empreendimento excluído');
    } catch (error) {
      toast.error('Erro ao excluir empreendimento');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingEnterprise(null);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default">Ativo</Badge>;
      case 'inativo':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'em_regularizacao':
        return <Badge variant="outline" className="border-warning text-warning">Em Regularização</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const selectedClient = clients?.find(c => c.id === clientIdFilter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Empreendimentos
            </h1>
            <p className="text-muted-foreground mt-1">
              {selectedClient 
                ? `Empreendimentos de ${selectedClient.name}`
                : 'Gerencie os empreendimentos dos seus clientes'}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEnterprise(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Empreendimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEnterprise ? 'Editar Empreendimento' : 'Novo Empreendimento'}
                </DialogTitle>
              </DialogHeader>
              <EnterpriseForm 
                enterprise={editingEnterprise}
                defaultClientId={clientIdFilter || undefined}
                onSuccess={handleDialogClose}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou atividade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Enterprises List */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEnterprises?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-center">
                {searchTerm || selectedClientId !== 'all' 
                  ? 'Nenhum empreendimento encontrado' 
                  : 'Nenhum empreendimento cadastrado'}
              </p>
              {!searchTerm && selectedClientId === 'all' && (
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar primeiro empreendimento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEnterprises?.map((enterprise) => (
              <Card key={enterprise.id} className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{enterprise.name}</CardTitle>
                      <p className="text-sm text-primary font-medium">
                        {enterprise.clients?.name || 'Cliente não vinculado'}
                      </p>
                    </div>
                    {getStatusBadge(enterprise.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {enterprise.activity_type && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Atividade:</span> {enterprise.activity_type}
                    </p>
                  )}
                  {enterprise.address && (
                    <p className="text-sm text-muted-foreground truncate">
                      {enterprise.address}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/documentos?empreendimento=${enterprise.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Documentos
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(enterprise)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir empreendimento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Todos os documentos relacionados serão perdidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(enterprise.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
