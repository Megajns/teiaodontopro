import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Package, Plus, Search, Edit, Trash2, AlertTriangle, TrendingDown } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useEstoque, type Estoque } from "@/hooks/useEstoque";
import { EstoqueForm } from "@/components/estoque/EstoqueForm";

export function ControleEstoque() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEstoque, setSelectedEstoque] = useState<Estoque | null>(null);

  const { estoques, isLoading, createEstoque, updateEstoque, deleteEstoque } = useEstoque();

  const filteredEstoque = estoques.filter(item =>
    item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = estoques.length;
    const estoqueBaixo = estoques.filter(item => item.estoque <= item.minimo && item.estoque > 0).length;
    const estoqueCritico = estoques.filter(item => item.estoque === 0 || item.estoque < item.minimo * 0.5).length;
    const valorTotal = estoques.reduce((acc, item) => acc + (item.estoque * item.valor_unitario), 0);

    return {
      totalItems,
      estoqueBaixo,
      estoqueCritico,
      valorTotal,
    };
  }, [estoques]);

  const handleCreate = () => {
    setSelectedEstoque(null);
    setFormOpen(true);
  };

  const handleEdit = (estoque: Estoque) => {
    setSelectedEstoque(estoque);
    setFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (data.id) {
      updateEstoque.mutate(data);
    } else {
      createEstoque.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    deleteEstoque.mutate(id);
  };

  const getStatus = (item: Estoque) => {
    if (item.estoque === 0 || item.estoque < item.minimo * 0.5) {
      return "Crítico";
    } else if (item.estoque <= item.minimo) {
      return "Baixo";
    }
    return "Normal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal": return "default";
      case "Baixo": return "secondary";
      case "Crítico": return "destructive";
      default: return "secondary";
    }
  };

  const columns = [
    { key: 'item' as const, header: 'Item', className: 'font-medium' },
    { key: 'codigo' as const, header: 'Código', className: 'hidden sm:table-cell' },
    { key: 'categoria' as const, header: 'Categoria', className: 'hidden md:table-cell' },
    { key: 'estoque' as const, header: 'Estoque', className: 'font-medium' },
    { 
      key: 'id' as const, 
      header: 'Status',
      render: (_value: string, item: Estoque) => (
        <Badge variant={getStatusColor(getStatus(item))}>
          {getStatus(item)}
        </Badge>
      )
    }
  ];

  const mobileCardRender = (item: Estoque) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-base">{item.item}</h3>
          <p className="text-sm text-muted-foreground">{item.codigo}</p>
        </div>
        <Badge variant={getStatusColor(getStatus(item))}>
          {getStatus(item)}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Package className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{item.categoria}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <TrendingDown className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Estoque: {item.estoque}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Min: {item.minimo} / Max: {item.maximo}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActions = (item: Estoque) => (
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Controle de Estoque</h1>
            <p className="text-muted-foreground">Gerencie o estoque de materiais da clínica</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Novo Item
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="ml-2 text-xs sm:text-sm font-medium truncate">Total de Itens</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold">{stats.totalItems}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span className="ml-2 text-xs sm:text-sm font-medium truncate">Estoque Baixo</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.estoqueBaixo}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="ml-2 text-xs sm:text-sm font-medium truncate">Estoque Crítico</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.estoqueCritico}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="ml-2 text-xs sm:text-sm font-medium truncate">Valor Total</span>
              </div>
              <div className="mt-2">
                <div className="text-lg sm:text-2xl font-bold">
                  R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5" />
              Itens do Estoque
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
              data={filteredEstoque}
              columns={columns}
              mobileCardRender={mobileCardRender}
              actions={renderActions}
              loading={isLoading}
              emptyState={{
                icon: Package,
                title: searchTerm ? "Nenhum item encontrado" : "Nenhum item no estoque",
                description: searchTerm 
                  ? "Não encontramos itens com os termos pesquisados. Tente ajustar os filtros."
                  : "Você ainda não possui itens cadastrados no estoque. Adicione seu primeiro item para começar o controle.",
                actionLabel: searchTerm ? undefined : "Novo Item",
                onAction: searchTerm ? undefined : handleCreate
              }}
            />
          </CardContent>
        </Card>
      </div>

      <EstoqueForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        estoque={selectedEstoque}
      />
    </DashboardLayout>
  );
}
