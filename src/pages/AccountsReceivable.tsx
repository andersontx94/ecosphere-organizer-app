import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, TrendingUp, Search, CheckCircle } from 'lucide-react';
import { 
  useAccountsReceivable, 
  useCreateAccountReceivable, 
  useUpdateAccountReceivable, 
  useDeleteAccountReceivable,
  type AccountReceivableWithRelations 
} from '@/hooks/useFinancial';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const receivableSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  status: z.string().default('em_aberto'),
  client_id: z.string().optional(),
  project_id: z.string().optional(),
  notes: z.string().optional(),
});

type ReceivableFormData = z.infer<typeof receivableSchema>;

export default function AccountsReceivable() {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AccountReceivableWithRelations | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: receivables, isLoading } = useAccountsReceivable();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const createReceivable = useCreateAccountReceivable();
  const updateReceivable = useUpdateAccountReceivable();
  const deleteReceivable = useDeleteAccountReceivable();

  const form = useForm<ReceivableFormData>({
    resolver: zodResolver(receivableSchema),
    defaultValues: {
      description: '',
      amount: '',
      due_date: '',
      status: 'em_aberto',
      client_id: '',
      project_id: '',
      notes: '',
    },
  });

  const onSubmit = async (data: ReceivableFormData) => {
    try {
      const payload = {
        description: data.description,
        amount: parseFloat(data.amount),
        due_date: data.due_date,
        status: data.status as 'em_aberto' | 'recebido',
        client_id: data.client_id && data.client_id !== 'none' ? data.client_id : null,
        project_id: data.project_id && data.project_id !== 'none' ? data.project_id : null,
        notes: data.notes || null,
        received_at: data.status === 'recebido' ? new Date().toISOString() : null,
      };

      if (editingItem) {
        await updateReceivable.mutateAsync({ id: editingItem.id, data: payload });
        toast.success('Conta atualizada com sucesso!');
      } else {
        await createReceivable.mutateAsync(payload);
        toast.success('Conta criada com sucesso!');
      }

      setOpen(false);
      setEditingItem(null);
      form.reset();
    } catch {
      toast.error('Erro ao salvar conta');
    }
  };

  const handleEdit = (item: AccountReceivableWithRelations) => {
    setEditingItem(item);
    form.reset({
      description: item.description,
      amount: item.amount.toString(),
      due_date: item.due_date,
      status: item.status || 'em_aberto',
      client_id: item.client_id || '',
      project_id: item.project_id || '',
      notes: item.notes || '',
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await deleteReceivable.mutateAsync(id);
        toast.success('Conta excluída com sucesso!');
      } catch {
        toast.error('Erro ao excluir conta');
      }
    }
  };

  const handleMarkAsReceived = async (item: AccountReceivableWithRelations) => {
    try {
      await updateReceivable.mutateAsync({
        id: item.id,
        data: { status: 'recebido', received_at: new Date().toISOString() },
      });
      toast.success('Conta marcada como recebida!');
    } catch {
      toast.error('Erro ao atualizar conta');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingItem(null);
      form.reset();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredItems = receivables?.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = receivables?.filter(r => r.status === 'em_aberto').reduce((sum, r) => sum + r.amount, 0) || 0;
  const totalReceived = receivables?.filter(r => r.status === 'recebido').reduce((sum, r) => sum + r.amount, 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Contas a Receber
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas entradas financeiras
            </p>
          </div>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Entrada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Conta' : 'Nova Conta a Receber'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Serviço de licenciamento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor (R$) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0,00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vencimento *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="client_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
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
                      name="project_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serviço</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {projects?.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="em_aberto">Em Aberto</SelectItem>
                            <SelectItem value="recebido">Recebido</SelectItem>
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
                          <Textarea placeholder="Observações..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createReceivable.isPending || updateReceivable.isPending}>
                      {editingItem ? 'Salvar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Aberto</p>
                  <p className="text-xl font-bold text-warning">{formatCurrency(totalPending)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recebido</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(totalReceived)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="em_aberto">Em Aberto</SelectItem>
              <SelectItem value="recebido">Recebido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Entradas ({filteredItems?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : !filteredItems?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Nenhuma conta a receber</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.clients?.name || '-'}</TableCell>
                        <TableCell className="font-semibold text-success">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {format(new Date(item.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                            {item.status === 'em_aberto' && isOverdue(item.due_date) && (
                              <Badge variant="destructive" className="text-xs">Vencido</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.status === 'recebido' ? (
                            <Badge className="bg-success/20 text-success">Recebido</Badge>
                          ) : (
                            <Badge variant="outline">Em Aberto</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {item.status === 'em_aberto' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMarkAsReceived(item)}
                                title="Marcar como recebido"
                              >
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
