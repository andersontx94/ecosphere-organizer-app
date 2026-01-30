import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument, getDocumentStatus } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { useEnterprises } from '@/hooks/useEnterprises';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, FileText, Search, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['documents']['Row'];

const documentSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(100),
  document_type: z.enum(['licenca', 'relatorio', 'autorizacao', 'certidao', 'outro']),
  client_id: z.string().optional().nullable(),
  enterprise_id: z.string().optional().nullable(),
  issue_date: z.string().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

const documentTypeLabels: Record<string, string> = {
  licenca: 'Licença',
  relatorio: 'Relatório',
  autorizacao: 'Autorização',
  certidao: 'Certidão',
  outro: 'Outro',
};

function DocumentForm({ 
  document, 
  defaultEnterpriseId,
  onSuccess 
}: { 
  document?: Document | null;
  defaultEnterpriseId?: string;
  onSuccess: () => void;
}) {
  const { data: clients } = useClients();
  const { data: enterprises } = useEnterprises();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const isEditing = !!document;

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: document?.name || '',
      document_type: document?.document_type || 'licenca',
      client_id: document?.client_id || '',
      enterprise_id: document?.enterprise_id || defaultEnterpriseId || '',
      issue_date: document?.issue_date || '',
      expiry_date: document?.expiry_date || '',
      notes: document?.notes || '',
    },
  });

  const selectedClientId = form.watch('client_id');
  const filteredEnterprises = enterprises?.filter(e => 
    !selectedClientId || selectedClientId === 'none' || e.client_id === selectedClientId
  );

  const onSubmit = async (data: DocumentFormData) => {
    try {
      const payload = {
        name: data.name,
        document_type: data.document_type,
        client_id: data.client_id && data.client_id !== 'none' ? data.client_id : null,
        enterprise_id: data.enterprise_id && data.enterprise_id !== 'none' ? data.enterprise_id : null,
        issue_date: data.issue_date || null,
        expiry_date: data.expiry_date || null,
        notes: data.notes || null,
      };

      if (isEditing && document) {
        await updateDocument.mutateAsync({ id: document.id, data: payload });
        toast.success('Documento atualizado');
      } else {
        await createDocument.mutateAsync(payload);
        toast.success('Documento cadastrado');
      }
      onSuccess();
    } catch (error) {
      toast.error('Erro ao salvar documento');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Documento *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Licença de Operação - LO" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
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
          name="enterprise_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empreendimento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {filteredEnterprises?.map((enterprise) => (
                    <SelectItem key={enterprise.id} value={enterprise.id}>
                      {enterprise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Emissão</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Validade</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          <Button type="submit" disabled={createDocument.isPending || updateDocument.isPending}>
            {isEditing ? 'Salvar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Documents() {
  const [searchParams] = useSearchParams();
  const enterpriseIdFilter = searchParams.get('empreendimento');
  
  const { data: documents, isLoading } = useDocuments();
  const { data: enterprises } = useEnterprises();
  const deleteDocument = useDeleteDocument();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string>(enterpriseIdFilter || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (enterpriseIdFilter) {
      setSelectedEnterpriseId(enterpriseIdFilter);
    }
  }, [enterpriseIdFilter]);

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnterprise = selectedEnterpriseId === 'all' || doc.enterprise_id === selectedEnterpriseId;
    const docStatus = getDocumentStatus(doc.expiry_date);
    const matchesStatus = statusFilter === 'all' || docStatus === statusFilter;
    return matchesSearch && matchesEnterprise && matchesStatus;
  });

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument.mutateAsync(id);
      toast.success('Documento excluído');
    } catch (error) {
      toast.error('Erro ao excluir documento');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingDocument(null);
  };

  const getStatusBadge = (expiryDate: string | null) => {
    const status = getDocumentStatus(expiryDate);
    switch (status) {
      case 'valido':
        return <Badge variant="default" className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />Válido</Badge>;
      case 'proximo_vencimento':
        return <Badge variant="outline" className="border-warning text-warning"><AlertTriangle className="h-3 w-3 mr-1" />Próximo do Vencimento</Badge>;
      case 'vencido':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Vencido</Badge>;
    }
  };

  const selectedEnterprise = enterprises?.find(e => e.id === enterpriseIdFilter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Documentos
            </h1>
            <p className="text-muted-foreground mt-1">
              {selectedEnterprise 
                ? `Documentos de ${selectedEnterprise.name}`
                : 'Gerencie licenças, relatórios e documentos ambientais'}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingDocument(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDocument ? 'Editar Documento' : 'Novo Documento'}
                </DialogTitle>
              </DialogHeader>
              <DocumentForm 
                document={editingDocument}
                defaultEnterpriseId={enterpriseIdFilter || undefined}
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
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedEnterpriseId} onValueChange={setSelectedEnterpriseId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Empreendimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {enterprises?.map((enterprise) => (
                <SelectItem key={enterprise.id} value={enterprise.id}>
                  {enterprise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="valido">Válido</SelectItem>
              <SelectItem value="proximo_vencimento">Próximo do Vencimento</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents List */}
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
        ) : filteredDocuments?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-center">
                {searchTerm || selectedEnterpriseId !== 'all' || statusFilter !== 'all'
                  ? 'Nenhum documento encontrado' 
                  : 'Nenhum documento cadastrado'}
              </p>
              {!searchTerm && selectedEnterpriseId === 'all' && statusFilter === 'all' && (
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar primeiro documento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments?.map((doc) => (
              <Card key={doc.id} className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{doc.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {documentTypeLabels[doc.document_type]}
                      </p>
                    </div>
                    {doc.expiry_date && getStatusBadge(doc.expiry_date)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {doc.enterprises?.name && (
                    <p className="text-sm font-medium text-primary">
                      {doc.enterprises.name}
                    </p>
                  )}
                  {doc.clients?.name && (
                    <p className="text-sm text-muted-foreground">
                      Cliente: {doc.clients.name}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {doc.issue_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Emissão: {format(new Date(doc.issue_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    )}
                  </div>
                  {doc.expiry_date && (
                    <p className="text-sm text-muted-foreground">
                      Validade: {format(new Date(doc.expiry_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-end pt-2 border-t gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
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
                          <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(doc.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
