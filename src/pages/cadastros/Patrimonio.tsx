import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Plus, Search, Edit, Trash2, Calendar, DollarSign, Building } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { usePatrimonio, type Patrimonio } from "@/hooks/usePatrimonio";
import { PatrimonioForm } from "@/components/patrimonio/PatrimonioForm";
import { format } from "date-fns";

export function Patrimonio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPatrimonio, setSelectedPatrimonio] = useState<Patrimonio | null>(null);

  const { patrimonios, isLoading, createPatrimonio, updatePatrimonio, deletePatrimonio } = usePatrimonio();

  const filteredPatrimonio = patrimonios.filter(item =>
    item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedPatrimonio(null);
    setFormOpen(true);
  };

  const handleEdit = (patrimonio: Patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    setFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (data.id) {
      updatePatrimonio.mutate(data);
    } else {
      createPatrimonio.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    deletePatrimonio.mutate(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "default";
      case "Manutenção": return "secondary";
      case "Inativo": return "outline";
      default: return "secondary";
    }
  };

  const columns = [
    { key: 'item' as const, header: 'Item', className: 'font-medium' },
    { key: 'codigo' as const, header: 'Código', className: 'hidden sm:table-cell' },
    { key: 'categoria' as const, header: 'Categoria' },
    { 
      key: 'valor' as const, 
      header: 'Valor', 
      className: 'hidden md:table-cell font-medium',
      render: (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    { 
      key: 'data_aquisicao' as const, 
      header: 'Data Aquisição', 
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
    }
  ];

  const mobileCardRender = (item: Patrimonio) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-base">{item.item}</h3>
          <p className="text-sm text-muted-foreground">{item.codigo}</p>
        </div>
        <Badge variant={getStatusColor(item.status)}>
          {item.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Building className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{item.categoria}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{format(new Date(item.data_aquisicao), 'dd/MM/yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActions = (item: Patrimonio) => (
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
              Tem certeza que deseja excluir o item <strong>{item.item}</strong>? 
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Patrimônio</h1>
            <p className="text-muted-foreground">Gerencie o patrimônio da clínica</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Novo Item
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Lista de Patrimônio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar por item ou código..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <MobileTable
              data={filteredPatrimonio}
              columns={columns}
              mobileCardRender={mobileCardRender}
              actions={renderActions}
              loading={isLoading}
              emptyState={{
                icon: Shield,
                title: searchTerm ? "Nenhum item encontrado" : "Nenhum item de patrimônio cadastrado",
                description: searchTerm 
                  ? "Não encontramos itens com os termos pesquisados. Tente ajustar os filtros."
                  : "Você ainda não possui itens de patrimônio cadastrados. Adicione seu primeiro item para começar.",
                actionLabel: searchTerm ? undefined : "Novo Item",
                onAction: searchTerm ? undefined : handleCreate
              }}
            />
          </CardContent>
        </Card>
      </div>

      <PatrimonioForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        patrimonio={selectedPatrimonio}
      />
    </DashboardLayout>
  );
}
