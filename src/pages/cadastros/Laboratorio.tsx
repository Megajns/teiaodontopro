import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FlaskConical, Plus, Search, Edit, Trash2, Calendar, DollarSign } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useLaboratorio, type Laboratorio } from "@/hooks/useLaboratorio";
import { LaboratorioForm } from "@/components/laboratorio/LaboratorioForm";
import { format } from "date-fns";

export function Laboratorio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<Laboratorio | null>(null);

  const { laboratorios, isLoading, createLaboratorio, updateLaboratorio, deleteLaboratorio } = useLaboratorio();

  const filteredLaboratorio = laboratorios.filter(item =>
    item.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.procedimento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedLaboratorio(null);
    setFormOpen(true);
  };

  const handleEdit = (laboratorio: Laboratorio) => {
    setSelectedLaboratorio(laboratorio);
    setFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (data.id) {
      updateLaboratorio.mutate(data);
    } else {
      createLaboratorio.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    deleteLaboratorio.mutate(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído": return "default";
      case "Em Produção": return "secondary";
      case "Enviado": return "outline";
      case "Cancelado": return "destructive";
      default: return "secondary";
    }
  };

  const columns = [
    { key: 'paciente' as const, header: 'Paciente', className: 'font-medium' },
    { key: 'procedimento' as const, header: 'Procedimento' },
    { key: 'laboratorio' as const, header: 'Laboratório', className: 'hidden md:table-cell' },
    { 
      key: 'data_envio' as const, 
      header: 'Data Envio', 
      className: 'hidden lg:table-cell',
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy')
    },
    { 
      key: 'data_retorno' as const, 
      header: 'Data Retorno', 
      className: 'hidden lg:table-cell',
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy')
    },
    { 
      key: 'status' as const, 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'valor' as const, 
      header: 'Valor', 
      className: 'hidden sm:table-cell font-medium',
      render: (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  ];

  const mobileCardRender = (item: Laboratorio) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-base">{item.paciente}</h3>
          <p className="text-sm text-muted-foreground">{item.procedimento}</p>
        </div>
        <Badge variant={getStatusColor(item.status)}>
          {item.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <FlaskConical className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{item.laboratorio}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Envio: {format(new Date(item.data_envio), 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Retorno: {format(new Date(item.data_retorno), 'dd/MM/yyyy')}</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="font-medium">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );

  const renderActions = (item: Laboratorio) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleEdit(item)}>
        <Edit className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Editar</span>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-destructive h-8 px-2">
            <Trash2 className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Excluir</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço do paciente <strong>{item.paciente}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(item.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Laboratório</h1>
            <p className="text-muted-foreground">Gerencie os serviços de laboratório</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Novo Serviço
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FlaskConical className="w-5 h-5" />
              Serviços de Laboratório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar por paciente ou procedimento..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <MobileTable
              data={filteredLaboratorio}
              columns={columns}
              mobileCardRender={mobileCardRender}
              actions={renderActions}
              loading={isLoading}
              emptyState={{
                icon: FlaskConical,
                title: searchTerm ? "Nenhum serviço encontrado" : "Nenhum serviço de laboratório cadastrado",
                description: searchTerm 
                  ? "Não encontramos serviços com os termos pesquisados. Tente ajustar os filtros."
                  : "Você ainda não possui serviços de laboratório cadastrados. Adicione seu primeiro serviço para começar.",
                actionLabel: searchTerm ? undefined : "Novo Serviço",
                onAction: searchTerm ? undefined : handleCreate
              }}
            />
          </CardContent>
        </Card>
      </div>

      <LaboratorioForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        laboratorio={selectedLaboratorio}
      />
    </DashboardLayout>
  );
}
