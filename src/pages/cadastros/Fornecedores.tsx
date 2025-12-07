import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Truck, Plus, Search, Edit, Trash2, Phone, Mail, Building } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useFornecedores, Fornecedor } from "@/hooks/useFornecedores";
import { FornecedorForm } from "@/components/fornecedores/FornecedorForm";

export function Fornecedores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const { fornecedores, loading, createFornecedor, updateFornecedor, deleteFornecedor } = useFornecedores();

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fornecedor.cnpj && fornecedor.cnpj.includes(searchTerm))
  );

  const handleOpenForm = (fornecedor?: Fornecedor) => {
    setEditingFornecedor(fornecedor || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFornecedor(null);
  };

  const handleSubmitForm = async (data: any) => {
    if (editingFornecedor) {
      return await updateFornecedor(editingFornecedor.id, data);
    } else {
      return await createFornecedor(data);
    }
  };

  const handleDeleteFornecedor = async (id: string) => {
    await deleteFornecedor(id);
  };

  const columns = [
    { key: 'nome' as const, header: 'Nome', className: 'font-medium' },
    { key: 'cnpj' as const, header: 'CNPJ', className: 'hidden sm:table-cell' },
    { key: 'telefone' as const, header: 'Telefone', className: 'hidden md:table-cell' },
    { key: 'email' as const, header: 'Email', className: 'hidden lg:table-cell' },
    { key: 'categoria' as const, header: 'Categoria' },
    { 
      key: 'status' as const, 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={value === "Ativo" ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    }
  ];

  const mobileCardRender = (fornecedor: Fornecedor) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-base">{fornecedor.nome}</h3>
          <p className="text-sm text-muted-foreground">{fornecedor.cnpj || "CNPJ não informado"}</p>
        </div>
        <Badge variant={fornecedor.status === "Ativo" ? "default" : "secondary"}>
          {fornecedor.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Building className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{fornecedor.categoria}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{fornecedor.telefone}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{fornecedor.email}</span>
        </div>
      </div>
    </div>
  );

  const renderActions = (fornecedor: Fornecedor) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleOpenForm(fornecedor)}>
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
            <AlertDialogTitle>Excluir fornecedor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor "{fornecedor.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteFornecedor(fornecedor.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground">Gerencie os fornecedores da clínica</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4" />
            Novo Fornecedor
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="w-5 h-5" />
              Lista de Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar por nome ou CNPJ..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando fornecedores...</p>
                </div>
              </div>
            ) : filteredFornecedores.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? "Tente ajustar os termos de busca para encontrar o fornecedor desejado." 
                    : "Comece adicionando o primeiro fornecedor da sua clínica."
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => handleOpenForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Fornecedor
                  </Button>
                )}
              </div>
            ) : (
              <MobileTable
                data={filteredFornecedores}
                columns={columns}
                mobileCardRender={mobileCardRender}
                actions={renderActions}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <FornecedorForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        fornecedor={editingFornecedor}
        title={editingFornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
      />
    </DashboardLayout>
  );
}